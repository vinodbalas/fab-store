from __future__ import annotations

import logging
from typing import Dict

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .engine import engine
from .models import (
    SimulateTelemetryRequest,
    TriggerWorkflowResponse,
    WorkflowStatusResponse,
    WorkflowTriggerRequest,
)

logger = logging.getLogger("agentic_support")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Agentic Customer Support Self-Healing API",
    version="0.1.0",
    description=(
        "Agentic workflows for printer support scenarios.\n\n"
        "This service hosts multiple autonomous workflows that can diagnose, act, "
        "verify and optionally escalate issues such as 'Printer Offline' or "
        "'Ink Cartridge Error'.\n\n"
        "Integrations with CCaaS, device telemetry and CRM systems are mocked via "
        "well-defined boundaries so they can be replaced with real clients later."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/trigger-workflow", response_model=TriggerWorkflowResponse)
async def trigger_workflow(payload: WorkflowTriggerRequest, background: BackgroundTasks) -> TriggerWorkflowResponse:
    """
    Entry point for starting a new agentic workflow.

    The request includes customer interaction, device metadata, telemetry and entitlement.
    Optionally, a specific workflow_type can be supplied; otherwise an intent-detection
    step will infer the best matching workflow.

    The orchestration runs asynchronously in the background. This endpoint returns
    immediately with a workflow_id that can be used to query status.
    """
    state = await engine.trigger(payload)
    logger.info("Triggered workflow %s of type %s", state.id, state.workflow_type.value)

    return TriggerWorkflowResponse(
        workflow_id=state.id,
        workflow_type=state.workflow_type,
        status=state.status,
        stage=state.stage,
        created_at=state.created_at,
    )


@app.get("/get-workflow-status", response_model=WorkflowStatusResponse)
async def get_workflow_status(workflow_id: str) -> WorkflowStatusResponse:
    """
    Retrieve the latest state for a workflow.

    This returns:
      - current stage and status
      - diagnosis details
      - actions executed
      - verification and escalation info
      - AI-generated summary and resolution reason
      - full structured log of all agent steps
    """
    state = await engine.get_state(workflow_id)
    if not state:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowStatusResponse(workflow=state)


# In-memory telemetry store used for /simulate-telemetry
_TELEMETRY_STORE: Dict[str, Dict] = {}


@app.post("/simulate-telemetry")
async def simulate_telemetry(payload: SimulateTelemetryRequest) -> Dict[str, str]:
    """
    Mock endpoint to upsert device telemetry.

    In a production deployment this would typically be replaced with:
      - a webhook from a device telemetry platform, or
      - a polling job that reads from an IoT / streaming source (e.g., Kafka, MQTT).
    """
    _TELEMETRY_STORE[payload.device_id] = payload.telemetry.model_dump()
    logger.info("Updated simulated telemetry for device %s", payload.device_id)
    return {"status": "ok", "device_id": payload.device_id}


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


"""
Integration Notes
-----------------

CCaaS / Contact Center (e.g., Genesys, Twilio, Amazon Connect)
--------------------------------------------------------------
- The /trigger-workflow endpoint can be invoked from:
  - IVR flows (e.g., when a caller says 'my printer is offline')
  - Agent assist widgets (send the current conversation transcript)
  - Bot flows as a 'self-heal' action before routing to a human

- The WorkflowState.summary and resolution_reason fields can be surfaced
  in an agent desktop UI as a ready-made wrap-up note or guidance script.

Device Telemetry Platforms
---------------------------
- Replace the in-memory _TELEMETRY_STORE and TelemetrySnapshot with a thin
  adapter around your real telemetry source:
  - e.g., a service that queries a device management API
  - or a subscriber to telemetry events on Kafka/IoT Core.

- The DiagnosticAgent and VerificationAgent are the natural extension points:
  replace the mocked checks with real API calls and business rules.

CRM / Ticketing Systems (ServiceNow, Zendesk, Salesforce)
---------------------------------------------------------
- When EscalationDecisionAgent marks a workflow as escalated, you can:
  - Create or update a ticket with the full WorkflowState payload.
  - Attach state.logs as a structured diagnostic trace.
  - Use workflow_id as an external reference ID to correlate events.

- The /get-workflow-status endpoint can be used by downstream systems to
  poll or subscribe for changes to workflow outcomes.
"""


