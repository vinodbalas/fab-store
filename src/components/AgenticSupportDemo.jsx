import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Loader2, Play, RefreshCw, Activity, Printer, Droplet } from "lucide-react";
import { agenticSupportAPI } from "../services/api";

const WORKFLOW_PRESETS = {
  printer_offline: {
    label: "Printer Offline / Not Responding",
    description: "Diagnose network, spooler and heartbeat issues and attempt self-heal.",
    payload: {
      workflow_type: "printer_offline",
      interaction: {
        channel: "chat",
        text: "My office printer is offline and not responding. Nothing is printing.",
      },
      device: {
        device_id: "PRN-123",
        model: "HP-LJ-4200",
        os: "Windows 11",
        firmware_version: "1.2.3",
        location: "Floor 3 - Marketing",
      },
      telemetry: {
        online: false,
        last_heartbeat_ts: null,
        network_reachable: false,
        error_codes: ["NET_TIMEOUT"],
        spooler_healthy: false,
      },
      entitlement: {
        account_id: "CUST-001",
        tier: "Gold",
        sla_minutes: 30,
        has_ink_subscription: false,
        replacement_eligible: true,
      },
    },
  },
  ink_error: {
    label: "Ink Cartridge Not Recognized / Ink Error",
    description: "Validate cartridge, firmware and entitlement. Auto-ship replacement if needed.",
    payload: {
      workflow_type: "ink_error",
      interaction: {
        channel: "chat",
        text: "My printer says the cyan ink cartridge is not recognized even though it is genuine.",
      },
      device: {
        device_id: "PRN-987",
        model: "Canon-XL-500",
        os: "macOS 14",
        firmware_version: "3.4.5",
        location: "Home Office",
      },
      telemetry: {
        online: true,
        last_heartbeat_ts: new Date().toISOString(),
        error_codes: ["INK_AUTH_001"],
        ink_level_cyan: 40,
        ink_level_magenta: 60,
        ink_level_yellow: 55,
        ink_level_black: 70,
      },
      entitlement: {
        account_id: "CUST-002",
        tier: "Standard",
        sla_minutes: 60,
        has_ink_subscription: true,
        replacement_eligible: true,
      },
    },
  },
};

