from __future__ import annotations

import asyncio
import uuid
from datetime import datetime
from typing import Dict

from .agents import (
    ActionExecutionAgent,
    DiagnosticAgent,
    EscalationDecisionAgent,
    IntentDetectionAgent,
    VerificationAgent,
    WorkflowContext,
)
from .models import (
    WorkflowState,
    WorkflowStatus,
    WorkflowStage,
    WorkflowType,
    WorkflowTriggerRequest,
)


class WorkflowEngine:
    """
    Orchestrates agentic workflows as state machines.

    In a production system this would likely be implemented using a durable orchestrator
    (e.g. Temporal, LangGraph, Step Functions). Here we model the orchestration logic
    explicitly to keep it easy to follow and test.
    """

    def __init__(self) -> None:
        self._runs: Dict[str, WorkflowState] = {}
        self._lock = asyncio.Lock()

        # Reusable agent instances
        self.intent_agent = IntentDetectionAgent()
        self.diagnostic_agent = DiagnosticAgent()
        self.action_agent = ActionExecutionAgent()
        self.verification_agent = VerificationAgent()
        self.escalation_agent = EscalationDecisionAgent()

    async def trigger(self, req: WorkflowTriggerRequest) -> WorkflowState:
        """
        Create a new workflow instance and start orchestration in the background.
        """
        workflow_type = req.workflow_type or await self._infer_workflow_type(req)
        workflow_id = str(uuid.uuid4())

        state = WorkflowState(
            id=workflow_id,
            workflow_type=workflow_type,
            status=WorkflowStatus.pending,
            stage=WorkflowStage.triggered,
            diagnosis={"intent": workflow_type.value},
        )

        async with self._lock:
            self._runs[workflow_id] = state

        ctx = WorkflowContext(
            workflow_id=workflow_id,
            workflow_type=workflow_type,
            interaction=req.interaction,
            device=req.device,
            telemetry=req.telemetry,
            entitlement=req.entitlement,
        )

        # Fire-and-forget orchestration in the background
        asyncio.create_task(self._run_workflow(ctx, state))
        return state

    async def _infer_workflow_type(self, req: WorkflowTriggerRequest) -> WorkflowType:
        # Simple reuse of the IntentDetectionAgent
        tmp_state = WorkflowState(
            id=str(uuid.uuid4()),
            workflow_type=WorkflowType.printer_offline,  # placeholder; will be overwritten
        )
        ctx = WorkflowContext(
            workflow_id=tmp_state.id,
            workflow_type=tmp_state.workflow_type,
            interaction=req.interaction,
            device=req.device,
            telemetry=req.telemetry,
            entitlement=req.entitlement,
        )
        result = await self.intent_agent.run(ctx, tmp_state)
        intent_value = (result.diagnosis or {}).get("intent", WorkflowType.printer_offline.value)
        try:
            return WorkflowType(intent_value)
        except ValueError:
            return WorkflowType.printer_offline

    async def _run_workflow(self, ctx: WorkflowContext, state: WorkflowState) -> None:
        """
        Execute the state machine:
          - Diagnosis
          - Action
          - Verification
          - (optional) second attempt
          - Escalation decision
        """
        try:
            state.status = WorkflowStatus.running
            state.stage = WorkflowStage.diagnosing
            state.attempts = 1

            # 1) Diagnostic
            state = await self.diagnostic_agent.run(ctx, state)
            await self._persist(state)

            # 2) Action
            state = await self.action_agent.run(ctx, state)
            await self._persist(state)

            # 3) Verification
            state = await self.verification_agent.run(ctx, state)
            await self._persist(state)

            # 4) Optional second attempt if verification failed and rules allow
            if state.verification and not state.verification.success:
                state.attempts += 1
                # For printer_offline we allow up to 2 attempts before escalation
                if ctx.workflow_type == WorkflowType.printer_offline and state.attempts <= 2:
                    state.stage = WorkflowStage.diagnosing
                    state.logs.append(
                        {
                            "timestamp": datetime.utcnow(),
                            "level": "info",
                            "message": "Verification failed; retrying automated remediation.",
                            "data": {"attempt": state.attempts},
                        }
                    )
                    # Re-run diagnostics and actions with updated attempt count
                    state = await self.diagnostic_agent.run(ctx, state)
                    await self._persist(state)
                    state = await self.action_agent.run(ctx, state)
                    await self._persist(state)
                    state = await self.verification_agent.run(ctx, state)
                    await self._persist(state)

            # 5) Escalation / Closure
            state = await self.escalation_agent.run(ctx, state)
            # Generate summary & resolution text
            state = self._generate_summary(state)
            await self._persist(state)

        except Exception as exc:  # pragma: no cover - defensive
            state.status = WorkflowStatus.failed
            state.stage = WorkflowStage.failed
            state.logs.append(
                {
                    "timestamp": datetime.utcnow(),
                    "level": "error",
                    "message": "Workflow execution failed",
                    "data": {"error": str(exc)},
                }
            )
            await self._persist(state)

    async def get_state(self, workflow_id: str) -> Optional[WorkflowState]:
        async with self._lock:
            return self._runs.get(workflow_id)

    async def _persist(self, state: WorkflowState) -> None:
        """
        In a real system, this would write to a durable store.
        For demo purposes we keep everything in memory.
        """
        async with self._lock:
            self._runs[state.id] = state

    def _generate_summary(self, state: WorkflowState) -> WorkflowState:
        """
        Produce a human-readable case summary and resolution reason.
        In production this could be delegated to an LLM using the logs as context.
        """
        if state.workflow_type == WorkflowType.printer_offline:
            base = "Printer offline self-heal workflow executed."
        else:
            base = "Printer ink error self-heal workflow executed."

        actions = ", ".join(a.name for a in state.actions) or "no actions taken"
        verification = "succeeded" if state.verification and state.verification.success else "did not fully succeed"

        resolution = f"{base} Actions: {actions}. Verification {verification}."
        if state.escalation and state.escalation.required:
            resolution += f" Case escalated to {state.escalation.target_queue}: {state.escalation.reason}."
        else:
            resolution += " Issue resolved without human intervention."

        state.summary = base
        state.resolution_reason = resolution
        return state


# Singleton engine instance used by FastAPI routes
engine = WorkflowEngine()


