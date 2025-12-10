import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Sparkles, CheckCircle2, Brain, Zap, TrendingUp, AlertCircle, Activity, ArrowDown, FileText, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiAPI, claimsAPI } from "../services/api";
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
export default function UnifiedAIConsole({ onBind, onSOPReference, onSOPView, claimId, claim = null }) {
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [reasoningExpanded, setReasoningExpanded] = useState(true); // Expanded by default to show reasoning first
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const bottomRef = useRef(null);
  const recommendationRef = useRef(null); // Ref for recommendation card
  const reasoningInitialized = useRef(false);
  const pushMessageRef = useRef(null);
  const processStepRef = useRef(null);
  const activeIntervalsRef = useRef(new Set());
  const activeTimeoutsRef = useRef(new Set());
  const chatApiRef = useRef(null);
  const chatInputRef = useRef(null);
  const preScreeningCompleteRef = useRef(false);
  const preScreeningResultRef = useRef(null);

  /* --- Helpers --- */
  const safeMessages = useMemo(() => (Array.isArray(messages) ? messages.filter(isDefined) : []), [messages]);
  
  // Compute recommendation and related values early (before useEffect that uses them)
  const engineMessages = useMemo(() => safeMessages.filter(isEngineMsg), [safeMessages]);
  const recommendation = useMemo(() => engineMessages.find(m => m.role === "ai-reco"), [engineMessages]);

  const pushMessage = useCallback((m) => {
    if (!m || typeof m !== "object" || !("role" in m)) return;
    setMessages((prev) => [...(Array.isArray(prev) ? prev.filter(isDefined) : []), m]);
    
    // Don't auto-expand reasoning steps - keep them collapsed so recommendation stays visible
    // Only expand chat when new messages arrive
    if (m.role === "user" || m.role === "ai") {
      setChatExpanded(true);
    }
    
    if (m.text) {
      // Match SOP references in formats like "SOP 3.2.1", "SOP3.2.1", or just "3.2.1"
      const sopMatches = m.text.match(/(?:SOP\s*)?(\d+(?:\.\d+){0,2})/gi);
      if (sopMatches && sopMatches.length > 0) {
        const ids = sopMatches.map((t) => {
          // Extract just the version number (e.g., "3.2.1" from "SOP 3.2.1")
          const match = t.match(/(\d+(?:\.\d+){0,2})/);
          return match ? match[1] : t.replace(/sop\s*/gi, "").trim();
        }).filter(Boolean);
        onSOPReference?.(ids);
      }
    }
    
    // Also check sopRefs array if present
    if (m.sopRefs && Array.isArray(m.sopRefs) && m.sopRefs.length > 0) {
      onSOPReference?.(m.sopRefs);
    }
  }, [onSOPReference]);
  
  // Keep ref updated
  useEffect(() => {
    pushMessageRef.current = pushMessage;
  }, [pushMessage]);

  /* --- Reset when claim changes --- */
  useEffect(() => {
    // Clear all active intervals and timeouts
    activeIntervalsRef.current.forEach(id => clearInterval(id));
    activeTimeoutsRef.current.forEach(id => clearTimeout(id));
    activeIntervalsRef.current.clear();
    activeTimeoutsRef.current.clear();
    
    // Reset everything when claimId changes
    setMessages([]);
    setThinking(false);
    setStreamingMessage(null);
    setCurrentStep(null);
    setFollowUpSuggestions([]);
    reasoningInitialized.current = false;
    processStepRef.current = null;
    hasScrolledToRecommendation.current = false; // Reset scroll flag
    preScreeningCompleteRef.current = false; // Reset pre-screening completion flag
  }, [claimId]);

  /* --- Handle Pre-Screening Completion --- */
  const handlePreScreeningComplete = useCallback((result) => {
    preScreeningCompleteRef.current = true;
    preScreeningResultRef.current = result; // Store for comparison later
    
    // Trigger AI reasoning immediately after pre-screening completes
    if (!reasoningInitialized.current && claimId) {
      reasoningInitialized.current = true;
      setThinking(true);
      
      // Start AI analysis
      const executeAIAnalysis = async () => {
        try {
          // Fetch claim data if not provided
          let claimData = claim;
          if (!claimData && claimId) {
            claimData = await claimsAPI.getById(claimId);
          }
          
          if (!claimData) {
            console.error("No claim data available for analysis");
            setThinking(false);
            return;
          }

          // Check if we're in demo mode (for typing effect)
          const isDemoMode = localStorage.getItem('cogniclaim.demoMode') === 'true' || 
            new URLSearchParams(window.location.search).get('demo') === 'true';
          
          // Execute agentic reasoning with streaming callbacks
          const onStep = (step) => {
            // For backend mode (SSE), steps are already streamed - display immediately
            // For demo mode, add typing effect for better UX
            if (isDemoMode && step.role !== "ai-model") {
              // Demo mode: add typing effect
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
              // Backend mode: display immediately
              pushMessageRef.current?.(step);
            }
          };

          // Call real AI analysis endpoint with streaming
          // analyzeClaim returns a promise that resolves with the final result
          aiAPI.analyzeClaim(claimData, onStep)
            .then((finalResult) => {
              setThinking(false);
              setStreamingMessage(null);
              setCurrentStep(null);
              
              // Handle final result
              if (finalResult?.recommendation) {
                pushMessageRef.current?.(finalResult.recommendation);
              }
              
              // Ensure all reasoning steps are displayed (they should already be streamed via onStep)
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
              
              // Show error message
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
  }, [claimId, claim]);

  // TEMP: Auto-start AI reasoning without showing rule-based pre-screening UI
  useEffect(() => {
    // If pre-screening UI is hidden, we still want AI to start automatically.
    // Trigger the same flow as if pre-screening had completed, but with no result.
    if (!preScreeningCompleteRef.current && claimId && !reasoningInitialized.current) {
      handlePreScreeningComplete(null);
    }
  }, [claimId, handlePreScreeningComplete]);

  /* --- Real AI Reasoning with LangChain/LangGraph Agents --- */
  // Note: AI reasoning is now triggered by handlePreScreeningComplete callback
  // This ensures pre-screening completes before AI starts

  /* --- Real AI Chat Agent with LangChain --- */
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
          // Get claim data and reasoning steps for context
          let claimData = claim;
          if (!claimData && claimId) {
            claimData = await claimsAPI.getById(claimId);
          }
          
          const engineMessages = messages.filter(isEngineMsg);
          const reasoningSteps = engineMessages;
          
          // Build conversation history for context
          const conversationHistory = messages
            .filter(m => m.role === 'user' || m.role === 'ai')
            .slice(-10) // Last 10 messages
            .map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text || m.content || '',
            }));
          
          // Stream tokens from AI chat agent
          let fullResponse = "";
          const onToken = (token) => {
            fullResponse += token;
            setStreamingMessage({
              role: "ai",
              text: fullResponse,
            });
          };
          
          // Call real AI chat agent
          const response = await aiAPI.sendMessage(t, {
            claim: claimData,
            claimId: claimId,
            reasoningSteps,
            conversationHistory,
          }, onToken);
          
          // Push final message (if not already pushed via streaming)
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
          
          // Trigger SOP highlighting
          if (response.sopRefs && response.sopRefs.length > 0) {
            onSOPReference?.(response.sopRefs);
          }
        } catch (error) {
          console.error("Chat error:", error);
          setStreamingMessage(null);
          setThinking(false);
          
          // Fallback response
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
  }, [onBind, onSOPReference, pushMessage, claim, claimId, messages]);

  // Auto-scroll to recommendation when it appears (but only once, smoothly)
  const hasScrolledToRecommendation = useRef(false);
  useEffect(() => {
    if (recommendation && recommendationRef.current && !hasScrolledToRecommendation.current) {
      // Small delay to ensure the card is rendered and animated in
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
  
  // Helper to get confidence color
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
  
  // Compute additional derived values
  const hasRecommendation = !!recommendation;
  const stepsOnly = useMemo(() => {
    const seen = new Set();
    return engineMessages
      .filter(m => m.role === "ai-step")
      .filter(step => {
        // Create unique key from agent and first part of text
        const key = `${step.agent || 'unknown'}-${(step.text || '').substring(0, 50)}`;
        if (seen.has(key)) {
          return false; // Skip duplicate
        }
        seen.add(key);
        return true;
      });
  }, [engineMessages]);

  // Group steps by agent type for horizontal card layout
  // Backend uses: "Analysis", "SOP Matcher", "Risk Assessor"
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

  // Check if a step is currently streaming
  const isStepStreaming = useCallback((step) => {
    if (!streamingMessage || !step) return false;
    const streamingAgent = streamingMessage.agent?.toLowerCase() || "";
    const stepAgent = step.agent?.toLowerCase() || "";
    return streamingMessage.role === "ai-step" && streamingAgent === stepAgent;
  }, [streamingMessage]);

  // Determine which card should show streaming (based on agent name)
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

  // Calculate progress for each card
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
      // Only show progress if analysis is complete
      if (groupedSteps.analysis && !groupedSteps.riskAssessor) return 25;
      return 0;
    }
    if (cardType === "riskAssessor") {
      if (groupedSteps.riskAssessor) return 100;
      if (streamingCard === "riskAssessor") return 75;
      // Only show progress if both previous cards are complete
      if (groupedSteps.analysis && groupedSteps.sopMatcher) return 25;
      return 0;
    }
    return 0;
  }, [groupedSteps, streamingCard, thinking]);

  // Determine if card should show skeleton (waiting for data)
  const shouldShowSkeleton = useCallback((cardType) => {
    if (cardType === "analysis") {
      // Show skeleton if no analysis step and not currently streaming analysis
      return !groupedSteps.analysis && streamingCard !== "analysis";
    }
    if (cardType === "sopMatcher") {
      // Show skeleton if no SOP step and not currently streaming SOP
      // Also show if analysis hasn't started yet (waiting for analysis)
      return !groupedSteps.sopMatcher && streamingCard !== "sopMatcher" && (!groupedSteps.analysis && streamingCard !== "analysis");
    }
    if (cardType === "riskAssessor") {
      // Show skeleton if no risk step and not currently streaming risk
      // Also show if SOP hasn't started yet (waiting for SOP)
      return !groupedSteps.riskAssessor && streamingCard !== "riskAssessor" && (!groupedSteps.sopMatcher && streamingCard !== "sopMatcher");
    }
    return false;
  }, [groupedSteps, streamingCard]);

  // Helper to render text with clickable SOP references
  const renderTextWithSOPLinks = useCallback((text, sopRefs = []) => {
    if (!text) return text;
    
    // Create a regex to match SOP references
    const sopRegex = /(?:SOP\s*)?(\d+(?:\.\d+){0,2})|(Page\s+\d+(?:-\d+)?)/gi;
    const parts = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;
    
    while ((match = sopRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${keyCounter++}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      
      // Add clickable SOP reference
      const sopRef = match[1] || match[2];
      const isPageRef = match[2] !== undefined;
      
      parts.push(
        <button
          key={`sop-${keyCounter++}`}
          onClick={() => {
            // Try to find the SOP
            let sopId = null;
            let scenario = null;
            let stepIndex = null;
            
            if (isPageRef) {
              // Page reference - find scenario SOP
              const pageNum = sopRef.replace("Page ", "").replace("page ", "");
              Object.entries(SCENARIO_SOPS).forEach(([scen, sop]) => {
                if (sop.page && sop.page.includes(pageNum)) {
                  scenario = scen;
                  sopId = scen;
                }
              });
            } else {
              // SOP ID reference
              sopId = sopRef;
            }
            
            onSOPView?.(sopId, scenario, claim?.status, stepIndex);
          }}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-[#612D91]/10 text-[#612D91] dark:text-[#A64AC9] dark:bg-[#A64AC9]/20 hover:bg-[#612D91]/20 dark:hover:bg-[#A64AC9]/30 transition-colors text-xs font-medium border border-[#612D91]/20 dark:border-[#A64AC9]/30"
          title="Click to view full SOP document"
        >
          <FileText className="w-3 h-3" />
          {match[0]}
        </button>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${keyCounter++}`}>{text.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? parts : text;
  }, [onSOPView, claim]);
  
  // Calculate overall reasoning progress
  const reasoningProgress = useMemo(() => {
    if (engineMessages.length === 0) return 0;
    const totalSteps = 5; // 4 reasoning steps + 1 recommendation
    const completedSteps = engineMessages.filter(m => m.role === "ai-step" || m.role === "ai-reco").length;
    return Math.min((completedSteps / totalSteps) * 100, 100);
  }, [engineMessages]);
  
  // Calculate average confidence
  const avgConfidence = useMemo(() => {
    const stepsWithConfidence = engineMessages.filter(m => m.confidence !== undefined && m.confidence !== null);
    if (stepsWithConfidence.length === 0) return null;
    const sum = stepsWithConfidence.reduce((acc, m) => acc + (m.confidence || 0), 0);
    return sum / stepsWithConfidence.length;
  }, [engineMessages]);
  
  const [lastAction, setLastAction] = useState(null);

  // Handler for action buttons
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
          ? "This would approve the claim in a real environment (no changes made in demo mode)."
          : actionType === "deny"
          ? "This would deny/close the claim in a real environment (no changes made in demo mode)."
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
        {/* AI Reasoning Section - The Heart of the Product */}
        {(engineMessages.length > 0 || thinking) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
          {/* Section Header - AI Reasoning */}
          <div className="relative flex items-center gap-3 pb-3 mb-2">
            {/* Gradient border effect */}
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

          {/* Thinking indicator when no steps yet */}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cogniclaim is analyzing the claim using multi-agent reasoning...</p>
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

          {/* Three Sequential Cards: Analysis, SOP Matcher, Risk Assessor */}
          {(stepsOnly.length > 0 || thinking || streamingMessage) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ minHeight: "240px" }}>
              {/* Analysis Card - Always visible first */}
              <AnimatePresence mode="wait">
                <ReasoningCard
                  key="analysis-card"
                  step={shouldShowSkeleton("analysis") ? null : (groupedSteps.analysis || (streamingCard === "analysis" ? streamingMessage : null))}
                  index={0}
                  onSOPView={onSOPView}
                  claim={claim}
                  isStreaming={streamingCard === "analysis" || isStepStreaming(groupedSteps.analysis)}
                  isComplete={!!groupedSteps.analysis}
                  progress={getCardProgress("analysis")}
                />
              </AnimatePresence>

              {/* SOP Matcher Card - Shows skeleton until analysis progresses */}
              <AnimatePresence mode="wait">
                <ReasoningCard
                  key="sopMatcher-card"
                  step={shouldShowSkeleton("sopMatcher") ? null : (groupedSteps.sopMatcher || (streamingCard === "sopMatcher" ? streamingMessage : null))}
                  index={1}
                  onSOPView={onSOPView}
                  claim={claim}
                  isStreaming={streamingCard === "sopMatcher" || isStepStreaming(groupedSteps.sopMatcher)}
                  isComplete={!!groupedSteps.sopMatcher}
                  progress={getCardProgress("sopMatcher")}
                />
              </AnimatePresence>

              {/* Risk Assessor Card - Shows skeleton until SOP Matcher progresses */}
              <AnimatePresence mode="wait">
                <ReasoningCard
                  key="riskAssessor-card"
                  step={shouldShowSkeleton("riskAssessor") ? null : (groupedSteps.riskAssessor || (streamingCard === "riskAssessor" ? streamingMessage : null))}
                  index={2}
                  onSOPView={onSOPView}
                  claim={claim}
                  isStreaming={streamingCard === "riskAssessor" || isStepStreaming(groupedSteps.riskAssessor)}
                  isComplete={!!groupedSteps.riskAssessor}
                  progress={getCardProgress("riskAssessor")}
                />
              </AnimatePresence>
            </div>
          )}

        </motion.div>
      )}

      {/* Recommended Next Steps - TOP SECTION */}
      {hasRecommendation && recommendation?.keyInfo?.nextSteps && recommendation.keyInfo.nextSteps.length > 0 && (
        <RecommendedNextSteps
          nextSteps={recommendation.keyInfo.nextSteps}
          recommendation={recommendation}
          claim={claim}
          onAction={handleAction}
          onSOPView={onSOPView}
        />
      )}

      {/* Request Information Card - Separate section after reasoning */}
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
            claim={claim}
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
                placeholder="Ask Cogniclaim about this claim..."
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
