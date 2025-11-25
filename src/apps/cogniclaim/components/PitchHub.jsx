import { motion } from "framer-motion";
import { TrendingUp, Clock, DollarSign, Shield, Zap, FileText, Download, Sparkles, Brain, Network, Database, Layers, Cpu, Search, Code, BarChart, Store } from "lucide-react";
import Tabs from "./Tabs";
import ArchitectureDiagram from "./ArchitectureDiagram";

export default function PitchHub({ onNavigate }) {

  const metrics = [
    {
      icon: Clock,
      value: "4 hours → 6 minutes",
      label: "Complex Appeals Review",
      description: "Auto-classification, SOP routing, and pre-built justification packets",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      value: "72% reduction",
      label: "Manual Data Reconciliation",
      description: "Contextual AI crosswalks policies, prior cases, and exhibits automatically",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: DollarSign,
      value: "15% more leakage recovered",
      label: "High-Severity Claims",
      description: "SOP deviation detection with forced confirm/override decisions",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      value: "100% audit-ready",
      label: "Transparency & Compliance",
      description: "Every AI recommendation tied to SOP clause, evidence bundle, and human approval",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const architectureComponents = [
    {
      icon: FileText,
      title: "SOP Ingestion Layer",
      description: "Parses your existing playbooks, extracts decision trees, and maps approval workflows",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Brain,
      title: "Contextual AI Engine",
      description: "RAG-powered semantic search with Chroma embeddings. Cross-references policies, prior cases, and real-time claim data",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Network,
      title: "Orchestration Engine",
      description: "Enforces SOP branches in real-time, routes claims by risk level, and manages human + AI handoffs",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Database,
      title: "Audit Spine",
      description: "Tamper-proof logs linking every decision to its originating SOP clause, evidence bundle, and approver",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Layers,
      title: "Integration Layer",
      description: "API-first architecture. Works with existing claim systems via secure bridges—no rip-and-replace",
      color: "from-red-500 to-rose-500",
    },
  ];

  const OverviewTab = (
    <div className="space-y-6">
      {/* Hero Pitch */}
      <div className="bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10 dark:from-[#612D91]/20 dark:to-[#A64AC9]/20 rounded-xl p-6 border border-[#612D91]/20 dark:border-[#A64AC9]/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-[#612D91] to-[#A64AC9] shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Cogniclaim: SOP-Native Claims Intelligence
            </h2>
            <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              Cogniclaim is the only claims intelligence platform built to orchestrate the SOPs you already trust. 
              Unlike generic AI copilots that scrape documents or bolt onto canned workflows, Cogniclaim ingests your 
              exact playbooks, rewrites them into contextual decision trees, and enforces them live across every claim, 
              giving you audit-ready reasoning, orchestrated human + AI handoffs, and measurable acceleration—from hours 
              to seconds—without sacrificing compliance fidelity.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#612D91] dark:text-[#A64AC9] font-medium">
              <Zap className="w-4 h-4" />
              <span>SOP-native • Contextual AI • Audit-ready • Hours to seconds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9]" />
          The Problem
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Claims organizations live and die by their SOPs, yet every exception, escalation, and new policy adds more friction. 
          High-dollar claims still bounce between teams, audit trails get patchy, and leadership lacks a real-time view of 
          whether frontline decisions actually honor the playbook.
        </p>
      </div>

      {/* How It Fits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Network className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9]" />
          How It Fits Today
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-[#612D91] dark:text-[#A64AC9] font-bold mt-0.5">•</span>
            <span>Works with your existing claim system via APIs or secure RPA bridges; no rip-and-replace</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#612D91] dark:text-[#A64AC9] font-bold mt-0.5">•</span>
            <span>Mirrors your compliance controls: every action inherits the SOP's approval matrix and creates a tamper-proof log for regulators</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#612D91] dark:text-[#A64AC9] font-bold mt-0.5">•</span>
            <span>Adds "continuous context" to teams—CSR, legal, and medical reviewers see the same live reasoning tree, so handoffs stop breaking the process</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#612D91] to-[#A64AC9] rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Ready to See Your SOPs Enforced & Accelerated?</h3>
        <p className="text-sm opacity-90 mb-4">
          Let's run a 30-day pilot on your highest-friction claim lane and prove the hours-to-seconds impact.
        </p>
        <button className="px-4 py-2 bg-white text-[#612D91] rounded-lg font-medium hover:bg-gray-100 transition-colors">
          Schedule Demo
        </button>
      </div>
    </div>
  );

  const MetricsTab = (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9]" />
          Quantified Impact
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Real results from Cogniclaim deployments across complex claims processing workflows.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {metric.value}
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {metric.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {metric.description}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const ArchitectureTab = (
    <div className="space-y-6">
      {/* Visual Architecture Diagram */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9]" />
          System Architecture
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Cogniclaim's architecture is built around SOP orchestration with AI at its core, ensuring every decision is traceable, 
          compliant, and accelerated.
        </p>
        <ArchitectureDiagram />
      </div>

      {/* Component Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Core Components</h3>
        <div className="space-y-4">
          {architectureComponents.map((component, idx) => {
            const Icon = component.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
              >
                <div className={`p-3 rounded-lg bg-gradient-to-br ${component.color} shadow-md flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{component.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{component.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Architecture Flow Diagram (Text-based) */}
      <div className="bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10 dark:from-[#612D91]/20 dark:to-[#A64AC9]/20 rounded-xl p-6 border border-[#612D91]/20 dark:border-[#A64AC9]/20">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Data Flow
        </h4>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#612D91] dark:text-[#A64AC9]">1.</span>
            <span>SOP documents ingested → AI parses into decision trees with NLP & structure extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#612D91] dark:text-[#A64AC9]">2.</span>
            <span>Claim arrives → RAG engine retrieves context via Chroma embeddings, crosswalks policies, prior cases, exhibits</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#612D91] dark:text-[#A64AC9]">3.</span>
            <span>Contextual AI (GPT-4) reasons with SOP context → orchestration engine routes by SOP branch & risk classification</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#612D91] dark:text-[#A64AC9]">4.</span>
            <span>Human + AI handoff → decision logged with SOP reference, evidence bundle, AI reasoning trace, approver</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#612D91] dark:text-[#A64AC9]">5.</span>
            <span>Audit spine creates tamper-proof trail with full AI reasoning chain for compliance & reporting</span>
          </div>
        </div>
      </div>
    </div>
  );

  const HowItWorksTab = (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9]" />
          How Cogniclaim Works
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#612D91] dark:bg-[#A64AC9] text-white text-xs flex items-center justify-center">1</span>
              SOP Ingestion & Parsing
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
              Upload your existing SOP documents. Cogniclaim's AI parses them to extract decision trees, 
              approval workflows, and compliance rules. The system understands your playbook structure and 
              maps it to executable logic.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#612D91] dark:bg-[#A64AC9] text-white text-xs flex items-center justify-center">2</span>
              Contextual AI Analysis
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
              When a claim arrives, Cogniclaim uses RAG (Retrieval-Augmented Generation) with semantic search 
              powered by Chroma embeddings. It crosswalks the claim against policies, prior similar cases, 
              and relevant exhibits—all before an adjuster even opens the file.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#612D91] dark:bg-[#A64AC9] text-white text-xs flex items-center justify-center">3</span>
              SOP-Enforced Orchestration
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
              The orchestration engine routes claims by SOP branch, classifies risk levels, and triggers 
              the appropriate workflow. Every decision point references the originating SOP clause, ensuring 
              compliance at every step.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#612D91] dark:bg-[#A64AC9] text-white text-xs flex items-center justify-center">4</span>
              Human + AI Collaboration
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
              For high-risk or complex cases, Cogniclaim surfaces recommendations with full reasoning. 
              Adjusters can approve, override, or request more context. Every action is logged with the 
              SOP reference, evidence bundle, and human approver—creating an audit-ready trail.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#612D91] dark:bg-[#A64AC9] text-white text-xs flex items-center justify-center">5</span>
              Continuous Monitoring & Reporting
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
              Leadership gets real-time visibility into claim processing, SOP adherence rates, and 
              bottleneck identification. The audit spine ensures every decision is traceable for 
              regulatory compliance and internal reviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#612D91] to-[#A64AC9]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Cogniclaim Product Hub</h1>
            <p className="text-xs text-white/80">Everything you need to know about Cogniclaim</p>
          </div>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate("store")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#612D91] bg-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Store className="w-4 h-4" />
            Back to Store
          </button>
        )}
      </div>
      <div className="flex-1 flex">
        <div className="flex-1">
          <div className="p-6">
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs
          tabs={[
            { label: "Overview", content: OverviewTab },
            { label: "Metrics", content: MetricsTab },
            { label: "Architecture", content: ArchitectureTab },
            { label: "How It Works", content: HowItWorksTab },
          ]}
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Need more details? Contact us for a personalized demo.
        </div>
        <button className="px-4 py-2 bg-[#612D91] hover:bg-[#7B3DA1] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download One-Pager
        </button>
      </div>
    </div>
  );
}

