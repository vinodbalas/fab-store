import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Globe,
  Users,
  Code,
  Activity,
  Brain,
  Server,
  Database,
  Shield,
  Lock,
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  ChevronRight,
  Info,
} from "lucide-react";
import { fabPlatforms } from "../data/fabPlatforms";
import { fabApps } from "../data/fabApps";

// Simple tooltip used only on hover over info icons
function Tooltip({ content, children }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <div className="absolute z-50 -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-64 rounded-lg bg-gray-900 text-white text-xs px-3 py-2 shadow-xl border border-gray-700">
          {content}
        </div>
      )}
    </span>
  );
}

export default function ArchitecturePage({ onBack }) {
  const [viewMode, setViewMode] = useState("architecture"); // architecture | roi
  const [activeLayerId, setActiveLayerId] = useState(null);

  const sopNavigator = fabPlatforms.find((p) => p.id === "sop-navigator");
  const solutions = fabApps.filter((a) => a.platformId === "sop-navigator");

  const layers = [
    {
      id: "fab-store",
      name: "FAB Store Layer",
      subtitle: "Unified Marketplace & Container",
      status: "Built",
      icon: Globe,
      description:
        "Central marketplace and shell that hosts all TP.ai solutions and platforms, providing navigation, discovery, and consistent UX.",
      bullets: [
        "Hosts solution UIs (Cogniclaim, TP Resolve) inside a single experience",
        "Provides navigation, search, and entry points into platforms",
        "Owns branding and top-level account context",
      ],
      details: [
        "Use this row to explain how leaders and clients first experience TP.ai – everything begins inside FAB Store.",
        "Call out that any new solution or platform will appear here without rebuilding navigation or marketing surfaces.",
      ],
    },
    {
      id: "presentation",
      name: "Application Layer",
      subtitle: "Application User Interfaces",
      status: "Built",
      icon: Users,
      description:
        "Front-end surfaces for each application: dashboards, worklists, AI consoles, and SOP viewers.",
      bullets: [
        "Cogniclaim UI: claims dashboards, worklists, AI Reasoning, SOP Viewer",
        "TP Resolve Appeals UI: case dashboards, deadline tracker, AI Reasoning",
        "Shared visual language and components across solutions",
      ],
      details: [
        "Explain that every solution UI is opinionated for its end‑user (claims examiners, grievance specialists, etc.).",
        "Point out AI Reasoning and SOP Viewer as consistent, reusable elements across UIs.",
      ],
    },
    {
      id: "solution",
      name: "Solution Layer",
      subtitle: "Industry-Specific Applications",
      status: "Built",
      icon: Code,
      description:
        "Domain-specific applications (Cogniclaim, TP Resolve Appeals) that implement industry workflows on top of platforms.",
      bullets: [
        "Cogniclaim: medical claims intelligence for payers",
        "TP Resolve Appeals: appeals & grievances resolution for regulated plans",
        "Adapters connect solution data models (claims/cases) to platform services",
      ],
      details: [
        "Make clear that Cogniclaim and TP Resolve Appeals are examples of vertical solutions built on a shared stack.",
        "Highlight that adapters mean a new solution can plug in its own data model but reuse the same AI and SOP capabilities.",
      ],
    },
    {
      id: "orchestration",
      name: "Orchestration Layer",
      subtitle: "Service Coordination & API Gateway",
      status: "Partially Built",
      icon: Activity,
      description:
        "Coordinates traffic between front-end, platforms, AI services, and data services.",
      bullets: [
        "API gateway & routing (Express routes, auth hooks)",
        "Planned: workflow engine and event bus for complex flows",
        "Central place for enforcing policies and cross-cutting rules",
      ],
      details: [
        "Call out that today orchestration is lightweight (Express routing) but the design anticipates a full workflow and event bus.",
        "This is where things like risk‑based routing, human‑in‑loop steps, and escalations will live.",
      ],
    },
    {
      id: "platform",
      name: "Platform Layer",
      subtitle: "Reusable Platforms (SOP Executor)",
      status: "Built",
      icon: Layers,
      description:
        "Reusable platforms that expose generic capabilities (SOP reasoning, viewers, components) to any solution.",
      bullets: [
        "SOP Executor: SOP-native platform used by Cogniclaim & TP Resolve Appeals",
        "Shared components: ReasoningCard, SOPViewer, UnifiedAIConsole",
        "Adapter pattern keeps platforms decoupled from solution specifics",
      ],
      details: [
        "Use this to reinforce that SOP Executor is a first platform offering – more can be added like Field Service, Collections, etc.",
        "Emphasize that platform components and services can be reused by any new solution without re‑implementing AI logic.",
      ],
    },
    {
      id: "agentic",
      name: "Agentic Management Layer",
      subtitle: "AI Agent Orchestration",
      status: "Partially Built",
      icon: Brain,
      description:
        "Coordinates the lifecycle of AI agents and multi-step reasoning flows.",
      bullets: [
        "Implements multi-agent chains (Analysis → SOP Match → Risk → Recommendation)",
        "Tracks agent responsibilities and hand-offs",
        "Planned: full agent registry and monitoring",
      ],
      details: [
        "Describe this as the \"air traffic control\" for AI agents – which agent does what, in what order, and how they pass context.",
        "Future‑state: centralized registry and monitoring of all agents Teleperformance runs across clients.",
      ],
    },
    {
      id: "ai",
      name: "AI Services Layer",
      subtitle: "Reasoning, RAG & Streaming",
      status: "Built",
      icon: Brain,
      description:
        "Core AI capabilities that power reasoning, SOP matching, and conversational assistance.",
      bullets: [
        "GPT-4 / GPT-4o-mini via LangChain (frontend) and Node (backend)",
        "Multi-agent reasoning engine with confidence scoring",
        "RAG against SOP data + Server-Sent Events for live streaming",
      ],
      details: [
        "This is your AI \"engine room\" – GPT‑4/4o‑mini plus LangChain orchestrating multi‑step reasoning.",
        "Tie this back to explainability: confidence scores, step‑by‑step traces, and SOP references are all produced here.",
      ],
    },
    {
      id: "backend",
      name: "Backend Services Layer",
      subtitle: "APIs & Request Processing",
      status: "Built",
      icon: Server,
      description:
        "Node/Express backend that exposes AI and data APIs, including streaming endpoints.",
      bullets: [
        "REST APIs: /api/v1/ai/analyze, /api/v1/ai/chat, /api/v1/health",
        "Server-Sent Events for streaming reasoning to the UI",
        "Demo-mode aware routing and configuration",
      ],
      details: [
        "Tell leaders this is where we would plug into client systems (claim platforms, CRMs) without changing the AI stack.",
        "Streaming via SSE is what makes the AI feel \"alive\" during the demo – you can point to that here.",
      ],
    },
    {
      id: "data",
      name: "Data & Infrastructure Layer",
      subtitle: "SOPs, Solution Data, Cloud",
      status: "Partially Built",
      icon: Database,
      description:
        "Data stores and cloud footprint for SOPs, solution data, configuration, and eventual external integrations.",
      bullets: [
        "SOP repositories for Cogniclaim & TP Resolve (SCENARIO_SOPS, SOP_INDEX, etc.)",
        "Claims/cases data with realistic line items and scenarios",
        "Designed for multi-cloud deployment (Azure, GCP, AWS) via containers",
      ],
      details: [
        "Emphasize that SOP data and solution data are already modeled for healthcare; new industries plug in their own SOP sets.",
        "Cloud story: architecture is ready for multi‑cloud, containers, and data‑lake integrations when clients demand it.",
      ],
    },
  ];

  const platformLayers = ["platform"]
    .map((id) => layers.find((l) => l.id === id))
    .filter(Boolean);

  const aiEngineLayers = ["orchestration", "agentic", "ai"]
    .map((id) => layers.find((l) => l.id === id))
    .filter(Boolean);

  const backendLayers = ["backend"]
    .map((id) => layers.find((l) => l.id === id))
    .filter(Boolean);

  const dataLayers = ["data"]
    .map((id) => layers.find((l) => l.id === id))
    .filter(Boolean);

  const experienceLayers = ["fab-store"]
    .map((id) => layers.find((l) => l.id === id))
    .filter(Boolean);

  const roiMetrics = [
    {
      metric: "70%",
      label: "Faster Time to Market",
      icon: Clock,
      details: [
        "Platform-first approach reuses AI & SOP capabilities (SOP Executor)",
        "Pre-built Reasoning, Viewer, and Store surfaces",
        "New solutions inherit platform behavior instead of starting from zero",
      ],
    },
    {
      metric: "60%",
      label: "Cost Reduction",
      icon: DollarSign,
      details: [
        "Shared infra and components across multiple solutions",
        "Lower maintenance via one platform, many solutions",
        "Reduced vendor/tool sprawl in AI & decisioning stack",
      ],
    },
    {
      metric: "2+",
      label: "Solutions per Platform",
      icon: TrendingUp,
      details: [
        "Today: Cogniclaim + TP Resolve Appeals on SOP Executor",
        "Field Service / other verticals can be added quickly",
        "Clear blueprint for reusing agentic + SOP stack",
      ],
    },
    {
      metric: "100%",
      label: "AI-Powered",
      icon: Brain,
      details: [
        "Every solution instrumented with AI Reasoning",
        "Multi-agent reasoning on every claim/case line item",
        "Explainable recommendations tied back to SOPs",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F8FF]">
      {/* Background to match FAB Store */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(155,138,255,0.18),transparent_55%),radial-gradient(circle_at_75%_15%,rgba(118,196,255,0.16),transparent_55%),radial-gradient(circle_at_50%_85%,rgba(255,208,233,0.2),transparent_50%)] pointer-events-none" />

      <div className="relative flex flex-col min-h-screen">
        {/* Header – mirror FAB Store shell */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-white/60 shadow-[0_12px_30px_rgba(15,14,63,0.08)]">
          <div className="w-full px-5 md:px-10 py-3 md:py-4 flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4 flex-1 min-w-[260px]">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <img src="/tp-logo.svg" alt="TP.ai" className="h-9 w-auto" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400">
                    TP.ai
                  </p>
                  <p className="text-base md:text-lg font-semibold text-gray-900">
                    FAB Store
                  </p>
                  <p className="text-[11px] md:text-xs text-gray-600">
                    Enterprise Architecture Overview
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("architecture")}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-[0.85rem] font-semibold transition-all ${
                  viewMode === "architecture"
                    ? "bg-[#612D91] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                Architecture
              </button>
              <button
                onClick={() => setViewMode("roi")}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-[0.85rem] font-semibold transition-all ${
                  viewMode === "roi"
                    ? "bg-[#612D91] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                ROI & Value
              </button>
              {/* Static user pill to match FAB Store header */}
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border border-gray-200 px-2.5 py-1 shadow-sm">
                <img
                  src="/vkv.jpeg"
                  alt="Vinod"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-xs md:text-sm font-medium text-gray-800">
                  Vinod
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-5 md:px-10 py-7 md:py-9 flex-1">
          <AnimatePresence mode="wait">
            {viewMode === "architecture" && (
              <motion.div
                key="architecture"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-3 md:space-y-4"
              >
                <div className="space-y-3 md:space-y-4">
                  {/* Layer stack grouped into bands */}
                  {/* Band 1: FAB Store */}
                  <section className="rounded-2xl bg-gradient-to-r from-indigo-100 via-indigo-50 to-sky-50 border border-indigo-200 shadow-md p-3 md:p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-base md:text-lg font-semibold tracking-[0.18em] text-indigo-500 uppercase">
                          FAB Store
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          Experience layer for TP.ai applications and platforms.
                        </p>
                      </div>
                      <div className="text-[11px] md:text-xs text-gray-600 text-right">
                        <div>
                          <span className="font-semibold">Applications today:</span>{" "}
                          Cogniclaim · TP Resolve
                        </div>
                        <div>
                          <span className="font-semibold">Models:</span>{" "}
                          GPT‑4 / GPT‑4o‑mini (extensible)
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3 md:gap-4 md:grid-cols-1">
                      {experienceLayers.map((layer, idx) => {
                        const isActive = layer.id === activeLayerId;
                        const visibleBullets = isActive ? layer.bullets : layer.bullets.slice(0, 2);
                        const isFabStore = layer.id === "fab-store";
                        return (
                          <motion.button
                            key={layer.id}
                            type="button"
                            onClick={() => setActiveLayerId(layer.id)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`relative w-full text-left p-4 md:p-5 rounded-xl border bg-white/95 transition-all duration-150 ${
                              isActive
                                ? "border-[#612D91]/60 shadow-md scale-[1.01]"
                                : "border-gray-200/80 hover:border-[#2563EB]/50 hover:bg-white hover:shadow-md hover:scale-[1.01]"
                            } ${isFabStore ? "md:col-span-2" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="pt-0.5">
                                <layer.icon className="w-6 h-6 text-[#2563EB]" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center flex-wrap gap-2">
                                  {/* Band header already shows \"Platform Layer\" – keep subtitle + status only here */}
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                                    {layer.subtitle}
                                  </span>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                      layer.status === "Built"
                                        ? "bg-green-100 text-green-700"
                                        : layer.status === "Partially Built"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {layer.status}
                                  </span>
                                </div>
                                <p className="text-[11px] md:text-xs text-gray-600">
                                  {layer.description}
                                </p>

                                {layer.id === "fab-store" && (
                                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
                                    {/* Applications box */}
                                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                      <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                        Applications
                                      </div>
                                      <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                                        TP.ai solutions launched from FAB Store for different industries.
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        <span className="px-2.5 py-1 rounded-full bg-white text-indigo-700 text-[11px] md:text-xs font-semibold border border-indigo-200">
                                          Cogniclaim
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-white text-indigo-700 text-[11px] md:text-xs font-semibold border border-indigo-200">
                                          TP Resolve
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] md:text-xs font-semibold border border-indigo-200">
                                          Future industry applications
                                        </span>
                                      </div>
                                    </div>

                                    {/* Platforms box */}
                                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                      <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                        Platforms
                                      </div>
                                      <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                                        Reusable engines (like SOP Executor) that multiple applications can build on.
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        <span className="px-2.5 py-1 rounded-full bg-white text-indigo-700 text-[11px] md:text-xs font-semibold border border-indigo-200">
                                          SOP Executor
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] md:text-xs font-semibold border border-indigo-200">
                                          Platform 2 (Field Service)
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] md:text-xs font-semibold border border-indigo-200">
                                          Platform 3 (CX / others)
                                        </span>
                                      </div>
                                    </div>

                                    {/* Models box */}
                                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                      <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                        Models
                                      </div>
                                      <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                                        Foundation models available to platforms and apps via the AI Engine.
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        <span className="px-2.5 py-1 rounded-full bg-white text-indigo-700 text-[11px] md:text-xs font-semibold border border-indigo-200">
                                          GPT‑4
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-white text-indigo-700 text-[11px] md:text-xs font-semibold border border-indigo-200">
                                          GPT‑4o‑mini
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] md:text-xs font-semibold border border-indigo-200">
                                          Azure / GCP models (future)
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* For FAB Store we show the big Solutions/Platforms/Models chips.
                                For Presentation we jump straight to shells + key UI surfaces.
                                Other experience cards (if any) can still use the simple bullet list. */}
                            {/* No additional cards in this band beyond the FAB Store hero tile */}

                            {/* Per-layer demo talk-track removed to keep view clean for presentation */}
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Band 2A: Platform Layer */}
                  <section className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-violet-50 border border-emerald-100 p-3 md:p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-base md:text-lg font-semibold tracking-[0.18em] text-emerald-500 uppercase">
                          Platform Layer
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          Reusable business platforms that every solution can plug into.
                        </p>
                      </div>
                      <div className="text-[11px] md:text-xs text-gray-600 text-right">
                        <div>
                          <span className="font-semibold">Current platform:</span>{" "}
                          SOP Executor
                        </div>
                        <div>
                          <span className="font-semibold">Models:</span>{" "}
                          GPT‑4 / GPT‑4o‑mini (swappable)
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3 md:gap-4 md:grid-cols-1">
                      {platformLayers.map((layer, idx) => {
                        const isActive = layer.id === activeLayerId;
                        const visibleBullets = isActive ? layer.bullets : layer.bullets.slice(0, 2);
                        const isPlatformCore = layer.id === "platform";
                        return (
                          <motion.button
                            key={layer.id}
                            type="button"
                            onClick={() => setActiveLayerId(layer.id)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`relative w-full text-left p-4 md:p-5 rounded-xl border bg-white/95 transition-all duration-150 ${
                              isActive
                                ? "border-[#0F766E]/60 shadow-md scale-[1.01]"
                                : "border-gray-200/80 hover:border-[#0F766E]/50 hover:bg-white hover:shadow-md hover:scale-[1.01]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="pt-0.5">
                                <layer.icon className="w-6 h-6 text-emerald-700" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center flex-wrap gap-2">
                                  {/* Band header already shows "Platform Layer" – show subtitle + status only here */}
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                                    {layer.subtitle}
                                  </span>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                      layer.status === "Built"
                                        ? "bg-green-100 text-green-700"
                                        : layer.status === "Partially Built"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {layer.status}
                                  </span>
                                </div>
                                <p className="text-[11px] md:text-xs text-gray-600">
                                  {layer.description}
                                </p>
                              </div>
                            </div>
                            {layer.id === "platform" && (
                              <div className="mt-4 ml-12 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
                                {/* Components */}
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                  <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                    Components
                                  </div>
                                  <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                                    Reusable UI building blocks shared across all applications.
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="px-2.5 py-1 rounded-full bg-white text-emerald-700 text-[11px] md:text-xs font-semibold border border-emerald-200">
                                      ReasoningCard
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-white text-emerald-700 text-[11px] md:text-xs font-semibold border border-emerald-200">
                                      SOPViewer
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] md:text-xs font-semibold border border-emerald-200">
                                      Unified AI Console
                                    </span>
                                  </div>
                                </div>

                                {/* Platform services */}
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                  <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                    Platform Services
                                  </div>
                                  <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                                    Common SOP and workflow APIs consumed by every application.
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="px-2.5 py-1 rounded-full bg-white text-emerald-700 text-[11px] md:text-xs font-semibold border border-emerald-200">
                                      SOP APIs
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-white text-emerald-700 text-[11px] md:text-xs font-semibold border border-emerald-200">
                                      Chat / Analysis
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] md:text-xs font-semibold border border-emerald-200">
                                      Orchestration hooks
                                    </span>
                                  </div>
                                </div>

                                {/* Governance */}
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                  <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                    Governance
                                  </div>
                                  <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                                    Centralised auth, logging and guardrails for all AI‑driven flows.
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="px-2.5 py-1 rounded-full bg-white text-emerald-700 text-[11px] md:text-xs font-semibold border border-emerald-200">
                                      Auth & roles
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-white text-emerald-700 text-[11px] md:text-xs font-semibold border border-emerald-200">
                                      Logging
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] md:text-xs font-semibold border border-emerald-200">
                                      Guardrails & policies
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {layer.id !== "platform" && (
                              <ul className="mt-3 grid grid-cols-1 gap-1.5 text-xs md:text-sm text-gray-700 ml-12">
                                {visibleBullets.map((b) => (
                                  <li
                                    key={b}
                                    className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-1.5"
                                  >
                                    <ChevronRight className="w-3 h-3 mt-1 text-emerald-700" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Band 2B: AI Engine & Orchestration */}
                  <section className="rounded-2xl bg-gradient-to-r from-cyan-50 via-sky-50 to-emerald-50 border border-cyan-100 p-3 md:p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-base md:text-lg font-semibold tracking-[0.18em] text-cyan-600 uppercase">
                          AI Engine & Agentic Layer
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          How models, agents, and orchestration work together behind the scenes.
                        </p>
                      </div>
                      <div className="text-[11px] md:text-xs text-gray-600 text-right">
                        <div>
                          <span className="font-semibold">Models:</span>{" "}
                          GPT‑4 · GPT‑4o‑mini (Azure / GCP‑ready)
                        </div>
                      </div>
                    </div>
                    {/* Single hero card with internal sub‑boxes to match FAB Store / Platform style */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-cyan-100 bg-white/95 p-4 md:p-5 shadow-sm transition-all duration-150 hover:border-cyan-300 hover:shadow-md hover:scale-[1.01]"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Brain className="w-6 h-6 text-cyan-700" />
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                              Orchestration · Agents · Models
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] md:text-xs text-gray-600">
                            Multi‑step reasoning, SOP matching and orchestration shared by all TP.ai platforms and applications.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm mt-4">
                        {/* Orchestration */}
                        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                          <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                            Orchestration Layer
                          </div>
                          <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                            Routes and sequences calls between UIs, platforms, AI and data services.
                          </p>
                          <ul className="space-y-1 text-gray-700 text-[11px] md:text-xs">
                            <li>API gateway & routing (Express routes, auth hooks)</li>
                            <li>Planned workflow engine & event bus for complex flows</li>
                            <li>Central place for enforcing policies & cross‑cutting rules</li>
                          </ul>
                        </div>
                        {/* Agentic management */}
                        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                          <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                            Agentic Management
                          </div>
                          <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                            Coordinates which AI agents run when, and how they hand off to each other.
                          </p>
                          <ul className="space-y-1 text-gray-700 text-[11px] md:text-xs">
                            <li>Implements multi‑agent chains (Analysis → SOP Match → Risk → Recommendation)</li>
                            <li>Tracks agent responsibilities and hand‑offs</li>
                            <li>Planned: full agent registry and monitoring</li>
                          </ul>
                        </div>
                        {/* AI services */}
                        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                          <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                            AI Services Layer
                          </div>
                          <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                            Provides GPT‑4/4o‑based reasoning, RAG and streaming responses.
                          </p>
                          <ul className="space-y-1 text-gray-700 text-[11px] md:text-xs">
                            <li>GPT‑4 / GPT‑4o‑mini via LangChain (frontend) and Node (backend)</li>
                            <li>Multi‑agent reasoning with confidence scoring</li>
                            <li>RAG against SOP data + Server‑Sent Events for live streaming</li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {/* Band 3A: Backend / Execution Engine */}
                  <section className="rounded-2xl bg-gradient-to-r from-sky-50 via-white to-slate-50 border border-slate-300 shadow-md p-4 md:p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-base md:text-lg font-semibold tracking-[0.18em] text-slate-600 uppercase">
                          Backend Execution Engine
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          Node/Express services that expose AI and data to the outside world.
                        </p>
                      </div>
                      <div className="text-[11px] md:text-xs text-gray-600 text-right">
                        <div className="font-semibold">
                          APIs today: <span className="font-normal">/ai/analyze · /ai/chat · /health</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3 md:gap-4 md:grid-cols-1">
                      {backendLayers.map((layer, idx) => {
                        const isActive = layer.id === activeLayerId;
                        return (
                          <motion.button
                            key={layer.id}
                            type="button"
                            onClick={() => setActiveLayerId(layer.id)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`relative w-full text-left p-4 md:p-5 rounded-xl border bg-white/95 transition-all duration-150 ${
                              isActive
                                ? "border-slate-500/70 shadow-md scale-[1.01]"
                                : "border-gray-200/80 hover:border-slate-500/60 hover:bg-white hover:shadow-md hover:scale-[1.01]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="pt-0.5">
                                <layer.icon className="w-6 h-6 text-slate-700" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center flex-wrap gap-2">
                                  <h2 className="text-sm md:text-base font-semibold text-gray-900">
                                    {layer.name}
                                  </h2>
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                                    {layer.subtitle}
                                  </span>
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                                    {layer.status}
                                  </span>
                                </div>
                                <p className="text-[11px] md:text-xs text-gray-600">
                                  {layer.description}
                                </p>
                                {/* Highlight key backend capabilities as chips, similar to other bands */}
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                    <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                      APIs
                                    </div>
                                    <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                                      Public endpoints that surface AI reasoning and chat into UIs and systems.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        /ai/analyze
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        /ai/chat
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        /health
                                      </span>
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                    <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                      Streaming
                                    </div>
                                    <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                                      Keeps leaders and agents updated in real time as AI thinks.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        SSE reasoning
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        Live chat updates
                                      </span>
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                    <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                      Integration Ready
                                    </div>
                                    <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                                      Designed to plug into TP client systems and event streams.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        TP client systems
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        Queues / events
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Band 3B: Data & Infrastructure */}
                  <section className="rounded-2xl bg-gradient-to-r from-teal-50 via-white to-slate-50 border border-slate-300 shadow-md p-4 md:p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-base md:text-lg font-semibold tracking-[0.18em] text-slate-700 uppercase">
                          Data & Infrastructure
                        </p>
                        <p className="text-xs md:text-sm text-slate-600 mt-1">
                          Where SOPs, claims/cases and configuration actually live and scale.
                        </p>
                      </div>
                      <div className="text-[11px] md:text-xs text-slate-200 text-right">
                        <div>
                          <span className="font-semibold">Cloud targets:</span>{" "}
                          Azure · GCP · AWS · Client VPC
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3 md:gap-4 md:grid-cols-1">
                      {dataLayers.map((layer, idx) => {
                        const isActive = layer.id === activeLayerId;
                        const visibleBullets = isActive ? layer.bullets : layer.bullets.slice(0, 3);
                        return (
                          <motion.div
                            key={layer.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative w-full text-left p-4 md:p-5 rounded-xl border border-slate-200 bg-white text-gray-900"
                          >
                            <div className="flex items-start gap-3">
                              <div className="pt-0.5">
                                <layer.icon className="w-6 h-6 text-slate-700" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center flex-wrap gap-2">
                                  {/* Title already shown in band header above; keep only subtitle + status here */}
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                    {layer.subtitle}
                                  </span>
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                                    {layer.status}
                                  </span>
                                </div>
                                <p className="text-[11px] md:text-xs text-slate-100/90">
                                  {layer.description}
                                </p>

                                <div className="mt-4 ml-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
                                  {/* APIs */}
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                    <div className="font-semibold text-slate-900 mb-2 text-sm md:text-base">
                                      APIs
                                    </div>
                                    <p className="text-[11px] md:text-xs text-slate-600 mb-1">
                                      Unified REST endpoints that expose AI reasoning, SOP lookup and core operations.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        Claims / Cases
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        SOP APIs
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        Event / webhook endpoints
                                      </span>
                                    </div>
                                  </div>

                                  {/* Data stores */}
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                    <div className="font-semibold text-slate-900 mb-2 text-sm md:text-base">
                                      Data Stores
                                    </div>
                                    <p className="text-[11px] md:text-xs text-slate-600 mb-1">
                                      Central stores for SOP content, claims/cases, embeddings and configuration.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        SOP library
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        Vector index
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        Claim / case stores
                                      </span>
                                    </div>
                                  </div>

                                  {/* Ops & tooling */}
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors duration-150 hover:bg-white">
                                    <div className="font-semibold text-slate-900 mb-2 text-sm md:text-base">
                                      Ops & Tooling
                                    </div>
                                    <p className="text-[11px] md:text-xs text-slate-600 mb-1">
                                      Monitoring, deployment and observability to keep models and services healthy.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        Monitoring
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        Logging
                                      </span>
                                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 text-[11px] md:text-xs font-semibold border border-slate-200">
                                        Azure / GCP / AWS deploys
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Cross-cutting concerns */}
                  <div className="rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200 shadow-sm p-4 md:p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gray-700" />
                        <div>
                          <p className="text-sm md:text-base font-semibold text-gray-900">
                            Cross‑Cutting Controls
                          </p>
                          <p className="text-[11px] md:text-xs text-gray-600">
                            Security, observability and compliance applied across every layer above.
                          </p>
                        </div>
                      </div>
                      <div className="text-[11px] md:text-xs text-gray-600 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold border border-green-100">
                          Security / Observability – Built · Compliance – Partially Built
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] md:text-xs">
                      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors duration-150 hover:bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-gray-900">
                            Security
                          </span>
                        </div>
                        <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                          Protects access to FAB Store, platforms and APIs.
                        </p>
                        <ul className="space-y-1 text-gray-700">
                          <li>AuthContext-based sign‑in & session</li>
                          <li>CORS and API security on backend routes</li>
                        </ul>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors duration-150 hover:bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            Observability
                          </span>
                        </div>
                        <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                          Makes AI behaviour and flows traceable for operations teams.
                        </p>
                        <ul className="space-y-1 text-gray-700">
                          <li>AI agent metrics & reasoning traces</li>
                          <li>Error handling and streaming telemetry</li>
                        </ul>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors duration-150 hover:bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900">
                            Compliance
                          </span>
                        </div>
                        <p className="text-[11px] md:text-xs text-gray-600 mb-1">
                          Links AI decisions back to SOPs and steps for auditability.
                        </p>
                        <ul className="space-y-1 text-gray-700">
                          <li>SOP-linked reasoning and decisions</li>
                          <li>Traceability from recommendation → SOP → step</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {viewMode === "roi" && (
              <motion.div
                key="roi"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Platform ROI & Value
                  </h2>
                  <p className="text-base md:text-lg text-gray-600">
                    How FAB Store + SOP Executor translate into measurable business outcomes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {roiMetrics.map((m) => (
                    <div
                      key={m.label}
                      className="bg-gradient-to-br from-[#612D91] to-[#A64AC9] rounded-2xl text-white p-5 shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <m.icon className="w-7 h-7 opacity-90" />
                      </div>
                      <div className="text-4xl font-bold mb-1">{m.metric}</div>
                      <div className="text-sm font-semibold mb-3">{m.label}</div>
                      <ul className="space-y-2 text-xs">
                        {m.details.map((d) => (
                          <li key={d} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Why this architecture matters for Teleperformance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
                    <div>
                      <h4 className="font-semibold mb-2">Strategic</h4>
                      <p>
                        Create a reusable AI and SOP platform that can serve multiple verticals
                        (healthcare today, finance / insurance tomorrow) without rewriting the core.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Operational</h4>
                      <p>
                        Standardize how AI reasoning, SOPs, and decisioning show up across
                        clients—making operations easier to run, monitor, and audit.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Commercial</h4>
                      <p>
                        Shorten sales and delivery cycles by showing Cogniclaim / TP Resolve as
                        proof points on top of a platform that can be reused for new deals.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


