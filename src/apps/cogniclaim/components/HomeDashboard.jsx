import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { aiInsightsAPI, claimsAPI } from "../services/api";
import {
  Activity,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Zap,
  DollarSign,
  Target,
  TrendingDown,
  Users,
  FileCheck,
  Timer,
  Brain,
  TrendingUp as TrendingUpIcon,
  AlertCircle,
  ArrowRight,
  Store,
} from "lucide-react";

// Actionable items - things users should act on
const actionableItems = [
  {
    title: "3 claims may miss SOP 4.5.2 escalation window",
    detail: "Auto-create follow-ups in the next 12 hours.",
    icon: Timer,
    type: "warning",
    metric: "12h",
    action: "Create follow-ups",
    priority: "high",
    link: "worklist",
  },
  // VKV: revisit or TODO - Hidden for now
  // {
  //   title: "High-value claim identified: ₹45K potential recovery",
  //   detail: "Claim #C-2024-0892 requires immediate attention (SOP 5.1.3).",
  //   icon: Target,
  //   type: "opportunity",
  //   metric: "₹45K",
  //   action: "Review claim",
  //   priority: "high",
  //   link: "worklist",
  // },
  {
    title: "Anomaly detected: Unusual delay pattern in GlobalMed claims",
    detail: "AI identified 5 claims with 2x longer processing time. Root cause analysis suggests missing documentation.",
    icon: AlertCircle,
    type: "anomaly",
    metric: "5x",
    action: "Investigate",
    priority: "medium",
    link: "worklist",
  },
  {
    title: "Predictive alert: 8 claims likely to escalate next week",
    detail: "Based on historical patterns and current status, 92% confidence these will require escalation.",
    icon: Brain,
    type: "prediction",
    metric: "92%",
    action: "Prevent escalation",
    priority: "medium",
    link: "worklist",
  },
  // VKV: revisit or TODO - Hidden for now
  // {
  //   title: "Pattern spotted: missing pre-auth docs (SOP 3.2.1)",
  //   detail: "Recurring with Apex Health — consider template reminder.",
  //   icon: FileCheck,
  //   type: "pattern",
  //   metric: "8x",
  //   action: "Setup template",
  //   priority: "low",
  //   link: "worklist",
  // },
  // VKV: revisit or TODO - Hidden for now
  // {
  //   title: "Revenue recovery opportunity: ₹2.3M in pending claims",
  //   detail: "Focus on high-value claims in 'Pending Review' status for maximum impact.",
  //   icon: DollarSign,
  //   type: "opportunity",
  //   metric: "₹2.3M",
  //   action: "View claims",
  //   priority: "high",
  //   link: "worklist",
  // },
];

// Informational insights - metrics and trends for awareness
const informationalInsights = [
  {
    title: "Claims In Progress",
    detail: "48 claims currently being processed",
    icon: Activity,
    type: "metric",
    metric: "48",
    delta: "+6",
    gradient: "from-[#5B2E90] to-[#A64AC9]",
  },
  {
    title: "Pending Pre-Auth",
    detail: "12 claims awaiting pre-authorization",
    icon: ShieldAlert,
    type: "metric",
    metric: "12",
    delta: "-2",
    gradient: "from-[#2E7DA6] to-[#7BD1FF]",
  },
  {
    title: "Avg. Turnaround",
    detail: "3.2 days average processing time",
    icon: Clock,
    type: "metric",
    metric: "3.2d",
    delta: "-14%",
    gradient: "from-[#8B5CF6] to-[#EC4899]",
  },
  {
    title: "Agent Efficiency",
    detail: "87% completion rate this week",
    icon: Users,
    type: "metric",
    metric: "87%",
    delta: "+5%",
    gradient: "from-[#10B981] to-[#34D399]",
  },
  {
    title: "Revenue Recovery",
    detail: "₹12.5M recovered this month",
    icon: DollarSign,
    type: "metric",
    metric: "₹12.5M",
    delta: "+18%",
    gradient: "from-[#F59E0B] to-[#FBBF24]",
  },
  {
    title: "High-Value Opportunities",
    detail: "23 claims over ₹50K pending review",
    icon: Target,
    type: "metric",
    metric: "23",
    delta: "+3",
    gradient: "from-[#EF4444] to-[#F87171]",
  },
];

const typeColors = {
  warning: "from-red-500/20 to-orange-500/20 border-red-500/30",
  opportunity: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  anomaly: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  prediction: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  pattern: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
  metric: "from-gray-500/20 to-gray-500/20 border-gray-500/30",
};

