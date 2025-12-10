import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, FileText } from "lucide-react";

/**
 * Recommended Next Steps Component
 * Displays AI-recommended next actions as a separate card
 */
export default function RecommendedNextSteps({ nextSteps = [], onAction, recommendation, onSOPView, case: caseData }) {
  if (!nextSteps || nextSteps.length === 0) {
    return null;
  }

  const actionType = recommendation?.text?.toLowerCase().includes("deny")
    ? "deny"
    : recommendation?.text?.toLowerCase().includes("request")
    ? "request"
    : recommendation?.text?.toLowerCase().includes("approve")
    ? "approve"
    : "review";
  const actionLabels = {
    deny: "Deny",
    request: "Request Info",
    approve: "Approve",
    review: "Review",
  };
  const actionLabel = actionLabels[actionType] || "Review";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 250 }}
      className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden bg-white dark:bg-gray-800"
    >
      {/* Header with purple gradient background */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#612D91] to-[#A64AC9]">
        <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h4 className="font-semibold text-sm text-white">Recommended Next Steps</h4>
      </div>
      
      {/* Content with yellow/orange background box */}
      <div className="px-4 py-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-start justify-between gap-4">
          {/* Next Steps List in yellow/orange box */}
          <div className="flex-1 space-y-2.5">
            {nextSteps.slice(0, 3).map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.4 + idx * 0.08,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="flex items-start gap-2.5"
              >
                <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center shadow-sm">
                  <span className="text-white text-[10px] font-bold">{idx + 1}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed flex-1">
                  {step}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* Action Buttons on the right */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              onClick={() => onAction?.(actionType, recommendation)}
              className="px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AlertTriangle className="w-4 h-4" />
              {actionLabel}
            </motion.button>
            
            {recommendation?.sopRefs && recommendation.sopRefs.length > 0 && (
              <motion.button
                onClick={() => {
                  if (caseData?.scenario) {
                    onSOPView?.(caseData.scenario, caseData.scenario, caseData?.status, null);
                  } else if (recommendation.sopRefs[0]) {
                    onSOPView?.(recommendation.sopRefs[0], null, caseData?.status, null);
                  }
                }}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FileText className="w-4 h-4" />
                SOP
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

