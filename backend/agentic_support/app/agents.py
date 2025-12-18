from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

from .models import (
    AccountEntitlement,
    CustomerInteraction,
    DeviceMetadata,
    TelemetrySnapshot,
    WorkflowStage,
    WorkflowStatus,
    WorkflowType,
    ActionResult,
    VerificationResult,
    EscalationInfo,
    WorkflowState,
)


@dataclass
class WorkflowContext:
    """Shared context passed between agents within a workflow run."""

    workflow_id: str
    workflow_type: WorkflowType
    interaction: CustomerInteraction
    device: DeviceMetadata
    telemetry: TelemetrySnapshot
    entitlement: AccountEntitlement
    # mock integration handles / clients (to be wired to real systems later)
    cc_platform: Optional[Any] = None  # e.g. Genesys / Twilio client
    telemetry_client: Optional[Any] = None
    crm_client: Optional[Any] = None


class BaseAgent:
    name: str

    async def run(self, ctx: WorkflowContext, state: WorkflowState) -> WorkflowState:
        raise NotImplementedError

    def _log(self, state: WorkflowState, level: str, message: str, **data: Any) -> None:
        state.logs.append(
            {
                "timestamp": datetime.utcnow(),
                "level": level,
                "message": message,
                "data": data,
            }
        )
        state.updated_at = datetime.utcnow()


class IntentDetectionAgent(BaseAgent):
    """
    Very simple rule-based intent detection.
    In production, this would be replaced with an LLM or NLU model.
    """

    name = "intent_detection"

    async def run(self, ctx: WorkflowContext, state: WorkflowState) -> WorkflowState:
        text = ctx.interaction.text.lower()
        self._log(state, "info", "Running intent detection", text=text)

        if "offline" in text or "not responding" in text or "cannot print" in text:
            inferred = WorkflowType.printer_offline
        elif "ink" in text or "cartridge" in text:
            inferred = WorkflowType.ink_error
        else:
            # default to offline; in production we might ask clarifying questions
            inferred = WorkflowType.printer_offline

        state.diagnosis = (state.diagnosis or {}) | {"intent": inferred.value}
        self._log(state, "info", "Intent detected", workflow_type=inferred.value)
        return state


class DiagnosticAgent(BaseAgent):
    """
    Performs workflow-specific diagnostics.
    """

    name = "diagnostic"

    async def run(self, ctx: WorkflowContext, state: WorkflowState) -> WorkflowState:
        self._log(state, "info", "Starting diagnostic phase")
        state.stage = WorkflowStage.diagnosing
        state.status = WorkflowStatus.running

        if ctx.workflow_type == WorkflowType.printer_offline:
            await self._diagnose_printer_offline(ctx, state)
        elif ctx.workflow_type == WorkflowType.ink_error:
            await self._diagnose_ink_error(ctx, state)
        else:
            self._log(state, "error", "Unsupported workflow type", workflow_type=ctx.workflow_type.value)
            state.status = WorkflowStatus.failed
            state.stage = WorkflowStage.failed

        return state

    async def _diagnose_printer_offline(self, ctx: WorkflowContext, state: WorkflowState) -> None:
        diag = {}
        t = ctx.telemetry
        diag["heartbeat_seen"] = bool(t.last_heartbeat_ts)
        diag["online"] = t.online
        diag["network_reachable"] = t.network_reachable
        diag["spooler_healthy"] = t.spooler_healthy
        diag["error_codes"] = t.error_codes

        # Simple root cause heuristic
        if not t.online:
            if not t.network_reachable:
                root = "network_connectivity_issue"
            elif not t.spooler_healthy:
                root = "spooler_failure"
            else:
                root = "unknown_offline_state"
        else:
            root = "intermittent_issue_or_resolved"

        diag["root_cause"] = root
        state.diagnosis = (state.diagnosis or {}) | {"printer_offline": diag}
        self._log(state, "info", "Diagnostics completed for printer_offline", diagnosis=diag)

    async def _diagnose_ink_error(self, ctx: WorkflowContext, state: WorkflowState) -> None:
        t = ctx.telemetry
        diag: Dict[str, Any] = {
            "error_codes": t.error_codes,
            "ink_levels": {
                "cyan": t.ink_level_cyan,
                "magenta": t.ink_level_magenta,
                "yellow": t.ink_level_yellow,
                "black": t.ink_level_black,
            },
        }

        # Mock rules for root cause
        if any(code.startswith("INK_AUTH") for code in t.error_codes):
            root = "cartridge_not_authentic"
        elif any(code.startswith("INK_FW") for code in t.error_codes):
            root = "firmware_incompatibility"
        elif any(level is not None and level == 0 for level in diag["ink_levels"].values()):
            root = "empty_cartridge"
        else:
            root = "undetermined_ink_issue"

        diag["root_cause"] = root
        state.diagnosis = (state.diagnosis or {}) | {"ink_error": diag}
        self._log(state, "info", "Diagnostics completed for ink_error", diagnosis=diag)


