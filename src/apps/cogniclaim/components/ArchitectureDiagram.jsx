import { ArrowRight, FileText, Brain, Network, Database, Layers, Search } from "lucide-react";

const FLOW_NODES = [
  {
    id: "sop",
    label: "SOP Ingestion",
    description: "AI parses playbooks and converts them into decision trees",
    icon: FileText,
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "rag",
    label: "RAG Engine",
    description: "Chroma embeddings + semantic search retrieve the right context",
    icon: Search,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "ai",
    label: "Contextual AI",
    description: "GPT-4 applies SOP rules, crosswalks policies & past cases",
    icon: Brain,
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    id: "orch",
    label: "Orchestration",
    description: "Risk classification, routing, and human + AI handoffs",
    icon: Network,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "audit",
    label: "Audit Spine",
    description: "Tamper-proof logs with SOP clauses, evidence, and approvals",
    icon: Database,
    color: "from-amber-500 to-orange-500",
  },
];

const SIDE_NODES = [
  {
    id: "integration",
    label: "Integration Layer",
    description: "API-first adapters connect to your existing claim system / data lake",
    icon: Layers,
    color: "from-rose-500 to-red-500",
  },
];

export default function ArchitectureDiagram() {
  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 space-y-8">
      {/* Desktop / tablet flow */}
      <div className="hidden md:flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          {FLOW_NODES.map((node, index) => (
            <div key={node.id} className="flex items-center gap-4 flex-1 min-w-[140px]">
              <NodeCard node={node} />
              {index !== FLOW_NODES.length - 1 && (
                <div className="flex-1 flex items-center">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#612D91]/40 to-transparent relative">
                    <ArrowRight className="w-4 h-4 text-[#612D91] absolute -right-2 -top-2" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          {SIDE_NODES.map((node) => (
            <div key={node.id} className="flex-1 max-w-md">
              <NodeCard node={node} layout="horizontal" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile stacked flow */}
      <div className="md:hidden space-y-4">
        {FLOW_NODES.map((node, index) => (
          <div key={node.id} className="space-y-2">
            <NodeCard node={node} stacked />
            {index !== FLOW_NODES.length - 1 && (
              <div className="flex items-center gap-2 pl-6 text-xs uppercase tracking-wide text-[#612D91]">
                <ArrowRight className="w-4 h-4" />
                Feeds next layer
              </div>
            )}
          </div>
        ))}
        {SIDE_NODES.map((node) => (
          <NodeCard key={node.id} node={node} stacked />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <LegendItem
          icon={<FileText className="w-4 h-4 text-white" />}
          title="SOP Processing"
          description="AI extracts and versions your playbooks"
          color="from-blue-500 to-indigo-500"
        />
        <LegendItem
          icon={<Brain className="w-4 h-4 text-white" />}
          title="Contextual AI"
          description="RAG + GPT-4 reasoning grounded in SOPs"
          color="from-purple-500 to-pink-500"
        />
        <LegendItem
          icon={<Network className="w-4 h-4 text-white" />}
          title="Orchestration"
          description="Routes every claim with SOP-enforced logic"
          color="from-green-500 to-emerald-500"
        />
      </div>
    </div>
  );
}

function NodeCard({ node, layout = "vertical", stacked = false }) {
  const Icon = node.icon;
  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4 flex ${
        layout === "horizontal" || stacked ? "items-center gap-3" : "flex-col gap-3 text-center"
      }`}
    >
      <div className={`p-3 rounded-lg bg-gradient-to-br ${node.color} shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`${layout === "horizontal" || stacked ? "text-left" : "text-center"} text-sm`}>
        <div className="font-semibold text-gray-900 dark:text-white">{node.label}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{node.description}</div>
      </div>
    </div>
  );
}

function LegendItem({ icon, title, description, color }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>{icon}</div>
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
      </div>
    </div>
  );
}

