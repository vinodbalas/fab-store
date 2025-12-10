/**
 * Unified AI Console - Platform-Agnostic
 * 
 * Generic AI reasoning and chat interface that works with any platform
 * via AIWatchtowerProvider interface
 */

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Sparkles, Brain, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReasoningCard from "./ReasoningCard";
import ReasoningSummaryCard from "./ReasoningSummaryCard";
import ChatInterface from "./ChatInterface";

const isDefined = (x) => x !== undefined && x !== null;
const isEngineMsg = (m) => isDefined(m) && (m.role === "ai-step" || m.role === "ai-reco" || m.role === "ai-model");
const isChatMsg = (m) => isDefined(m) && (m.role === "user" || m.role === "ai");

export default function UnifiedAIConsole({ 
  provider, 
  itemId, 
  item = null,
  onReferenceView,
  onReferenceSelect,
}) {
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [reasoningExpanded, setReasoningExpanded] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const [itemData, setItemData] = useState(item);
  const reasoningInitialized = useRef(false);
  const config = provider?.getConfig() || {};

  const safeMessages = useMemo(() => (Array.isArray(messages) ? messages.filter(isDefined) : []), [messages]);
  const engineMessages = useMemo(() => safeMessages.filter(isEngineMsg), [safeMessages]);
  const recommendation = useMemo(() => engineMessages.find(m => m.role === "ai-reco"), [engineMessages]);
  const reasoningSteps = useMemo(() => engineMessages.filter(m => m.role === "ai-step"), [engineMessages]);

  const pushMessage = useCallback((m) => {
    if (!m || typeof m !== "object" || !("role" in m)) return;
    setMessages((prev) => [...(Array.isArray(prev) ? prev.filter(isDefined) : []), m]);
    
    // Extract references from message
    if (m.references && Array.isArray(m.references) && m.references.length > 0) {
      onReferenceSelect?.(m.references);
    }
  }, [onReferenceSelect]);

  // Load item data
  useEffect(() => {
    if (item) {
      setItemData(item);
    } else if (itemId && provider) {
      provider.getItem(itemId).then(setItemData);
    }
  }, [item, itemId, provider]);

  // Execute reasoning when item loads
  useEffect(() => {
    if (!reasoningInitialized.current && itemData && provider) {
      reasoningInitialized.current = true;
      setThinking(true);

      const executeReasoning = async () => {
        try {
          const onStep = (step) => {
            setCurrentStep(step);
            pushMessage(step);
          };

          await provider.executeReasoning(itemData, onStep);
          setThinking(false);
        } catch (error) {
          console.error("Error executing reasoning:", error);
          setThinking(false);
        }
      };

      executeReasoning();
    }
  }, [itemData, provider, pushMessage]);

  // Handle chat messages
  const handleChatMessage = useCallback(async (text) => {
    if (!text.trim() || !provider) return;

    pushMessage({ role: "user", text: text.trim() });
    setThinking(true);
    setFollowUpSuggestions([]);
    setStreamingMessage({ role: "ai", text: "" });

    try {
      const context = {
        item: itemData,
        reasoningSteps,
        recommendation,
      };

      const onToken = (token) => {
        setStreamingMessage((prev) => ({
          ...prev,
          text: (prev.text || "") + token,
        }));
      };

      const response = await provider.sendChatMessage(text, context, onToken);

      pushMessage({
        role: "ai",
        text: response.text || response,
        references: response.references,
      });
      setStreamingMessage(null);
      setThinking(false);
    } catch (error) {
      console.error("Error sending chat message:", error);
      pushMessage({
        role: "ai",
        text: "Sorry, I encountered an error. Please try again.",
      });
      setThinking(false);
      setStreamingMessage(null);
    }
  }, [provider, itemData, reasoningSteps, recommendation, pushMessage]);

  // Handle actions
  const handleAction = useCallback(async (actionType, recommendation) => {
    if (!provider) return;

    try {
      await provider.executeAction(actionType, itemData, recommendation);
      // Action executed - UI feedback handled by provider
    } catch (error) {
      console.error("Error executing action:", error);
    }
  }, [provider, itemData]);

  if (!provider) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>AI Watchtower provider not configured</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#612D91] to-[#A64AC9]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AI Reasoning
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Multi-agent reasoning console powered by {config.platformName || "Platform"}
            </p>
          </div>
        </div>
      </div>

      {/* Reasoning Section */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {thinking && !reasoningSteps.length && (
          <div className="flex items-center gap-3 text-gray-600">
            <Brain className="w-5 h-5 animate-pulse" />
            <span>Analyzing {config.itemLabel}...</span>
          </div>
        )}

        {/* Recommendation Card */}
        {recommendation && (
          <ReasoningSummaryCard
            recommendation={recommendation}
            item={itemData}
            itemLabel={config.itemLabel}
            onAction={handleAction}
            onReferenceView={onReferenceView}
          />
        )}

        {/* Reasoning Steps */}
        {reasoningSteps.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Reasoning Steps
            </h3>
            {reasoningSteps.map((step, idx) => (
              <ReasoningCard
                key={idx}
                step={step}
                agentNames={provider.getAgentNames()}
                onReferenceView={onReferenceView}
              />
            ))}
          </div>
        )}

        {/* Chat Interface */}
        <ChatInterface
          messages={safeMessages.filter(isChatMsg)}
          streamingMessage={streamingMessage}
          thinking={thinking}
          onSendMessage={handleChatMessage}
          followUpSuggestions={followUpSuggestions}
          itemLabel={config.itemLabel}
        />
      </div>
    </div>
  );
}