export default function AgenticSupportDemo({
  onBack,
  embedded = false,
  initialWorkflow = null,
  interactionText,
  autoRunToken,
  onWorkflowComplete,
}) {
  const [selectedWorkflow, setSelectedWorkflow] = useState(initialWorkflow || "printer_offline");
  const [form, setForm] = useState(WORKFLOW_PRESETS.printer_offline.payload);
  const [workflowId, setWorkflowId] = useState(null);
  const [status, setStatus] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollError, setPollError] = useState(null);

  const currentPreset = useMemo(() => WORKFLOW_PRESETS[selectedWorkflow], [selectedWorkflow]);

  useEffect(() => {
    if (initialWorkflow && initialWorkflow !== selectedWorkflow) {
      setSelectedWorkflow(initialWorkflow);
    }
  }, [initialWorkflow]);

  // Sync external interaction text (from console) into the form when provided
  useEffect(() => {
    if (!interactionText) return;
    setForm((prev) => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        text: interactionText,
      },
    }));
  }, [interactionText]);

  useEffect(() => {
    setForm(WORKFLOW_PRESETS[selectedWorkflow].payload);
    setStatus(null);
    setWorkflowId(null);
    setPollError(null);
  }, [selectedWorkflow]);

  // Helper: mock a workflow run when backend is unavailable
  const runMockWorkflow = (workflowType) => {
    setIsPolling(false);
    const base = {
      id: `demo-${workflowType}`,
      workflow_type: workflowType,
      status: "completed",
      stage: "completed",
      attempts: 1,
      diagnosis: {
        workflow: workflowType === "printer_offline" ? "Printer Offline" : "Ink Error",
        root_cause:
          workflowType === "printer_offline"
            ? "Printer lost network connectivity and spooler service was stopped."
            : "Genuine cartridge rejected due to stale firmware / authentication mismatch.",
        confidence: 0.92,
      },
      actions:
        workflowType === "printer_offline"
          ? [
              {
                name: "Restart spooler service",
                success: true,
                details: "Spooler restarted successfully on host PRN-123.",
                started_at: new Date().toISOString(),
              },
              {
                name: "Re-bind IP and validate network reachability",
                success: true,
                details: "Ping and heartbeat restored within 3s.",
                started_at: new Date().toISOString(),
              },
            ]
          : [
              {
                name: "Validate cartridge authenticity and entitlement",
                success: true,
                details: "Cartridge marked genuine and in-warranty.",
                started_at: new Date().toISOString(),
              },
              {
                name: "Trigger replacement shipment",
                success: true,
                details: "Replacement cyan cartridge prepared for next-day delivery.",
                started_at: new Date().toISOString(),
              },
            ],
      verification: {
        success: true,
        checks:
          workflowType === "printer_offline"
            ? { heartbeat_restored: true, test_page_printed: true }
            : { test_page_printed: true, error_cleared: true },
        details:
          workflowType === "printer_offline"
            ? "Heartbeat and test print succeeded after self-heal."
            : "Printer accepted cartridge and completed a test page.",
      },
      escalation: { required: false },
      resolution_reason:
        workflowType === "printer_offline"
          ? "Printer brought back online autonomously by restarting spooler and fixing network binding. No human escalation required."
          : "Cartridge issue resolved by validating entitlement and auto-triggering a replacement. Customer impact minimized, no live-agent time used.",
    };
    setStatus(base);
    setWorkflowId(null);
    setPollError(null);
    if (onWorkflowComplete) {
      onWorkflowComplete(base);
    }
  };

  useEffect(() => {
    if (!workflowId) return;
    let cancelled = false;

    const poll = async () => {
      setIsPolling(true);
      try {
        const result = await agenticSupportAPI.getStatus(workflowId);
        if (!cancelled) {
          setStatus(result.workflow);
          const terminal = ["completed", "failed", "escalated"].includes(result.workflow.status);
          if (!terminal) {
            setTimeout(poll, 1500);
          } else {
            setIsPolling(false);
            if (onWorkflowComplete) {
              onWorkflowComplete(result.workflow);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Status poll error", err);
          // Fall back to a simulated run for demo purposes
          runMockWorkflow(selectedWorkflow);
          setIsPolling(false);
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [workflowId, selectedWorkflow]);

  // Auto-run support for embedded mode (step-by-step flow)
  useEffect(() => {
    if (!embedded) return;
    if (!autoRunToken) return;
    // Trigger a fresh run whenever autoRunToken changes
    handleTrigger();
  }, [autoRunToken, embedded]);

  const handleTrigger = async () => {
    setIsTriggering(true);
    setStatus(null);
    setWorkflowId(null);
    setPollError(null);
    try {
      const resp = await agenticSupportAPI.triggerWorkflow(form);
      setWorkflowId(resp.workflow_id);
    } catch (err) {
      console.error("Trigger error", err);
      // If backend is unreachable, run a simulated workflow so the demo still works
      runMockWorkflow(selectedWorkflow);
    } finally {
      setIsTriggering(false);
    }
  };

  const statusColor = (status) => {
    if (!status) return "bg-gray-200 text-gray-800";
    switch (status.status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "escalated":
        return "bg-amber-100 text-amber-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const stageLabel = status?.stage?.replace(/_/g, " ") || "Not started";

  return (
    <div className={embedded ? "" : "min-h-screen bg-[#F7F8FF]"}>
      <div className={embedded ? "w-full" : "max-w-6xl mx-auto px-4 md:px-10 py-8"}>
        {!embedded && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="mr-2 inline-flex items-center text-sm text-[#612D91] hover:text-[#7B3DA1]"
                >
                  ← Back
                </button>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Agentic Support – Self-Healing Demo
                  </h1>
                  <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                    Trigger end-to-end agentic workflows for printer issues. The system will diagnose, act,
                    verify and decide whether to resolve or escalate – no UI wiring required.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-xs font-semibold text-[#612D91]">
                Mode: Simulated agentic run · Workflows: 2
              </span>
            </div>
          </>
        )}
        
        {embedded && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Agentic Support Demo</h2>
            <p className="text-xs text-gray-600">
              Trigger end-to-end agentic workflows for printer issues. The system will diagnose, act, verify and decide whether to resolve or escalate.
            </p>
          </div>
        )}

        <div className={`grid ${embedded ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'} items-start`}>
          {/* Left: configuration */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">1. Choose a workflow</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                    selectedWorkflow === "printer_offline"
                      ? "bg-[#612D91] text-white border-[#612D91]"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                  onClick={() => setSelectedWorkflow("printer_offline")}
                >
                  <Printer className="w-4 h-4" />
                  Printer Offline
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                    selectedWorkflow === "ink_error"
                      ? "bg-[#612D91] text-white border-[#612D91]"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                  onClick={() => setSelectedWorkflow("ink_error")}
                >
                  <Droplet className="w-4 h-4" />
                  Ink Cartridge Error
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">{currentPreset.description}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">2. Customer interaction</h3>
              <textarea
                className="w-full min-h-[80px] text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#612D91]"
                value={form.interaction.text}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    interaction: { ...f.interaction, text: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">3. Device & telemetry (preset)</h3>
              <div className="text-xs text-gray-600 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3 space-y-1">
                <div>
                  <span className="font-semibold">Device:</span> {form.device.model} · {form.device.os} ·{" "}
                  FW {form.device.firmware_version}
                </div>
                <div>
                  <span className="font-semibold">Telemetry:</span>{" "}
                  {form.telemetry.online ? "Online" : "Offline"},{" "}
                  {form.telemetry.error_codes?.length
                    ? `Errors: ${form.telemetry.error_codes.join(", ")}`
                    : "No error codes"}
                </div>
                {selectedWorkflow === "ink_error" && (
                  <div>
                    <span className="font-semibold">Ink levels:</span>{" "}
                    {[
                      ["C", form.telemetry.ink_level_cyan],
                      ["M", form.telemetry.ink_level_magenta],
                      ["Y", form.telemetry.ink_level_yellow],
                      ["K", form.telemetry.ink_level_black],
                    ]
                      .filter(([, v]) => v != null)
                      .map(([k, v]) => `${k}:${v}%`)
                      .join(" · ")}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>End-to-end run: typically &lt; 1–2 seconds</span>
              </div>
              {!embedded && (
                <button
                  type="button"
                  onClick={handleTrigger}
                  disabled={isTriggering}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#612D91] text-white text-sm font-semibold hover:bg-[#7B3DA1] disabled:opacity-60"
                >
                  {isTriggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isTriggering ? "Starting..." : "Run Workflow"}
                </button>
              )}
            </div>

            {pollError && (
              <div className="mt-2 flex items-start gap-2 text-sm text-red-700 bg-red-50 border-2 border-red-300 rounded-lg p-3">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold mb-1">Connection Error</div>
                  <div className="text-red-600 whitespace-pre-line">{pollError}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: live status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Workflow status</h2>
                <p className="text-xs text-gray-500">
                  {workflowId ? `Workflow ID: ${workflowId}` : "Trigger a workflow to see live status."}
                </p>
              </div>
              {status && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(status)}`}>
                  {status.status?.toUpperCase()}
                </span>
              )}
            </div>

            {status && (
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                    Stage: {stageLabel}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                    Attempts: {status.attempts}
                  </span>
                  {status.workflow_type && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-50 text-xs text-[#612D91]">
                      {status.workflow_type === "printer_offline" ? "Printer Offline" : "Ink Error"}
                    </span>
                  )}
                </div>

                {status.diagnosis && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-[#612D91]" />
                      Diagnosis
                    </div>
                    <pre className="bg-gray-50 text-[11px] p-2 rounded-md max-h-40 overflow-auto">
                      {JSON.stringify(status.diagnosis, null, 2)}
                    </pre>
                  </div>
                )}

                {status.actions && status.actions.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 text-[#612D91]" />
                      Actions Executed
                    </div>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {status.actions.map((a) => (
                        <li key={`${a.name}-${a.started_at}`} className="flex items-start gap-2">
                          {a.success ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-red-600 mt-0.5" />
                          )}
                          <div>
                            <div className="font-medium">{a.name}</div>
                            {a.details && <div className="text-[11px] text-gray-500">{a.details}</div>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {status.verification && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          status.verification.success ? "text-emerald-600" : "text-amber-600"
                        }`}
                      />
                      Verification
                    </div>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {Object.entries(status.verification.checks || {}).map(([k, v]) => (
                        <li key={k}>
                          <span className="font-mono mr-1">{k}:</span>
                          <span className={v ? "text-emerald-700" : "text-red-700"}>
                            {v ? "PASS" : "FAIL"}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {status.verification.details && (
                      <div className="mt-1 text-[11px] text-gray-500">{status.verification.details}</div>
                    )}
                  </div>
                )}

                {status.escalation && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <AlertCircle
                        className={`w-3.5 h-3.5 ${
                          status.escalation.required ? "text-amber-600" : "text-emerald-600"
                        }`}
                      />
                      Escalation Decision
                    </div>
                    <div className="text-xs text-gray-700">
                      {status.escalation.required ? (
                        <>
                          <div className="font-medium text-amber-700">Escalation required</div>
                          <div className="text-[11px] mt-1">{status.escalation.reason}</div>
                          {status.escalation.target_queue && (
                            <div className="mt-1">
                              Target queue:{" "}
                              <span className="font-mono">{status.escalation.target_queue}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>No escalation required – issue resolved autonomously.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {status.resolution_reason && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-[#612D91]/5 to-[#A64AC9]/5">
                    <div className="text-xs font-semibold text-gray-700 mb-1">AI Case Summary</div>
                    <div className="text-sm text-gray-800 whitespace-pre-line">{status.resolution_reason}</div>
                  </div>
                )}
              </div>
            )}

            {!status && !pollError && (
              <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-500">
                Trigger a workflow to see the full agentic trace, including diagnosis, actions, verification and
                escalation decisions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


