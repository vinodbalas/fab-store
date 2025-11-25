/**
 * Reasoning Card - Compact card with progress bar and animations
 * Shows all information directly without flip functionality
 */

import { Sparkles, AlertCircle, Info, Zap, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ReasoningCard({ step, index, onSOPView, claim, isStreaming = false, isComplete = false, progress = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Allow rendering even if step doesn't have role yet (for streaming)
  if (!step && progress === 0 && !isComplete) {
    // Show skeleton loader
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.2, type: "spring", stiffness: 300 }}
        className="h-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 p-4 flex flex-col"
      >
        {/* Skeleton Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Skeleton Content */}
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-3 w-3/5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        
        {/* Skeleton Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-300 dark:bg-gray-700"
              initial={{ width: 0 }}
              animate={{ width: "30%" }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Get card config based on index (since we know the order)
  const getCardConfig = (index) => {
    if (index === 0) {
      return {
        icon: Info,
        title: "Analysis",
        color: "blue",
        bgGradient: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20",
        borderColor: "border-blue-300 dark:border-blue-600",
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
        iconColor: "text-blue-600 dark:text-blue-400",
        progressColor: "from-blue-500 to-indigo-500"
      };
    }
    if (index === 1) {
      return {
        icon: Sparkles,
        title: "SOP Matcher",
        color: "purple",
        bgGradient: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20",
        borderColor: "border-purple-300 dark:border-purple-600",
        iconBg: "bg-purple-100 dark:bg-purple-900/40",
        iconColor: "text-purple-600 dark:text-purple-400",
        progressColor: "from-purple-500 to-pink-500"
      };
    }
    if (index === 2) {
      return {
        icon: AlertCircle,
        title: "Risk Assessor",
        color: "orange",
        bgGradient: "from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20",
        borderColor: "border-orange-300 dark:border-orange-600",
        iconBg: "bg-orange-100 dark:bg-orange-900/40",
        iconColor: "text-orange-600 dark:text-orange-400",
        progressColor: "from-orange-500 to-red-500"
      };
    }
    return {
      icon: Zap,
      title: "Processing",
      color: "gray",
      bgGradient: "from-gray-500/10 to-gray-500/10 dark:from-gray-500/20 dark:to-gray-500/20",
      borderColor: "border-gray-300 dark:border-gray-600",
      iconBg: "bg-gray-100 dark:bg-gray-900/40",
      iconColor: "text-gray-600 dark:text-gray-400",
      progressColor: "from-gray-500 to-gray-600"
    };
  };

  // If no step, use card config based on index
  const config = step ? getCardConfig(index) : getCardConfig(index);
  const StepIcon = config.icon;
  
  // Normalize step to have role if missing
  const normalizedStep = step?.role ? step : (step ? { ...step, role: "ai-step" } : null);
  const confidence = normalizedStep?.confidence || 0;
  const actualProgress = isComplete ? 100 : (progress > 0 ? progress : (isStreaming ? 75 : 0));

  // Get confidence color
  const getConfidenceColor = (conf) => {
    if (conf >= 0.9) return "text-green-600 dark:text-green-400";
    if (conf >= 0.75) return "text-blue-600 dark:text-blue-400";
    if (conf >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getConfidenceBg = (conf) => {
    if (conf >= 0.9) return "bg-green-100 dark:bg-green-900/30";
    if (conf >= 0.75) return "bg-blue-100 dark:bg-blue-900/30";
    if (conf >= 0.6) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-orange-100 dark:bg-orange-900/30";
  };

  // Extract key points from text
  const getKeyPoints = (text) => {
    if (!text) return [];
    const sentences = text.split(/[.!?]\s+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 2);
  };

  const keyPoints = getKeyPoints(normalizedStep?.text);
  const displayText = normalizedStep?.text?.substring(0, 100) || "Processing...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.2, type: "spring", stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative h-full rounded-xl border-2 ${config.borderColor} bg-gradient-to-br ${config.bgGradient} p-4 shadow-lg hover:shadow-xl transition-all flex flex-col overflow-hidden`}
    >
      {/* Animated background on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        animate={{
          opacity: isHovered ? 0.08 : 0,
          background: `radial-gradient(circle at 50% 50%, rgba(97, 45, 145, 0.2), transparent 70%)`
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <motion.div
              className={`p-2.5 rounded-xl ${config.iconBg} shadow-md`}
              animate={isStreaming ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {
                scale: 1,
                rotate: 0
              }}
              transition={{
                duration: 2,
                repeat: isStreaming ? Infinity : 0,
                repeatDelay: 1
              }}
            >
              <StepIcon className={`w-5 h-5 ${config.iconColor}`} />
            </motion.div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {config.title}
              </h3>
              {confidence > 0 && (
                <motion.span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getConfidenceBg(confidence)} ${getConfidenceColor(confidence)}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  {Math.round(confidence * 100)}%
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 mb-3">
          {normalizedStep ? (
            <motion.p
              className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.15 + 0.1 }}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {isStreaming ? (
                <>
                  {normalizedStep.text || "Processing..."}
                  <span className="inline-block w-1 h-3 bg-[#612D91] ml-1 animate-pulse" />
                </>
              ) : (
                displayText + (normalizedStep.text?.length > 100 ? "..." : "")
              )}
            </motion.p>
          ) : (
            <motion.div
              className="space-y-1.5 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.15 + 0.1 }}
            >
              <div className="h-3 w-full bg-gray-200/50 dark:bg-gray-800/50 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-gray-200/50 dark:bg-gray-800/50 rounded animate-pulse" />
            </motion.div>
          )}

          {/* Key Points */}
          {keyPoints.length > 0 && !isStreaming && (
            <motion.ul
              className="space-y-1 text-[10px] text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.2 + 0.2 }}
            >
              {keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className={`${config.iconColor} mt-0.5 shrink-0 font-bold`}>•</span>
                  <span style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>{point.substring(0, 55)}</span>
                </li>
              ))}
            </motion.ul>
          )}

          {/* SOP References - Compact */}
          {normalizedStep?.sopRefs && normalizedStep.sopRefs.length > 0 && !isStreaming && (
            <motion.div
              className="mt-2 flex flex-wrap gap-1.5"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 + 0.3 }}
            >
              {normalizedStep.sopRefs.slice(0, 2).map((ref, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    if (ref.includes("Page") || ref.match(/^\d+$/)) {
                      const pageNum = ref.replace("Page ", "").replace("page ", "");
                      onSOPView?.(pageNum, null, claim?.status, null);
                    } else {
                      onSOPView?.(ref, null, claim?.status, null);
                    }
                  }}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-white/80 dark:bg-gray-800/80 text-[#612D91] dark:text-[#A64AC9] hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md border border-[#612D91]/20 dark:border-[#A64AC9]/30 flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileText className="w-2.5 h-2.5" />
                  {ref.length > 12 ? ref.substring(0, 12) + "..." : ref}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="shrink-0">
          <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400 mb-1.5">
            <span className="font-semibold">Progress</span>
            <span className={`font-bold ${actualProgress === 100 ? "text-green-600 dark:text-green-400" : config.iconColor}`}>
              {actualProgress}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${actualProgress}%` }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2 + 0.1,
                ease: "easeOut" 
              }}
              className={`h-full rounded-full bg-gradient-to-r ${config.progressColor} shadow-sm`}
            />
            {isStreaming && (
              <motion.div
                className="h-full w-1/3 bg-white/30 rounded-full"
                animate={{
                  x: ["-100%", "400%"]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

