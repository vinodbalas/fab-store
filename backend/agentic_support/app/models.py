from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class Channel(str, Enum):
    chat = "chat"
    voice = "voice"


class WorkflowType(str, Enum):
    printer_offline = "printer_offline"
    ink_error = "ink_error"


class WorkflowStage(str, Enum):
    triggered = "triggered"
    diagnosing = "diagnosing"
    acting = "acting"
    verifying = "verifying"
    closing = "closing"
    escalated = "escalated"
    completed = "completed"
    failed = "failed"


class WorkflowStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    escalated = "escalated"
    failed = "failed"


class CustomerInteraction(BaseModel):
    channel: Channel = Channel.chat
    text: str = Field(..., description="Raw text of the customer interaction (chat or transcribed voice).")


class DeviceMetadata(BaseModel):
    device_id: str
    model: str
    os: str
    firmware_version: str
    location: Optional[str] = None


class TelemetrySnapshot(BaseModel):
    online: Optional[bool] = None
    last_heartbeat_ts: Optional[datetime] = None
    error_codes: List[str] = []
    ink_level_cyan: Optional[int] = None
    ink_level_magenta: Optional[int] = None
    ink_level_yellow: Optional[int] = None
    ink_level_black: Optional[int] = None
    spooler_healthy: Optional[bool] = None
    network_reachable: Optional[bool] = None


class AccountEntitlement(BaseModel):
    account_id: str
    tier: str
    sla_minutes: int
    has_ink_subscription: bool = False
    replacement_eligible: bool = True


class WorkflowTriggerRequest(BaseModel):
    """
    Entry payload for /trigger-workflow.
    The workflow_type is optional; if omitted, the IntentDetectionAgent will infer it from the interaction.
    """

    workflow_type: Optional[WorkflowType] = None
    interaction: CustomerInteraction
    device: DeviceMetadata
    telemetry: TelemetrySnapshot
    entitlement: AccountEntitlement


class ActionResult(BaseModel):
    name: str
    success: bool
    details: Optional[str] = None
    started_at: datetime
    completed_at: datetime


class VerificationResult(BaseModel):
    success: bool
    checks: Dict[str, bool] = {}
    details: Optional[str] = None


class EscalationInfo(BaseModel):
    required: bool = False
    reason: Optional[str] = None
    target_queue: Optional[str] = None


class WorkflowLogEntry(BaseModel):
    timestamp: datetime
    level: str
    message: str
    data: Dict[str, Any] = {}


class WorkflowState(BaseModel):
    id: str
    workflow_type: WorkflowType
    stage: WorkflowStage = WorkflowStage.triggered
    status: WorkflowStatus = WorkflowStatus.pending
    attempts: int = 0
    diagnosis: Optional[Dict[str, Any]] = None
    actions: List[ActionResult] = []
    verification: Optional[VerificationResult] = None
    escalation: Optional[EscalationInfo] = None
    summary: Optional[str] = None
    resolution_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    logs: List[WorkflowLogEntry] = []


class TriggerWorkflowResponse(BaseModel):
    workflow_id: str
    workflow_type: WorkflowType
    status: WorkflowStatus
    stage: WorkflowStage
    created_at: datetime


class WorkflowStatusResponse(BaseModel):
    workflow: WorkflowState


class SimulateTelemetryRequest(BaseModel):
    device_id: str
    telemetry: TelemetrySnapshot


