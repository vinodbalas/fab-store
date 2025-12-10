/**
 * Reasoning Summary Card - Platform-Agnostic
 * 
 * Displays the final recommendation with action buttons
 */

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, XCircle, FileText, AlertCircle } from "lucide-react";

export default function ReasoningSummaryCard({ 
  recommendation, 
  item, 
  itemLabel = "item",
  onAction,
  onReferenceView,
}) {
  const getActionButtons = () => {
    if (!recommendation?.actions) return [];

    return recommendation.actions.map((action) => {
      const icons = {
        approve: CheckCircle2,
        deny: XCircle,
        schedule: FileText,
        escalate: AlertCircle,
      };
      const Icon = icons[action.type] || FileText;

      return (
        <button
          key={action.type}
          onClick={() => onAction?.(action.type, recommendation)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            action.type === "approve"
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : action.type === "deny"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Icon className="w-4 h-4 inline mr-2" />
          {action.label}
        </button>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#612D91] to-[#A64AC9]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-2">Recommendation</h3>
          <p className="text-gray-700 leading-relaxed">
            {recommendation.text || recommendation.recommendation || "No recommendation available"}
          </p>
        </div>
        {recommendation.confidence && (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white text-indigo-700 border border-indigo-200">
            {Math.round(recommendation.confidence * 100)}% confidence
          </span>
        )}
      </div>

      {/* References */}
      {recommendation.references && recommendation.references.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-700 uppercase">References</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendation.references.map((ref, idx) => (
              <button
                key={idx}
                onClick={() => onReferenceView?.(ref.id, ref.type)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                {ref.label || ref.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {recommendation.actions && recommendation.actions.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-indigo-200">
          {getActionButtons()}
        </div>
      )}
    </motion.div>
  );
}

