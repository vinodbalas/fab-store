/**
 * Reasoning Card - Platform Component
 * Compact card with progress bar and animations
 * Accepts SOP data via sopProvider prop
 */

import { Sparkles, AlertCircle, Info, Zap, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-1 select-none">
    {children}
  </p>
);

const DetailPill = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="px-3 py-1.5 rounded-lg border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-200 shadow-sm">
      <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-0.5">
        {label}
      </p>
      <p className="text-xs font-semibold">
        {value}
      </p>
    </div>
  );
};

export default function ReasoningCard({ step, index, onSOPView, item, sopProvider, isStreaming = false, isComplete = false, progress = 0 }) {
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
        title: "Intake Agent",
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
        title: "SOP Reasoning",
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
        title: "SLA Risk Assessment",
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
  const scenarioTag = normalizedStep?.scenario || item?.scenario || null;
  
  // Use sopProvider to get SOP data
  const SCENARIO_SOPS = sopProvider?.getScenarioSOPs() || {};
  const SOP_INDEX = sopProvider?.getSOPIndex() || {};
  const scenarioKey = scenarioTag && SCENARIO_SOPS[scenarioTag] ? scenarioTag : null;
  const itemStatusKey = item?.status && SOP_INDEX[item.status] ? item.status : null;
  const scenarioSOP = scenarioKey ? SCENARIO_SOPS[scenarioKey] : null;
  const statusSOP = itemStatusKey ? SOP_INDEX[itemStatusKey] : null;
  const primarySOP = scenarioSOP || statusSOP || null;

  const formatCurrency = (value) => {
    if (!value && value !== 0) return null;
    return `$${Number(value).toLocaleString()}`;
  };

  const getItemAge = () => {
    if (!item?.date) return null;
    const days = Math.max(0, Math.floor((new Date() - new Date(item.date)) / (1000 * 60 * 60 * 24)));
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const getSLASummary = () => {
    const days =
      typeof item?.daysUntilSLA === "number"
        ? item.daysUntilSLA
        : typeof item?.daysUntilDeadline === "number"
        ? item.daysUntilDeadline
        : null;
    if (days === null) return null;
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "1 day remaining";
    return `${days} days remaining`;
  };

  const resolveScenarioByPage = (page) => {
    if (!page || !sopProvider) return null;
    const cleaned = page.replace(/Page\s*/i, "");
    const scenarioSOPs = sopProvider.getScenarioSOPs();
    const entry = Object.entries(scenarioSOPs).find(([, sop]) =>
      sop.page?.toLowerCase().includes(cleaned.toLowerCase())
    );
    return entry ? entry[0] : null;
  };

  const findStatusBySopRef = (ref) => {
    if (!ref || !sopProvider) return null;
    const normalized = ref.replace(/SOP\s*/i, "").trim();
    const sopIndex = sopProvider.getSOPIndex();
    const entry = Object.entries(sopIndex).find(([, sop]) =>
      sop.title?.toLowerCase().includes(normalized.toLowerCase())
    );
    return entry ? entry[0] : null;
  };

  const getFallbackSopRef = () => {
    if (scenarioKey && sopProvider) {
      const scenarioSOPs = sopProvider.getScenarioSOPs();
      const scenarioTitle = scenarioSOPs[scenarioKey]?.title;
      const match = scenarioTitle?.match(/SOP\s*([\d.]+)/i);
      if (match) return `SOP ${match[1]}`;
      return scenarioTitle || scenarioKey;
    }
    if (itemStatusKey && sopProvider) {
      const sopIndex = sopProvider.getSOPIndex();
      const statusTitle = sopIndex[itemStatusKey]?.title;
      if (statusTitle) {
        const match = statusTitle.match(/SOP\s*([\d.]+)/i);
        return match ? `SOP ${match[1]}` : statusTitle;
      }
      return itemStatusKey;
    }
    return null;
  };

  const handleSOPClick = (ref) => {
    const safeScenario = scenarioKey || null;
    const safeStatus = itemStatusKey || null;

    if (!ref) {
      onSOPView?.(safeScenario || safeStatus, safeScenario, safeStatus, null);
      return;
    }

    const pageMatch = ref.match(/Page\s*(\d+)/i);
    const sopMatch = ref.match(/(\d+(?:\.\d+){0,2})/);

    if (pageMatch) {
      const scenarioFromPage = resolveScenarioByPage(pageMatch[0]) || safeScenario;
      const statusForPage = safeStatus || findStatusBySopRef(pageMatch[0]);
      onSOPView?.(scenarioFromPage || statusForPage || pageMatch[0], scenarioFromPage, statusForPage, null);
      return;
    }

    if (sopMatch) {
      const statusFromRef = findStatusBySopRef(sopMatch[1]) || safeStatus;
      onSOPView?.(statusFromRef || sopMatch[1], safeScenario, statusFromRef, null);
      return;
    }

    onSOPView?.(ref, safeScenario, safeStatus, null);
  };

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

  const fallbackTexts = [
    "Analyzing item metadata and codes.",
    "Matching item against standard operating procedures.",
    "Evaluating risk factors and compliance.",
  ];
  const primaryText = normalizedStep?.text || fallbackTexts[index] || "Processing...";
  const matchedSopRefs = normalizedStep?.sopRefs?.length
    ? normalizedStep.sopRefs
    : (getFallbackSopRef() ? [getFallbackSopRef()] : []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.2, type: "spring", stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative rounded-xl border-2 ${config.borderColor} bg-gradient-to-br ${config.bgGradient} p-3 md:p-3 shadow-lg hover:shadow-xl transition-all flex flex-col overflow-hidden`}
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
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-tight">
                {config.title}
              </h3>
              {confidence > 0 && (
                <motion.span
                  className={`inline-block px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-semibold ${getConfidenceBg(confidence)} ${getConfidenceColor(confidence)}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  {Math.round(confidence * 100)}% Confidence
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 mb-1.5 space-y-2.5">
          {index === 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              >
                <p className="text-[13px] md:text-sm text-gray-800 dark:text-gray-100 leading-snug">
                  {isStreaming ? (
                    <>
                      {primaryText}
                      <span className="inline-block w-1 h-3 bg-[#612D91] ml-1 animate-pulse" />
                    </>
                  ) : (
                    primaryText
                  )}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <SectionLabel>Key Intake Signals</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <DetailPill label="Amount" value={formatCurrency(item?.amount)} />
                  <DetailPill label="Age" value={getItemAge()} />
                  {item?.aiPriority != null && (
                    <DetailPill
                      label="AI Priority"
                      value={`${item.aiPriority.toFixed ? item.aiPriority.toFixed(1) : item.aiPriority}/10`}
                    />
                  )}
                  {item?.aiRiskLevel && (
                    <DetailPill
                      label="Risk Level"
                      value={item.aiRiskLevel.charAt(0).toUpperCase() + item.aiRiskLevel.slice(1)}
                    />
                  )}
                  {getSLASummary() && <DetailPill label="SLA" value={getSLASummary()} />}
                </div>
              </motion.div>
            </>
          )}

          {index === 1 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              >
                <p className="text-[13px] md:text-sm text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
                  {primaryText}
                </p>
              </motion.div>

              {(matchedSopRefs.length > 0 || primarySOP || scenarioTag || item?.cptCode || item?.icd10Code) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <SectionLabel>SOPs &amp; Match Criteria</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSopRefs.map((ref, idx) => {
                      const sopMatch = ref.match(/(\d+(?:\.\d+){0,2})/);
                      const sopNum = sopMatch ? sopMatch[1] : ref;
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleSOPClick(sopNum)}
                          className="px-2.5 py-1 rounded text-[10px] font-semibold bg-white/80 dark:bg-gray-800/80 text-[#612D91] dark:text-[#A64AC9] hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md border border-[#612D91]/20 dark:border-[#A64AC9]/30 flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FileText className="w-2.5 h-2.5" />
                          {sopNum ? `SOP ${sopNum}` : ref}
                        </motion.button>
                      );
                    })}

                    {primarySOP && (
                      <span className="px-2.5 py-1 rounded text-[10px] font-semibold bg-purple-50/80 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-200/70 dark:border-purple-700/60">
                        {primarySOP.title}
                        {primarySOP.page && primarySOP.page !== "N/A" && ` · ${primarySOP.page}`}
                        {primarySOP.state && primarySOP.state !== "All" && ` · ${primarySOP.state}`}
                      </span>
                    )}

                    {scenarioTag && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-600/40 capitalize">
                        {scenarioTag.replace(/-/g, " ")}
                      </span>
                    )}

                    {item?.cptCode && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-600/40">
                        CPT: {item.cptCode}
                      </span>
                    )}
                    {item?.icd10Code && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-600/40">
                        ICD-10: {item.icd10Code}
                      </span>
                    )}

                    {normalizedStep?.text && (
                      <>
                        {(normalizedStep.text.toLowerCase().includes("prior auth") || normalizedStep.text.toLowerCase().includes("prior-auth")) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-600/40">
                            prior auth
                          </span>
                        )}
                        {normalizedStep.text.toLowerCase().includes("authorization") && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-600/40">
                            authorization
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {index === 2 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              >
                <p className="text-[13px] md:text-sm text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
                  {primaryText}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <SectionLabel>Risk &amp; SLA Indicators</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {item?.amount && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100/70 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300/50 dark:border-orange-600/50">
                      {item.amount > 10000 ? "High value" : item.amount > 3000 ? "Medium value" : "Low value"}
                    </span>
                  )}
                  {getSLASummary() && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100/70 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300/50 dark:border-orange-600/50">
                      SLA: {getSLASummary()}
                    </span>
                  )}
                  {item?.status && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100/70 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300/50 dark:border-orange-600/50">
                      Status: {item.status}
                    </span>
                  )}
                  {item?.aiRiskLevel && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100/70 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300/50 dark:border-orange-600/50">
                      AI Risk: {item.aiRiskLevel.charAt(0).toUpperCase() + item.aiRiskLevel.slice(1)}
                    </span>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {!normalizedStep && (
            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="h-3 w-full bg-gray-200/50 dark:bg-gray-800/50 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-gray-200/50 dark:bg-gray-800/50 rounded animate-pulse" />
            </motion.div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="shrink-0 mt-1">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
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
          <div className="mt-0.5 text-[10px] text-gray-600 dark:text-gray-400 text-right font-semibold">
            {actualProgress}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}

