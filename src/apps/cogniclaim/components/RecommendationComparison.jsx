import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Recommendation Comparison Component
 * Shows side-by-side comparison of Pre-Screening (Rule-Based) vs AI Reasoning recommendations
 */
export default function RecommendationComparison({ preScreeningResult, aiRecommendation }) {
  if (!preScreeningResult?.recommendation && !aiRecommendation) return null;

  const preScreeningAction = preScreeningResult?.recommendation?.action;
  // Extract AI action from recommendation object - check multiple possible fields
  const aiAction = aiRecommendation?.action || 
    aiRecommendation?.actionType ||
    (aiRecommendation?.text?.toLowerCase().includes("deny") || aiRecommendation?.text?.toLowerCase().includes("should be denied") ? "DENY" :
     aiRecommendation?.text?.toLowerCase().includes("approve") || aiRecommendation?.text?.toLowerCase().includes("may proceed") || aiRecommendation?.text?.toLowerCase().includes("proceed") ? "APPROVE" :
     aiRecommendation?.text?.toLowerCase().includes("review") || aiRecommendation?.text?.toLowerCase().includes("requires review") ? "REVIEW" :
     aiRecommendation?.text?.toLowerCase().includes("process") ? "APPROVE" : null);

  // Normalize actions for comparison
  const normalizeAction = (action) => {
    if (!action) return null;
    const upper = action.toUpperCase();
    if (upper === "PROCESS") return "APPROVE";
    return upper;
  };

  const normalizedPreScreening = normalizeAction(preScreeningAction);
  const normalizedAI = normalizeAction(aiAction);

  // Determine agreement status
  const getAgreementStatus = () => {
    if (!normalizedPreScreening || !normalizedAI) return "unknown";
    if (normalizedPreScreening === normalizedAI) return "agree";
    return "disagree";
  };

  const agreementStatus = getAgreementStatus();

  const getActionColor = (action) => {
    if (action === "DENY") return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    if (action === "APPROVE") return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  };

  const getAgreementIcon = () => {
    if (agreementStatus === "agree") {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    if (agreementStatus === "disagree") {
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getAgreementText = () => {
    if (agreementStatus === "agree") {
      return "Recommendations Agree";
    }
    if (agreementStatus === "disagree") {
      return "Recommendations Differ - Review Required";
    }
    return "Comparison Unavailable";
  };

  const getAgreementColor = () => {
    if (agreementStatus === "agree") {
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200";
    }
    if (agreementStatus === "disagree") {
      return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200";
    }
    return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl border-2 border-gray-200 dark:border-gray-800 p-4 shadow-lg mb-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 shadow-md">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Recommendation Comparison
          </h3>
          <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
            Rule-Based vs AI-Powered Analysis
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg border ${getAgreementColor()} flex items-center gap-2`}>
          {getAgreementIcon()}
          <span className="text-xs font-semibold">{getAgreementText()}</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pre-Screening Recommendation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded bg-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Rule-Based Pre-Screening
            </span>
          </div>
          {preScreeningResult?.recommendation ? (
            <div className={`rounded-lg p-3 border-2 ${getActionColor(normalizedPreScreening)}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-sm">{normalizedPreScreening}</span>
                {agreementStatus === "agree" && normalizedPreScreening === normalizedAI && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {preScreeningResult.recommendation.reason}
              </p>
              {preScreeningResult.denialCodes && preScreeningResult.denialCodes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {preScreeningResult.denialCodes.slice(0, 2).map((code, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[9px] font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    >
                      {code.code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg p-3 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">No pre-screening recommendation available</p>
            </div>
          )}
        </div>

        {/* AI Reasoning Recommendation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded bg-purple-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              AI-Powered Reasoning
            </span>
          </div>
          {aiRecommendation ? (
            <div className={`rounded-lg p-3 border-2 ${getActionColor(normalizedAI)}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-sm">{normalizedAI || "REVIEW"}</span>
                {agreementStatus === "agree" && normalizedPreScreening === normalizedAI && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                {agreementStatus === "disagree" && (
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {aiRecommendation.text || aiRecommendation.reason || "AI analysis recommendation"}
              </p>
              {aiRecommendation.confidence && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        style={{ width: `${(aiRecommendation.confidence || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-400">
                      {Math.round((aiRecommendation.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg p-3 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">AI reasoning in progress...</p>
            </div>
          )}
        </div>
      </div>

      {/* Agreement Details */}
      {agreementStatus === "disagree" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-orange-800 dark:text-orange-200 mb-1">
                Recommendation Mismatch Detected
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                The rule-based pre-screening and AI reasoning have different recommendations. 
                This may indicate an edge case or nuanced scenario requiring human review. 
                Please review both analyses carefully before making a decision.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {agreementStatus === "agree" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-green-200 dark:border-green-800"
        >
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">
                High Confidence Recommendation
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Both rule-based pre-screening and AI reasoning agree on the recommendation, 
                providing high confidence in the decision.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

