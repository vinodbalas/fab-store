/**
 * Reasoning Card - Platform-Agnostic
 * 
 * Displays a single reasoning step from AI agents
 */

import { motion } from "framer-motion";
import { Brain, CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function ReasoningCard({ step, agentNames, onReferenceView }) {
  const getAgentIcon = (agentName) => {
    const name = (agentName || "").toLowerCase();
    if (name.includes("risk") || name.includes("assess")) return AlertCircle;
    if (name.includes("match") || name.includes("resource")) return CheckCircle2;
    if (name.includes("analyze") || name.includes("analysis")) return Brain;
    return Info;
  };

  const getAgentColor = (agentName) => {
    const name = (agentName || "").toLowerCase();
    if (name.includes("risk")) return "text-red-600 bg-red-50 border-red-200";
    if (name.includes("match")) return "text-blue-600 bg-blue-50 border-blue-200";
    if (name.includes("analyze")) return "text-purple-600 bg-purple-50 border-purple-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const AgentIcon = getAgentIcon(step.agent);
  const colorClass = getAgentColor(step.agent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-white shadow-sm p-4"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <AgentIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-sm">
              {step.agent || agentNames?.analyzer || "Analysis"}
            </h4>
            {step.confidence && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {Math.round(step.confidence * 100)}%
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-2">{step.text || step.result || step.details}</p>
          {step.references && step.references.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {step.references.map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => onReferenceView?.(ref.id, ref.type)}
                  className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                >
                  {ref.label || ref.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

