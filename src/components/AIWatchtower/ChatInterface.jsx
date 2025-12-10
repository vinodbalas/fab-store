/**
 * Chat Interface - Platform-Agnostic
 * 
 * Generic chat interface for AI Watchtower
 */

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface({
  messages,
  streamingMessage,
  thinking,
  onSendMessage,
  followUpSuggestions = [],
  itemLabel = "item",
}) {
  const [input, setInput] = useState("");
  const [chatExpanded, setChatExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSend = () => {
    if (!input.trim() || thinking) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const allMessages = [...messages];
  if (streamingMessage) {
    allMessages.push(streamingMessage);
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <button
        onClick={() => setChatExpanded(!chatExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors mb-3"
      >
        <span className="font-semibold text-gray-700">Ask about this {itemLabel}</span>
        <span className="text-sm text-gray-500">{chatExpanded ? "Collapse" : "Expand"}</span>
      </button>

      <AnimatePresence>
        {chatExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Messages */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {allMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Ask questions about this {itemLabel}</p>
                </div>
              )}

              {allMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="p-1.5 rounded-full bg-indigo-100">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="p-1.5 rounded-full bg-gray-100">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {thinking && !streamingMessage && (
                <div className="flex gap-3 justify-start">
                  <div className="p-1.5 rounded-full bg-indigo-100">
                    <Bot className="w-4 h-4 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Follow-up Suggestions */}
            {followUpSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {followUpSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(suggestion)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask about this ${itemLabel}...`}
                disabled={thinking}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

