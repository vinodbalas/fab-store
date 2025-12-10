import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Sparkles, CheckCircle2, Brain, Zap, TrendingUp, AlertCircle, Activity, ArrowDown, FileText, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiAPI, casesAPI } from "../services/api";
import { SCENARIO_SOPS, getSOPByScenario } from "../data/sops";
import ReasoningSummaryCard from "./ReasoningSummaryCard";
import ReasoningStepCard from "./ReasoningStepCard";
import { ReasoningCard } from "./platformComponents";
import RecommendedNextSteps from "./RecommendedNextSteps";

/* -------------------- VARIANTS -------------------- */
const msgVariants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };
const isDefined = (x) => x !== undefined && x !== null;
const isEngineMsg = (m) => isDefined(m) && (m.role === "ai-step" || m.role === "ai-reco" || m.role === "ai-model");
const isChatMsg = (m) => isDefined(m) && (m.role === "user" || m.role === "ai");

/* -------------------- MAIN COMPONENT -------------------- */
export default function UnifiedAIConsole({ onBind, onSOPReference, onSOPView, caseId, case: caseData = null }) {
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [reasoningExpanded, setReasoningExpanded] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const bottomRef = useRef(null);
  const recommendationRef = useRef(null);
  const reasoningInitialized = useRef(false);
  const pushMessageRef = useRef(null);
  const processStepRef = useRef(null);
  const activeIntervalsRef = useRef(new Set());
  const activeTimeoutsRef = useRef(new Set());
  const chatApiRef = useRef(null);
  const chatInputRef = useRef(null);
  const hasScrolledToRecommendation = useRef(false);

  /* --- Helpers --- */
  const safeMessages = useMemo(() => (Array.isArray(messages) ? messages.filter(isDefined) : []), [messages]);
  
  // Compute recommendation and related values early
  const engineMessages = useMemo(() => safeMessages.filter(isEngineMsg), [safeMessages]);
  const recommendation = useMemo(() => engineMessages.find(m => m.role === "ai-reco"), [engineMessages]);

  const pushMessage = useCallback((m) => {
    if (!m || typeof m !== "object" || !("role" in m)) return;
    setMessages((prev) => [...(Array.isArray(prev) ? prev.filter(isDefined) : []), m]);
    
    if (m.text) {
      const sopMatches = m.text.match(/(?:SOP\s*)?(\d+(?:\.\d+){0,2})/gi);
      if (sopMatches && sopMatches.length > 0) {
        const ids = sopMatches.map((t) => {
          const match = t.match(/(\d+(?:\.\d+){0,2})/);
          return match ? match[1] : t.replace(/sop\s*/gi, "").trim();
        }).filter(Boolean);
        onSOPReference?.(ids);
      }
    }
    
    if (m.sopRefs && Array.isArray(m.sopRefs) && m.sopRefs.length > 0) {
      onSOPReference?.(m.sopRefs);
    }
  }, [onSOPReference]);
  
  useEffect(() => {
    pushMessageRef.current = pushMessage;
  }, [pushMessage]);

  /* --- Reset when case changes --- */
  useEffect(() => {
    activeIntervalsRef.current.forEach(id => clearInterval(id));
    activeTimeoutsRef.current.forEach(id => clearTimeout(id));
    activeIntervalsRef.current.clear();
    activeTimeoutsRef.current.clear();
    
    setMessages([]);
    setThinking(false);
    setStreamingMessage(null);
    setCurrentStep(null);
    setFollowUpSuggestions([]);
    reasoningInitialized.current = false;
    processStepRef.current = null;
    hasScrolledToRecommendation.current = false;
  }, [caseId]);

  // Initialize AI reasoning when case is loaded
  useEffect(() => {
    if (!reasoningInitialized.current && caseId && caseData) {
      reasoningInitialized.current = true;
      setThinking(true);
      
      const executeAIAnalysis = async () => {
        try {
          let caseObj = caseData;
          if (!caseObj && caseId) {
            caseObj = await casesAPI.getById(caseId);
          }
          
          if (!caseObj) {
            console.error("No case data available for analysis");
            setThinking(false);
            return;
          }

          const isDemoMode = localStorage.getItem('cogniclaim.demoMode') === 'true' || 
            new URLSearchParams(window.location.search).get('demo') === 'true';
          
          const onStep = (step) => {
            if (isDemoMode && step.role !== "ai-model") {
              setCurrentStep(step);
              setStreamingMessage({ ...step, text: "" });
              
              const fullText = step.text || "";
              let charIndex = 0;
              
              const typingInterval = setInterval(() => {
                if (charIndex < fullText.length) {
                  setStreamingMessage((prev) => ({
                    ...prev,
                    text: fullText.substring(0, charIndex + 1),
                  }));
                  charIndex++;
                } else {
                  clearInterval(typingInterval);
                  activeIntervalsRef.current.delete(typingInterval);
                  pushMessageRef.current?.(step);
                  setStreamingMessage(null);
                  setCurrentStep(null);
                }
              }, 20);
              
              activeIntervalsRef.current.add(typingInterval);
            } else {
              pushMessageRef.current?.(step);
            }
          };

          aiAPI.analyzeCase(caseObj, onStep)
            .then((finalResult) => {
              setThinking(false);
              setStreamingMessage(null);
              setCurrentStep(null);
              
              if (finalResult?.recommendation) {
                pushMessageRef.current?.(finalResult.recommendation);
              }
              
              if (finalResult?.reasoningSteps) {
                finalResult.reasoningSteps.forEach(step => {
                  pushMessageRef.current?.(step);
                });
              }
            })
            .catch((err) => {
              console.error("AI Analysis error:", err);
              setThinking(false);
              setStreamingMessage(null);
              setCurrentStep(null);
              
              pushMessageRef.current?.({
                role: "ai-step",
                text: `Error during analysis: ${err.message}. Please try again.`,
                confidence: 0.5,
                details: "AI analysis failed",
              });
            });
        } catch (err) {
          console.error("Failed to start AI analysis:", err);
          setThinking(false);
          setStreamingMessage(null);
          setCurrentStep(null);
        }
      };
      
      executeAIAnalysis();
    }
  }, [caseId, caseData]);

  /* --- Real AI Chat Agent --- */
  useEffect(() => {
    const api = {
      send: async (text) => {
        const t = text.trim();
        if (!t) return;
        
        pushMessage({ role: "user", text: t });
        setThinking(true);
        setFollowUpSuggestions([]);
        setStreamingMessage({ role: "ai", text: "" });
        
        try {
          let caseObj = caseData;
          if (!caseObj && caseId) {
            caseObj = await casesAPI.getById(caseId);
          }
          
          const engineMessages = messages.filter(isEngineMsg);
          const reasoningSteps = engineMessages;
          
          const conversationHistory = messages
            .filter(m => m.role === 'user' || m.role === 'ai')
            .slice(-10)
            .map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text || m.content || '',
            }));
          
          let fullResponse = "";
          const onToken = (token) => {
            fullResponse += token;
            setStreamingMessage({
              role: "ai",
              text: fullResponse,
            });
          };
          
          const response = await aiAPI.sendMessage(t, {
            case: caseObj,
            caseId,
            reasoningSteps,
            conversationHistory,
          }, onToken);
          
          if (fullResponse && !messages.find(m => m.role === 'ai' && m.text === fullResponse)) {
            pushMessage({
              role: "ai",
              text: response.text || fullResponse,
              sopRefs: response.sopRefs || [],
            });
          }
          
          setStreamingMessage(null);
          setThinking(false);
          setFollowUpSuggestions(response.suggestions || []);
          
          if (response.sopRefs && response.sopRefs.length > 0) {
            onSOPReference?.(response.sopRefs);
          }
        } catch (error) {
          console.error("Chat error:", error);
          setStreamingMessage(null);
          setThinking(false);
          
          pushMessage({
            role: "ai",
            text: `I apologize, but I encountered an error. Please check your API configuration. Error: ${error.message}`,
            sopRefs: [],
          });
        }
      },
    };
    chatApiRef.current = api;
    onBind?.(api);
  }, [onBind, onSOPReference, pushMessage, caseData, caseId, messages]);

  // Auto-scroll to recommendation
  useEffect(() => {
    if (recommendation && recommendationRef.current && !hasScrolledToRecommendation.current) {
      const timeoutId = setTimeout(() => {
        recommendationRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "start",
          inline: "nearest"
        });
        hasScrolledToRecommendation.current = true;
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [recommendation]);

  /* -------------------- RENDER -------------------- */
  const chatMessages = useMemo(() => safeMessages.filter(isChatMsg), [safeMessages]);
  const modelInfo = useMemo(() => engineMessages.find(m => m.role === "ai-model"), [engineMessages]);
  const stepCount = useMemo(() => engineMessages.filter(m => m.role === "ai-step").length, [engineMessages]);
  
  const getConfidenceColor = (conf) => {
    if (!conf) return "text-gray-500";
    if (conf >= 0.9) return "text-green-600 dark:text-green-400";
    if (conf >= 0.75) return "text-blue-600 dark:text-blue-400";
    if (conf >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };
  
  const getConfidenceBg = (conf) => {
    if (!conf) return "bg-gray-100 dark:bg-gray-800";
    if (conf >= 0.9) return "bg-green-100 dark:bg-green-900/30";
    if (conf >= 0.75) return "bg-blue-100 dark:bg-blue-900/30";
    if (conf >= 0.6) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-orange-100 dark:bg-orange-900/30";
  };
  
  const hasRecommendation = !!recommendation;
  const stepsOnly = useMemo(() => {
    const seen = new Set();
    return engineMessages
      .filter(m => m.role === "ai-step")
      .filter(step => {
        const key = `${step.agent || 'unknown'}-${(step.text || '').substring(0, 50)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [engineMessages]);

  // Group steps by agent type
  const groupedSteps = useMemo(() => {
    const analysis = stepsOnly.find(s => {
      const agent = s.agent?.toLowerCase() || "";
      return agent.includes("analysis") || agent === "analysis";
    });
    const sopMatcher = stepsOnly.find(s => {
      const agent = s.agent?.toLowerCase() || "";
      return agent.includes("sop") || agent.includes("matcher") || agent === "sop matcher";
    });
    const riskAssessor = stepsOnly.find(s => {
      const agent = s.agent?.toLowerCase() || "";
      return agent.includes("risk") || agent.includes("assessor") || agent === "risk assessor";
    });
    
    return { analysis, sopMatcher, riskAssessor };
  }, [stepsOnly]);

  const isStepStreaming = useCallback((step) => {
    if (!streamingMessage || !step) return false;
    const streamingAgent = streamingMessage.agent?.toLowerCase() || "";
    const stepAgent = step.agent?.toLowerCase() || "";
    return streamingMessage.role === "ai-step" && streamingAgent === stepAgent;
  }, [streamingMessage]);

  const getStreamingCard = useCallback(() => {
    if (!streamingMessage || streamingMessage.role !== "ai-step") return null;
    const agent = streamingMessage.agent?.toLowerCase() || "";
    const text = streamingMessage.text?.toLowerCase() || "";
    
    if (agent.includes("analysis") || text.includes("analyzing") || text.includes("analysis")) {
      return "analysis";
    }
    if (agent.includes("sop") || agent.includes("matcher") || text.includes("sop") || text.includes("matching")) {
      return "sopMatcher";
    }
    if (agent.includes("risk") || agent.includes("assessor") || text.includes("risk") || text.includes("evaluating")) {
      return "riskAssessor";
    }
    return null;
  }, [streamingMessage]);
  
  const streamingCard = getStreamingCard();

  const getCardProgress = useCallback((cardType) => {
    if (cardType === "analysis") {
      if (groupedSteps.analysis) return 100;
      if (streamingCard === "analysis") return 75;
      if (thinking && !groupedSteps.sopMatcher && !groupedSteps.riskAssessor) return 25;
      return 0;
    }
    if (cardType === "sopMatcher") {
      if (groupedSteps.sopMatcher) return 100;
      if (streamingCard === "sopMatcher") return 75;
      if (groupedSteps.analysis && !groupedSteps.riskAssessor) return 25;
      return 0;
    }
    if (cardType === "riskAssessor") {
      if (groupedSteps.riskAssessor) return 100;
      if (streamingCard === "riskAssessor") return 75;
      if (groupedSteps.analysis && groupedSteps.sopMatcher) return 25;
      return 0;
    }
    return 0;
  }, [groupedSteps, streamingCard, thinking]);

  const shouldShowSkeleton = useCallback((cardType) => {
    if (cardType === "analysis") {
      return !groupedSteps.analysis && streamingCard !== "analysis";
    }
    if (cardType === "sopMatcher") {
      return !groupedSteps.sopMatcher && streamingCard !== "sopMatcher" && (!groupedSteps.analysis && streamingCard !== "analysis");
    }
    if (cardType === "riskAssessor") {
      return !groupedSteps.riskAssessor && streamingCard !== "riskAssessor" && (!groupedSteps.sopMatcher && streamingCard !== "sopMatcher");
    }
    return false;
  }, [groupedSteps, streamingCard]);
  
  const reasoningProgress = useMemo(() => {
    if (engineMessages.length === 0) return 0;
    const totalSteps = 5;
    const completedSteps = engineMessages.filter(m => m.role === "ai-step" || m.role === "ai-reco").length;
    return Math.min((completedSteps / totalSteps) * 100, 100);
  }, [engineMessages]);
  
  const avgConfidence = useMemo(() => {
    const stepsWithConfidence = engineMessages.filter(m => m.confidence !== undefined && m.confidence !== null);
    if (stepsWithConfidence.length === 0) return null;
    const sum = stepsWithConfidence.reduce((acc, m) => acc + (m.confidence || 0), 0);
    return sum / stepsWithConfidence.length;
  }, [engineMessages]);
  
  const [lastAction, setLastAction] = useState(null);

  const handleAction = useCallback((actionType, recommendation) => {
    console.log("Action taken:", actionType, recommendation);
    setLastAction({
      type: actionType,
      label:
        actionType === "approve"
          ? "Approve"
          : actionType === "deny"
          ? "Deny"
          : actionType === "request"
          ? "Request information"
          : "Review",
      message:
        actionType === "approve"
          ? "This would approve the case in a real environment (no changes made in demo mode)."
          : actionType === "deny"
          ? "This would deny/close the case in a real environment (no changes made in demo mode)."
          : "This would trigger a follow-up / information request in a real environment.",
    });
  }, []);

  // Auto-dismiss action toast after 2.5s
  useEffect(() => {
    if (!lastAction) return;
    const timer = setTimeout(() => setLastAction(null), 2500);
    return () => clearTimeout(timer);
  }, [lastAction]);
  
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        <div className="w-full py-6 space-y-6">
        {/* AI Reasoning Section */}
        {(engineMessages.length > 0 || thinking) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
          {/* Section Header - AI Reasoning */}
          <div className="relative flex items-center gap-3 pb-3 mb-2">
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#612D91] via-[#A64AC9] to-[#612D91] rounded-full"></div>
            
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#612D91] to-[#A64AC9] shadow-lg shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#612D91] to-[#A64AC9] bg-clip-text text-transparent">
                AI Reasoning
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Multi-agent reasoning console powered by SOP Executor
              </p>
            </div>
            {avgConfidence && (
              <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#612D91]/10 to-[#A64AC9]/10 dark:from-[#612D91]/20 dark:to-[#A64AC9]/20 border border-[#612D91]/30 dark:border-[#A64AC9]/40 shrink-0">
                <span className="text-xs font-semibold text-[#612D91] dark:text-[#A64AC9]">
                  {Math.round(avgConfidence * 100)}% Confidence
                </span>
              </div>
            )}
          </div>

          {/* Thinking indicator */}
          {thinking && stepsOnly.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#612D91]/10 to-[#A64AC9]/10 dark:from-[#612D91]/20 dark:to-[#A64AC9]/20 border border-[#612D91]/30 dark:border-[#A64AC9]/40 rounded-xl p-5 shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-3 rounded-xl bg-gradient-to-br from-[#612D91] to-[#A64AC9] shadow-lg"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#612D91] dark:text-[#A64AC9] mb-1">AI Analysis in Progress</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">TP Resolve Appeals is analyzing the case using multi-agent reasoning...</p>
                  {reasoningProgress > 0 && reasoningProgress < 100 && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${reasoningProgress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#612D91] to-[#A64AC9] rounded-full"
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#612D91] dark:text-[#A64AC9]">{Math.round(reasoningProgress)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Three Sequential Cards */}
          {(stepsOnly.length > 0 || thinking || streamingMessage) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ minHeight: "240px" }}>
              <AnimatePresence mode="wait">
                <ReasoningCard
                  key="analysis-card"
                  step={shouldShowSkeleton("analysis") ? null : (groupedSteps.analysis || (streamingCard === "analysis" ? streamingMessage : null))}
                  index={0}
                  onSOPView={onSOPView}
                  case={caseData}
                  isStreaming={streamingCard === "analysis" || isStepStreaming(groupedSteps.analysis)}
                  isComplete={!!groupedSteps.analysis}
                  progress={getCardProgress("analysis")}
                />
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <ReasoningCard
                  key="sopMatcher-card"
                  step={shouldShowSkeleton("sopMatcher") ? null : (groupedSteps.sopMatcher || (streamingCard === "sopMatcher" ? streamingMessage : null))}
                  index={1}
                  onSOPView={onSOPView}
                  case={caseData}
                  isStreaming={streamingCard === "sopMatcher" || isStepStreaming(groupedSteps.sopMatcher)}
                  isComplete={!!groupedSteps.sopMatcher}
                  progress={getCardProgress("sopMatcher")}
                />
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <ReasoningCard
                  key="riskAssessor-card"
                  step={shouldShowSkeleton("riskAssessor") ? null : (groupedSteps.riskAssessor || (streamingCard === "riskAssessor" ? streamingMessage : null))}
                  index={2}
                  onSOPView={onSOPView}
                  case={caseData}
                  isStreaming={streamingCard === "riskAssessor" || isStepStreaming(groupedSteps.riskAssessor)}
                  isComplete={!!groupedSteps.riskAssessor}
                  progress={getCardProgress("riskAssessor")}
                />
              </AnimatePresence>
            </div>
          )}

        </motion.div>
      )}

      {/* Recommended Next Steps */}
      {hasRecommendation && recommendation?.keyInfo?.nextSteps && recommendation.keyInfo.nextSteps.length > 0 && (
        <RecommendedNextSteps
          nextSteps={recommendation.keyInfo.nextSteps}
          recommendation={recommendation}
          case={caseData}
          onAction={handleAction}
          onSOPView={onSOPView}
        />
      )}

      {/* Reasoning Summary Card */}
      {hasRecommendation && (
        <motion.div
          ref={recommendationRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.4,
            type: "spring",
            stiffness: 250,
            damping: 25
          }}
        >
          <ReasoningSummaryCard
            recommendation={recommendation}
            steps={stepsOnly}
            case={caseData}
            onSOPView={onSOPView}
            onAction={handleAction}
          />
        </motion.div>
      )}

      </div>
    </div>

    {/* Fixed Chat Input at Bottom */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 shadow-lg">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 relative">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Ask TP Resolve Appeals about this case..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#612D91]/50 dark:focus:ring-[#A64AC9]/50 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    const message = e.target.value.trim();
                    if (chatApiRef.current?.send) {
                      chatApiRef.current.send(message);
                    }
                    e.target.value = "";
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                const input = chatInputRef.current;
                if (input && input.value.trim()) {
                  const message = input.value.trim();
                  if (chatApiRef.current?.send) {
                    chatApiRef.current.send(message);
                  }
                  input.value = "";
                }
              }}
              className="p-3 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              title="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-[58px]">Press Enter to send</p>
        </div>
      </div>

      {/* Action toast */}
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-20 right-6 max-w-sm z-40"
        >
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl px-4 py-3 flex items-start gap-3">
            <div className="mt-1">
              <Sparkles className="w-4 h-4 text-[#612D91] dark:text-[#A64AC9]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {lastAction.label} (demo only)
                </span>
                <button
                  onClick={() => setLastAction(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {lastAction.message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
