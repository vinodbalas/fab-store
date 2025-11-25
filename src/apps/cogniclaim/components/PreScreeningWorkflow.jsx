import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Clock, XCircle, FileText, BookOpen, Shield, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processPreScreening } from "../services/preScreeningService";
import { getSOPByScenario } from "../data/sops";
import TransparencyLog from "./TransparencyLog";
import DenialCodeBadge from "./DenialCodeBadge";

/**
 * Pre-Screening Workflow Component
 * Displays step-by-step pre-screening process with real-time updates
 */
export default function PreScreeningWorkflow({ claim, onComplete, onSOPReference, onSOPView }) {
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!claim) return;

    // Reset state when claim changes
    setResult(null);
    setCurrentStep(0);
    setProcessing(true);
    setError(null);

    // Start pre-screening process
    const startProcessing = async () => {
      try {
        const screeningResult = await processPreScreening(claim, (updatedResult) => {
          setResult(updatedResult);
          setCurrentStep(updatedResult.steps.length - 1);
          
          // Trigger SOP reference if scenario has document references
          if (updatedResult.documentReferences && updatedResult.documentReferences.length > 0 && onSOPReference) {
            onSOPReference(updatedResult.documentReferences);
          }
        });
        
        setResult(screeningResult);
        setProcessing(false);
        
        if (onComplete) {
          onComplete(screeningResult);
        }
      } catch (err) {
        console.error("Pre-screening error:", err);
        setError(err.message);
        setProcessing(false);
      }
    };

    startProcessing();
  }, [claim?.id]); // Re-run when claim ID changes

  if (!claim) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No claim selected for pre-screening
      </div>
    );
  }

  const scenario = claim.scenario;
  const sop = scenario ? getSOPByScenario(scenario) : null;

  const getStepIcon = (step) => {
    if (step.status === "success") {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (step.status === "warning") {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    } else if (step.status === "error") {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-400 animate-pulse" />;
    }
  };

  const getStepStatusColor = (status) => {
    switch (status) {
      case "success":
        return "border-green-500 bg-green-50 dark:bg-green-900/20";
      case "warning":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "error":
        return "border-red-500 bg-red-50 dark:bg-red-900/20";
      default:
        return "border-gray-300 bg-gray-50 dark:bg-gray-800";
    }
  };

  const getScenarioTitle = (scenario) => {
    switch (scenario) {
      case "build-days":
        return "Build Days Exceed Authorized Days (Texas)";
      case "cob":
        return "Coordination of Benefits (COB)";
      case "precertification":
        return "Precertification Requirements";
      case "generic":
        return "Standard Pre-Screening";
      default:
        return "Pre-Screening";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{getScenarioTitle(scenario)}</h3>
            <p className="text-sm text-white/80 mt-1">
              Claim {claim.id} • {claim.member} • {claim.provider}
            </p>
          </div>
          {sop && (
            <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded">
              <BookOpen className="w-4 h-4" />
              <span>{sop.page}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Processing Steps */}
      {result && result.steps.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Processing Steps
          </h4>
          <div className="space-y-2">
            {result.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border-l-4 rounded-r-lg p-4 ${getStepStatusColor(step.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        Step {step.step}: {step.title}
                      </span>
                      {step.status === "error" && (
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                          REQUIRES ATTENTION
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {step.action}
                    </p>
                    {step.details && Object.keys(step.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                          View details
                        </summary>
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {JSON.stringify(step.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {result && result.recommendation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg p-4 border-2 ${
            result.recommendation.action === "DENY"
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : result.recommendation.action === "APPROVE"
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          }`}
        >
          <div className="flex items-start gap-3">
            <Shield className={`w-5 h-5 ${
              result.recommendation.action === "DENY"
                ? "text-red-500"
                : result.recommendation.action === "APPROVE"
                ? "text-green-500"
                : "text-blue-500"
            }`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`font-semibold text-sm ${
                  result.recommendation.action === "DENY"
                    ? "text-red-800 dark:text-red-200"
                    : result.recommendation.action === "APPROVE"
                    ? "text-green-800 dark:text-green-200"
                    : "text-blue-800 dark:text-blue-200"
                }`}>
                  Recommendation: {result.recommendation.action}
                </span>
                {result.denialCodes && result.denialCodes.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {result.denialCodes.map((code, idx) => (
                      <DenialCodeBadge key={idx} code={code.code} description={code.description} />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {result.recommendation.reason}
              </p>
              {result.recommendation.sopReference && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <BookOpen className="w-3 h-3" />
                  <span>SOP Reference: {result.recommendation.sopReference}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Transparency Log */}
      {result && result.log && result.log.length > 0 && (
        <TransparencyLog logEntries={result.log} />
      )}

      {/* Processing Indicator */}
      {processing && !result && (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-[#612D91] animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Processing pre-screening...
          </p>
        </div>
      )}

      {/* Completion Status */}
      {result && result.completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">
              Pre-screening completed in {(result.totalTime / 1000).toFixed(2)}s
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