const iconColors = {
  warning: "text-red-600 dark:text-red-400",
  opportunity: "text-green-600 dark:text-green-400",
  anomaly: "text-purple-600 dark:text-purple-400",
  prediction: "text-blue-600 dark:text-blue-400",
  pattern: "text-yellow-600 dark:text-yellow-400",
  metric: "text-gray-600 dark:text-gray-400",
};

const priorityColors = {
  high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
  medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
  low: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
};

export default function HomeDashboard({ onNavigate, onSelectClaim }) {
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loadingPriority, setLoadingPriority] = useState(true);
  const [loadingAnomalies, setLoadingAnomalies] = useState(true);

  // Load AI Priority Queue
  useEffect(() => {
    const loadPriorityQueue = async () => {
      setLoadingPriority(true);
      try {
        const data = await aiInsightsAPI.getPriorityQueue({ limit: 5 });
        setPriorityQueue(data);
      } catch (error) {
        console.error("Failed to load priority queue:", error);
      } finally {
        setLoadingPriority(false);
      }
    };
    loadPriorityQueue();
    // Refresh every 60 seconds
    const interval = setInterval(loadPriorityQueue, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load AI Anomalies
  useEffect(() => {
    const loadAnomalies = async () => {
      setLoadingAnomalies(true);
      try {
        const data = await aiInsightsAPI.getAnomalies();
        setAnomalies(data);
      } catch (error) {
        console.error("Failed to load anomalies:", error);
      } finally {
        setLoadingAnomalies(false);
      }
    };
    loadAnomalies();
    // Refresh every 120 seconds
    const interval = setInterval(loadAnomalies, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleActionClick = (item) => {
    if (item.link && onNavigate) {
      onNavigate(item.link);
    }
  };

  const handleClaimClick = async (claimId) => {
    if (onSelectClaim) {
      const claim = await claimsAPI.getById(claimId);
      if (claim) {
        onSelectClaim(claim);
        onNavigate?.("worklist");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* AI Watchtower Section - Main Focus */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-[#612D91] to-[#A64AC9] shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Watchtower</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Real-time insights, metrics & actionable items for your claims processing workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur text-xs font-medium text-[#612D91] dark:text-[#A64AC9] border border-[#612D91]/20 dark:border-[#A64AC9]/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate("store")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-[#612D91] dark:hover:text-[#A64AC9] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Back to FAB Store"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Store</span>
              </button>
            )}
          </div>
        </div>

        {/* SLA & Late Payment Penalty Risk Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    SLA Breach & Late Payment Penalty Risk
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Claims that missed processing deadlines and may incur penalties
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">
                Critical
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Total Claims Missed SLA - YTD */}
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Missed SLA (YTD)</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">1,247</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">claims</div>
              </div>

              {/* Total Claims Missed SLA - QTD */}
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Missed SLA (QTD)</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">312</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">claims</div>
              </div>

              {/* Estimated Penalty Risk */}
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Penalty Risk (YTD)</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">$4.2M</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">estimated</div>
              </div>

              {/* Penalty Risk - QTD */}
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Penalty Risk (QTD)</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">$1.1M</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">estimated</div>
              </div>
            </div>

            {/* Top States by Total At-Risk Value (sum of all SLA-breached claims = total exposure) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Total At-Risk Value - Texas
                  </div>
                  <div className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                    TX
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">$20.0M</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Sum of all SLA-breached claims • 247 claims</div>
                <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Potential penalty: ~$600K
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Total At-Risk Value - Michigan
                  </div>
                  <div className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                    MI
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">$14.8M</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Sum of all SLA-breached claims • 189 claims</div>
                <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Potential penalty: ~$445K
                </div>
              </div>
            </div>

            {/* Cogniclaim Value Proposition */}
            <div className="mt-4 p-4 bg-gradient-to-r from-[#612D91]/10 to-[#A64AC9]/10 dark:from-[#612D91]/20 dark:to-[#A64AC9]/20 rounded-lg border border-[#612D91]/30">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Cogniclaim Impact
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    AI-powered prioritization can prevent <span className="font-semibold text-[#612D91] dark:text-[#A64AC9]">~65% of SLA breaches</span> by 
                    identifying high-risk claims early and routing them to appropriate workflows. Estimated savings: <span className="font-semibold">$2.7M annually</span> in avoided penalties.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
              <button
                onClick={() => onNavigate?.("worklist")}
                className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2"
              >
                → Review all SLA-breached claims
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* NEW: AI-Powered Priority Queue */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Priority Queue</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
              🤖 AI Recommended
            </span>
          </div>
          {loadingPriority ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : priorityQueue.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {priorityQueue.map((claim, idx) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleClaimClick(claim.id)}
                  className="rounded-xl border-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Priority #{idx + 1}</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{claim.id}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{claim.member}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                      claim.aiRiskLevel === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      claim.aiRiskLevel === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}>
                      {claim.aiPriority?.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ₹{(claim.amount / 1000).toFixed(0)}K
                  </div>
                  {claim.aiReasons && claim.aiReasons.length > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {claim.aiReasons[0]}
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-800">
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      → Review claim
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No prioritized claims available
            </div>
          )}
        </div>

        {/* NEW: AI Anomaly Detection Panel */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Anomaly Detection</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
              🤖 AI Detected
            </span>
          </div>
          {loadingAnomalies ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : anomalies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anomalies.map((anomaly, idx) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-xl border-2 bg-gradient-to-br ${
                    anomaly.severity === 'high' ? 'from-red-500/20 to-orange-500/20 border-red-500/30' :
                    anomaly.severity === 'medium' ? 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30' :
                    'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
                  } bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 hover:shadow-xl transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-xs px-2 py-1 rounded-md border ${
                        anomaly.severity === 'high' ? priorityColors.high :
                        anomaly.severity === 'medium' ? priorityColors.medium :
                        priorityColors.low
                      }`}>
                        {anomaly.severity}
                      </div>
                      <div className="text-xs font-bold px-2 py-1 rounded-md bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {Math.round(anomaly.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                    {anomaly.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    {anomaly.description}
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-medium text-[#612D91] dark:text-[#A64AC9]">
                      → {anomaly.recommendation}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No anomalies detected
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700 my-6" />

        {/* Section 1: Actionable Items */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Required</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
              {actionableItems.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionableItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => handleActionClick(item)}
                  className={`rounded-xl border-2 bg-gradient-to-br ${typeColors[item.type] || "from-gray-500/20 to-gray-500/20 border-gray-500/30"} bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer relative`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${typeColors[item.type] || ""} border border-current/20`}>
                      <Icon className={`w-4 h-4 ${iconColors[item.type] || "text-gray-600 dark:text-gray-400"}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Priority badge */}
                      {item.priority && (
                        <div className={`text-xs px-2 py-1 rounded-md border ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </div>
                      )}
                      <div className="text-xs font-bold px-2 py-1 rounded-md bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {item.metric}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    {item.detail}
                  </div>
                  {/* Action button */}
                  {item.action && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(item);
                        }}
                        className="text-xs font-medium text-[#612D91] dark:text-[#A64AC9] hover:underline flex items-center gap-1"
                      >
                        → {item.action}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700 my-6" />

        {/* Section 2: Informational Insights */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insights & Metrics</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
              {informationalInsights.length} insights
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {informationalInsights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`rounded-xl border-2 bg-gradient-to-br ${typeColors[item.type] || "from-gray-500/20 to-gray-500/20 border-gray-500/30"} bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${item.gradient ? `bg-gradient-to-br ${item.gradient} text-white shadow` : `bg-gradient-to-br ${typeColors[item.type] || ""} border border-current/20`}`}>
                      <Icon className={`w-4 h-4 ${item.gradient ? "text-white" : (iconColors[item.type] || "text-gray-600 dark:text-gray-400")}`} />
                    </div>
                    {item.delta && (
                      <div className="text-xs font-medium text-green-600 dark:text-green-400">
                        {item.delta}
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {item.metric}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.detail}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate?.("worklist")}
            className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#612D91] dark:hover:border-[#A64AC9] hover:bg-[#612D91]/5 dark:hover:bg-[#A64AC9]/5 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#612D91]/10 dark:bg-[#A64AC9]/20 group-hover:bg-[#612D91]/20 dark:group-hover:bg-[#A64AC9]/30 transition-colors">
                <FileCheck className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9]" />
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">View Worklist</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Access all claims and start processing</p>
          </button>

          <button
            onClick={() => onNavigate?.("reports")}
            className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#612D91] dark:hover:border-[#A64AC9] hover:bg-[#612D91]/5 dark:hover:bg-[#A64AC9]/5 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#612D91]/10 dark:bg-[#A64AC9]/20 group-hover:bg-[#612D91]/20 dark:group-hover:bg-[#A64AC9]/30 transition-colors">
                <TrendingUpIcon className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9]" />
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">View Reports</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analyze trends and performance metrics</p>
          </button>

          <button
            onClick={() => onNavigate?.("knowledge")}
            className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#612D91] dark:hover:border-[#A64AC9] hover:bg-[#612D91]/5 dark:hover:bg-[#A64AC9]/5 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#612D91]/10 dark:bg-[#A64AC9]/20 group-hover:bg-[#612D91]/20 dark:group-hover:bg-[#A64AC9]/30 transition-colors">
                <Brain className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9]" />
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">Knowledge Base</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Browse SOPs and documentation</p>
          </button>
        </div>
      </div>
    </div>
  );
}