class ActionExecutionAgent(BaseAgent):
    """
    Executes one or more remediation actions based on diagnosis.
    In production this would call real device / ITSM / RPA APIs.
    """

    name = "action_execution"

    async def run(self, ctx: WorkflowContext, state: WorkflowState) -> WorkflowState:
        self._log(state, "info", "Starting action phase")
        state.stage = WorkflowStage.acting

        if ctx.workflow_type == WorkflowType.printer_offline:
            await self._actions_printer_offline(ctx, state)
        elif ctx.workflow_type == WorkflowType.ink_error:
            await self._actions_ink_error(ctx, state)

        return state

    async def _record_action(self, state: WorkflowState, name: str, success: bool, details: str) -> None:
        now = datetime.utcnow()
        result = ActionResult(
            name=name,
            success=success,
            details=details,
            started_at=now,
            completed_at=now,
        )
        state.actions.append(result)
        self._log(state, "info" if success else "error", f"Action executed: {name}", success=success, details=details)

    async def _actions_printer_offline(self, ctx: WorkflowContext, state: WorkflowState) -> None:
        diag = (state.diagnosis or {}).get("printer_offline", {})
        root = diag.get("root_cause")

        # In a real system, these would be API calls to device mgmt / RPA
        if root == "spooler_failure":
            await asyncio.sleep(0.1)
            await self._record_action(state, "restart_spooler", True, "Spooler restart command issued.")
        elif root == "network_connectivity_issue":
            await asyncio.sleep(0.1)
            await self._record_action(state, "rebind_printer_ip", True, "Rebound printer to correct IP.")
        elif root == "unknown_offline_state":
            await asyncio.sleep(0.1)
            await self._record_action(state, "reset_print_queue", True, "Cleared and reset print queue.")
        else:
            await asyncio.sleep(0.1)
            await self._record_action(
                state,
                "noop",
                True,
                "No obvious issue detected; recorded observation for monitoring.",
            )

    async def _actions_ink_error(self, ctx: WorkflowContext, state: WorkflowState) -> None:
        diag = (state.diagnosis or {}).get("ink_error", {})
        root = diag.get("root_cause")

        if root == "cartridge_not_authentic":
            await asyncio.sleep(0.1)
            await self._record_action(
                state,
                "sync_subscription",
                True,
                "Synced subscription and revalidated cartridge entitlement.",
            )
        elif root == "firmware_incompatibility":
            await asyncio.sleep(0.1)
            await self._record_action(
                state,
                "refresh_firmware",
                True,
                "Queued firmware refresh for printer and cartridges.",
            )
        elif root == "empty_cartridge" and state.diagnosis:
            await asyncio.sleep(0.1)
            await self._record_action(
                state,
                "create_replacement_shipment",
                True,
                "Auto-created replacement cartridge shipment for customer.",
            )
        else:
            await asyncio.sleep(0.1)
            await self._record_action(
                state,
                "reset_cartridge_state",
                True,
                "Reset cartridge state and requested device to re-enumerate cartridges.",
            )


class VerificationAgent(BaseAgent):
    """
    Verifies if self-heal actions resolved the issue using telemetry and simple rules.
    """

    name = "verification"

    async def run(self, ctx: WorkflowContext, state: WorkflowState) -> WorkflowState:
        self._log(state, "info", "Starting verification phase")
        state.stage = WorkflowStage.verifying

        if ctx.workflow_type == WorkflowType.printer_offline:
            result = await self._verify_printer_offline(ctx, state)
        else:
            result = await self._verify_ink_error(ctx, state)

        state.verification = result
        self._log(state, "info", "Verification completed", success=result.success, checks=result.checks)
        return state

    async def _verify_printer_offline(self, ctx: WorkflowContext, state: WorkflowState) -> VerificationResult:
        # In reality we'd re-pull telemetry from a device platform
        t = ctx.telemetry
        checks = {
            "device_online": bool(t.online),
            "heartbeat_recent": t.last_heartbeat_ts is not None,
            "spooler_healthy": bool(t.spooler_healthy),
        }
        success = all(checks.values())
        details = "All checks passed" if success else "One or more verification checks failed"
        return VerificationResult(success=success, checks=checks, details=details)

    async def _verify_ink_error(self, ctx: WorkflowContext, state: WorkflowState) -> VerificationResult:
        t = ctx.telemetry
        checks = {
            "no_error_codes": not t.error_codes,
            "ink_levels_non_zero": all(
                level is None or level > 0
                for level in [
                    t.ink_level_cyan,
                    t.ink_level_magenta,
                    t.ink_level_yellow,
                    t.ink_level_black,
                ]
            ),
        }
        success = all(checks.values())
        details = "Ink system healthy" if success else "Ink error persists or levels invalid"
        return VerificationResult(success=success, checks=checks, details=details)


class EscalationDecisionAgent(BaseAgent):
    """
    Decides whether to escalate to a human agent / external system.
    """

    name = "escalation_decision"

    async def run(self, ctx: WorkflowContext, state: WorkflowState) -> WorkflowState:
        self._log(state, "info", "Evaluating escalation rules")
        state.stage = WorkflowStage.closing

        attempts = state.attempts
        verification = state.verification

        escalate = False
        reason = None
        target_queue = None

        if verification and not verification.success:
            if ctx.workflow_type == WorkflowType.printer_offline:
                if attempts >= 2:
                    escalate = True
                    reason = "Automated recovery attempts failed for printer_offline."
                    target_queue = "L2-Networking"
            elif ctx.workflow_type == WorkflowType.ink_error:
                diag = (state.diagnosis or {}).get("ink_error", {})
                root = diag.get("root_cause")
                if root in {"physical_damage", "undetermined_ink_issue"} or attempts >= 2:
                    escalate = True
                    reason = "Ink error unresolved; possible physical damage or repeated failure."
                    target_queue = "L2-Hardware"

        state.escalation = EscalationInfo(required=escalate, reason=reason, target_queue=target_queue)

        if escalate:
            state.status = WorkflowStatus.escalated
            state.stage = WorkflowStage.escalated
            self._log(
                state,
                "warn",
                "Workflow escalated",
                reason=reason,
                target_queue=target_queue,
            )
        else:
            state.status = WorkflowStatus.completed
            state.stage = WorkflowStage.completed
            self._log(state, "info", "Workflow completed without escalation")

        return state


