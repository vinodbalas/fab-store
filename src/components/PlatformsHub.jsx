import { ArrowLeft, Layers, Zap, CheckCircle, Code, Database, BarChart3, Shield, Activity, Play } from "lucide-react";
import { fabPlatforms, getEnrichedPlatforms } from "../data/fabPlatforms";
import { fabApps } from "../data/fabApps";

export default function PlatformsHub({ onBack, onNavigate }) {
  const platforms = getEnrichedPlatforms();
  const sopPlatform = platforms.find((p) => p.id === "sop-navigator");
  const fieldServicePlatform = platforms.find((p) => p.id === "field-service");

  const sopSolutions = fabApps.filter((app) => app.platformId === "sop-navigator");
  const fieldServiceSolutions = fabApps.filter((app) => app.platformId === "field-service");

  return (
    <div className="min-h-screen bg-[#F7F8FF]">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#612D91] hover:text-[#7B3DA1] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Store</span>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center shadow-lg">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Platforms Hub</h1>
              <p className="text-lg text-gray-600 mt-1">Reusable platforms for rapid application development</p>
            </div>
          </div>
          <p className="text-gray-700 max-w-3xl leading-relaxed">
            Our platforms provide enterprise-grade infrastructure, AI capabilities, and reusable components that enable 
            rapid development of production-ready applications. Build once, deploy across industries.
          </p>
        </div>

        {/* Platform Overview */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-[#612D91]/5 to-[#A64AC9]/5">
                <div className="text-4xl font-bold text-[#612D91] mb-2">{platforms.length}</div>
                <div className="text-sm font-medium text-gray-600">Live Platforms</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-[#612D91]/5 to-[#A64AC9]/5">
                <div className="text-4xl font-bold text-[#612D91] mb-2">{fabApps.filter((a) => a.platformId).length}</div>
                <div className="text-sm font-medium text-gray-600">Solutions Built</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-[#612D91]/5 to-[#A64AC9]/5">
                <div className="text-4xl font-bold text-[#612D91] mb-2">2</div>
                <div className="text-sm font-medium text-gray-600">Industries Covered</div>
              </div>
            </div>
          </div>
        </section>

        {/* SOP Executor Platform */}
        {sopPlatform && (
          <section className="mb-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{sopPlatform.name}</h2>
                    <p className="text-gray-600 mt-1">{sopPlatform.tagline}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                  {sopPlatform.status}
                </span>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{sopPlatform.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Core Capabilities</h3>
                  <ul className="space-y-2">
                    {sopPlatform.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-[#612D91]" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {sopPlatform.stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Solutions Built on {sopPlatform.name} ({sopSolutions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sopSolutions.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => onNavigate && onNavigate("store")}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{app.name}</div>
                      <div className="text-sm text-gray-600">{app.industry}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Field Service Platform */}
        {fieldServicePlatform && (
          <section className="mb-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#3B82F6] flex items-center justify-center shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{fieldServicePlatform.name}</h2>
                    <p className="text-gray-600 mt-1">{fieldServicePlatform.tagline}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                  {fieldServicePlatform.status}
                </span>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{fieldServicePlatform.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Core Capabilities</h3>
                  <ul className="space-y-2">
                    {fieldServicePlatform.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {fieldServicePlatform.stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Solutions Built on {fieldServicePlatform.name} ({fieldServiceSolutions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {fieldServiceSolutions.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => onNavigate && onNavigate("store")}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{app.name}</div>
                      <div className="text-sm text-gray-600">{app.industry}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Agentic Support Orchestration Platform (FastAPI) */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] flex items-center justify-center shadow-lg">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Agentic Support Orchestration</h2>
                  <p className="text-gray-600 mt-1">
                    End-to-end self-healing workflows for device & customer support, powered by FastAPI and modular agents.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                  Built
                </span>
                <div className="flex flex-wrap gap-1 justify-end">
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">FastAPI</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">Agentic</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">Workflows: 2</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Supported Workflows</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Printer Offline / Not Responding</div>
                      <div className="text-xs text-gray-500">
                        Diagnose network, spooler and heartbeat issues. Restart services, rebind IPs, and validate fix via telemetry.
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Ink Cartridge Not Recognized / Ink Error</div>
                      <div className="text-xs text-gray-500">
                        Validate cartridge authenticity, check firmware compatibility, reset state or auto-create replacement shipments.
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <Code className="w-4 h-4 text-[#612D91] mt-0.5" />
                    <span>
                      Modular agents for <strong>intent detection</strong>, <strong>diagnostics</strong>,{" "}
                      <strong>action execution</strong>, <strong>verification</strong>, and{" "}
                      <strong>escalation decision</strong> orchestrated as a state machine.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="w-4 h-4 text-[#612D91] mt-0.5" />
                    <span>
                      Every step is logged in structured form, enabling rich observability and easy integration with
                      AI Watchtower dashboards or external analytics.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="w-4 h-4 text-[#612D91] mt-0.5" />
                    <span>
                      Exposes clean APIs (
                      <code className="px-1 py-0.5 bg-gray-100 rounded text-[11px]">/trigger-workflow</code>,{" "}
                      <code className="px-1 py-0.5 bg-gray-100 rounded text-[11px]">/get-workflow-status</code>,{" "}
                      <code className="px-1 py-0.5 bg-gray-100 rounded text-[11px]">/simulate-telemetry</code>) for any UI or CCaaS to call.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-500">
                Built as a dedicated microservice using FastAPI. Ready to plug into contact center, CRM and device telemetry platforms.
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("agentic-support-demo")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#612D91] text-white text-sm font-semibold hover:bg-[#7B3DA1]"
              >
                <Play className="w-4 h-4" />
                Launch Agentic Demo
              </button>
            </div>
          </div>
        </section>

        {/* How to Build on Platforms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Build on Platforms</h2>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center text-white font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Choose Your Platform</h3>
                  <p className="text-gray-600 text-sm">
                    Select SOP Executor for regulated, SOP-driven applications or Field Service Platform for routing, scheduling, 
                    and technician management solutions.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center text-white font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Define Your Data</h3>
                  <p className="text-gray-600 text-sm">
                    Create your domain-specific data structures (claims, cases, loans, work orders) and SOP definitions 
                    (for SOP Executor) or service types and technician profiles (for Field Service).
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center text-white font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Create Platform Adapter</h3>
                  <p className="text-gray-600 text-sm">
                    Use the adapter pattern to connect your domain data to platform services. The platform provides generic 
                    AI reasoning, components, and services that your adapter maps to your specific domain.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center text-white font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Integrate Platform Components</h3>
                  <p className="text-gray-600 text-sm">
                    Use platform components (SOPViewer, ReasoningCard, WorkOrderCard) in your solution UI. Components 
                    automatically connect to platform services through your adapter.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center text-white font-bold shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Customize for Your Industry</h3>
                  <p className="text-gray-600 text-sm">
                    Adapt UI, terminology, and workflows to match your industry requirements while leveraging core platform 
                    capabilities. The platform handles AI reasoning, compliance, and orchestration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <Code className="w-8 h-8 text-[#612D91] mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Faster Development</h3>
              <p className="text-sm text-gray-600">
                Build production-ready applications in days, not months. Reuse platform infrastructure, AI capabilities, 
                and components.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <Shield className="w-8 h-8 text-[#612D91] mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Built-in Compliance</h3>
              <p className="text-sm text-gray-600">
                Platforms provide compliance guardrails, audit trails, and SOP-native reasoning out of the box. 
                No need to build from scratch.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <BarChart3 className="w-8 h-8 text-[#612D91] mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Enterprise-Grade AI</h3>
              <p className="text-sm text-gray-600">
                Multi-agent reasoning engines, confidence scoring, streaming responses, and RAG capabilities built into 
                every platform.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

