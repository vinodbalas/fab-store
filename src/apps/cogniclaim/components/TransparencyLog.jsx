import { useState } from "react";
import { CheckCircle2, AlertCircle, Clock, XCircle, ChevronDown, ChevronUp, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Transparency Log Component
 * Displays all actions performed with status indicators, API name, and execution time
 */
export default function TransparencyLog({ logEntries = [], className = "" }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  if (!logEntries || logEntries.length === 0) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-gray-400 animate-pulse" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "pending":
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#612D91]" />
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Transparency Log
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {logEntries.length} {logEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Log Entries */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {logEntries.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 border-l-4 ${getStatusColor(entry.status)} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
                    onClick={() => setSelectedEntry(selectedEntry === index ? null : index)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        {getStatusIcon(entry.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {entry.action}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              {entry.apiName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatTime(entry.executionTime)}</span>
                            <span>•</span>
                            <span>{formatTimestamp(entry.timestamp)}</span>
                          </div>
                          {selectedEntry === index && entry.details && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                            >
                              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                {JSON.stringify(entry.details, null, 2)}
                              </pre>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {logEntries.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>
                    Total execution time: {formatTime(
                      logEntries.reduce((sum, entry) => sum + entry.executionTime, 0)
                    )}
                  </span>
                  <span>
                    {logEntries.filter(e => e.status === "success").length} successful, {" "}
                    {logEntries.filter(e => e.status === "warning").length} warnings, {" "}
                    {logEntries.filter(e => e.status === "error").length} errors
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

