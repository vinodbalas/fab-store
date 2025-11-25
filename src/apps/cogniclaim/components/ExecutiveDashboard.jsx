import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  Brain,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  FileText,
  Store,
} from "lucide-react";
import { claimsAPI, feedbackAPI } from "../services/api";

/**
 * Executive Dashboard
 * C-level focused view with ROI metrics, revenue intelligence, and predictive insights
 */

// Mock executive metrics - in production, these would come from backend
const getExecutiveMetrics = () => ({
  revenueRecovered: {
    current: 3800000, // ₹3.8L
    previous: 3200000,
    trend: "+18%",
    target: 5000000,
  },
  costSavings: {
    current: 1250000, // ₹12.5L
    previous: 980000,
    trend: "+27%",
    source: "Reduced processing time by 14%",
  },
  efficiencyGain: {
    current: 18, // 18% productivity increase
    previous: 12,
    trend: "+6%",
    metric: "2.3 claims/hour vs 1.9",
  },
  riskMitigation: {
    escalationsPrevented: 8,
    costSaved: 120000, // ₹1.2L
    confidence: 92,
  },
  roi: {
    investment: 1000000, // ₹10L
    return: 3800000, // ₹38L
    ratio: 3.8,
  },
});

// Mock predictive insights
const getPredictiveInsights = () => [
  {
    id: 1,
    type: "escalation",
    title: "8 claims likely to escalate next week",
    confidence: 92,
    impact: "₹1.2L potential cost",
    action: "Prevent escalation",
    priority: "high",
    claims: ["CLM-002", "CLM-005", "CLM-010", "CLM-015", "CLM-018", "CLM-022", "CLM-025", "CLM-030"],
  },
  {
    id: 2,
    type: "revenue",
    title: "Revenue forecast: ₹4.2M next month",
    confidence: 87,
    impact: "+10% vs current",
    action: "View forecast",
    priority: "medium",
  },
  {
    id: 3,
    type: "provider",
    title: "Apex Health: 23% incomplete docs pattern",
    confidence: 85,
    impact: "12 claims affected",
    action: "Setup template",
    priority: "medium",
  },
  {
    id: 4,
    type: "anomaly",
    title: "5 claims showing unusual delay patterns",
    confidence: 78,
    impact: "2x longer processing time",
    action: "Investigate",
    priority: "low",
  },
];

// Mock revenue intelligence
const getRevenueIntelligence = () => [
  {
    claimId: "CLM-0892",
    amount: 45000,
    recoveryPotential: 45000,
    status: "Pending Review",
    priority: "high",
    daysPending: 2,
    provider: "Apex Health",
  },
  {
    claimId: "CLM-0785",
    amount: 38000,
    recoveryPotential: 38000,
    status: "Information Needed",
    priority: "high",
    daysPending: 5,
    provider: "GlobalMed",
  },
  {
    claimId: "CLM-0923",
    amount: 32000,
    recoveryPotential: 32000,
    status: "Pending Review",
    priority: "medium",
    daysPending: 1,
    provider: "MediCore",
  },
  {
    claimId: "CLM-0654",
    amount: 28000,
    recoveryPotential: 28000,
    status: "Under Process",
    priority: "medium",
    daysPending: 3,
    provider: "CarePlus",
  },
  {
    claimId: "CLM-0712",
    amount: 25000,
    recoveryPotential: 25000,
    status: "Pending Review",
    priority: "medium",
    daysPending: 4,
    provider: "Apex Health",
  },
];

// Mock trend data
const getTrendData = () => ({
  revenueByWeek: [
    { week: "Week 1", recovered: 0.8, potential: 1.2 },
    { week: "Week 2", recovered: 1.1, potential: 1.5 },
    { week: "Week 3", recovered: 1.3, potential: 1.8 },
    { week: "Week 4", recovered: 1.5, potential: 2.1 },
    { week: "This Week", recovered: 1.8, potential: 2.3 },
  ],
  efficiencyTrend: [
    { month: "Jan", claimsPerHour: 1.6 },
    { month: "Feb", claimsPerHour: 1.8 },
    { month: "Mar", claimsPerHour: 1.9 },
    { month: "Apr", claimsPerHour: 2.1 },
    { month: "May", claimsPerHour: 2.3 },
  ],
  statusDistribution: [
    { status: "Approved", count: 145, value: 2.8 },
    { status: "Pending", count: 48, value: 1.2 },
    { status: "Escalated", count: 12, value: 0.3 },
    { status: "Info Needed", count: 23, value: 0.6 },
  ],
});

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: i * 0.06 },
  }),
};

export default function ExecutiveDashboard({ onSelectClaim, onNavigate }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const metrics = useMemo(() => getExecutiveMetrics(), []);
  const insights = useMemo(() => getPredictiveInsights(), []);
  const revenueData = useMemo(() => getRevenueIntelligence(), []);
  const trendData = useMemo(() => getTrendData(), []);
  const [feedbackMetrics, setFeedbackMetrics] = useState({
    totalActions: 0,
    aiCorrect: 0,
    aiIncorrect: 0,
    accuracy: 0,
    learningRate: 0,
    improvementOverTime: [],
  });

  // Load feedback metrics
  useEffect(() => {
    const loadFeedbackMetrics = async () => {
      try {
        const data = await feedbackAPI.getMetrics();
        setFeedbackMetrics(data);
      } catch (error) {
        console.error("Failed to load feedback metrics:", error);
      }
    };
    
    loadFeedbackMetrics();
    
    // Refresh every 30 seconds to show real-time updates
    const interval = setInterval(loadFeedbackMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalRevenuePotential = useMemo(
    () => revenueData.reduce((sum, claim) => sum + claim.recoveryPotential, 0),
    [revenueData]
  );

  return (
    <div className="space-y-6 pb-6 px-6 pt-6">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Executive Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Real-time ROI metrics, revenue intelligence, and predictive insights
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("store")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#612D91] to-[#A64AC9] rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Store className="w-4 h-4" />
              Back to Store
            </button>
          )}
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#612D91]"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Tier 1: ROI Metrics - Large Prominent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue Recovered */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-bold">{metrics.revenueRecovered.trend}</span>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenue Recovered</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{(metrics.revenueRecovered.current / 100000).toFixed(1)}L
            </p>
          </div>
          <div className="pt-3 border-t border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Target</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{(metrics.revenueRecovered.target / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="mt-2 h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(metrics.revenueRecovered.current / metrics.revenueRecovered.target) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Cost Savings */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-bold">{metrics.costSavings.trend}</span>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cost Savings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{(metrics.costSavings.current / 100000).toFixed(1)}L
            </p>
          </div>
          <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {metrics.costSavings.source}
            </p>
          </div>
        </motion.div>

        {/* Efficiency Gain */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-bold">{metrics.efficiencyGain.trend}</span>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Efficiency Gain</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.efficiencyGain.current}%
            </p>
          </div>
          <div className="pt-3 border-t border-purple-200 dark:border-purple-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {metrics.efficiencyGain.metric}
            </p>
          </div>
        </motion.div>

        {/* ROI Ratio */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">ROI</span>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ROI Ratio</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.roi.ratio.toFixed(1)}x
            </p>
          </div>
          <div className="pt-3 border-t border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Return</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{(metrics.roi.return / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tier 1: AI Learning & Feedback Loop - Key Storytelling Element */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={4}
        className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Performance & Feedback Tracking</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Monitor AI recommendation accuracy and track expert decisions for continuous improvement
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI Accuracy */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">AI Accuracy</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {feedbackMetrics.accuracy.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {feedbackMetrics.totalActions} decisions analyzed
              </p>
            </div>
            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${feedbackMetrics.accuracy}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Learning Rate */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 rounded-lg border border-purple-200 dark:border-purple-800 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Learning Rate</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {feedbackMetrics.learningRate > 0 ? '+' : ''}{feedbackMetrics.learningRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recent improvement trend
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {feedbackMetrics.learningRate > 0 ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-xs font-semibold">Improving</span>
                </div>
              ) : feedbackMetrics.learningRate < 0 ? (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <ArrowDownRight className="w-3 h-3" />
                  <span className="text-xs font-semibold">Declining</span>
                </div>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">Stable</span>
              )}
            </div>
          </motion.div>

          {/* Feedback Impact */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 rounded-lg border border-pink-200 dark:border-pink-800 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Feedback Impact</span>
              <Zap className="w-4 h-4 text-pink-500" />
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {feedbackMetrics.aiCorrect}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Correct predictions / {feedbackMetrics.totalActions} total
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>{feedbackMetrics.aiCorrect}</span>
              </div>
              <span className="text-gray-400">/</span>
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <XCircle className="w-3 h-3" />
                <span>{feedbackMetrics.aiIncorrect}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Storytelling Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 p-3 bg-gradient-to-r from-indigo-100/50 to-purple-100/50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50"
        >
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong className="text-indigo-700 dark:text-indigo-300">💡 Performance Monitoring:</strong>{" "}
            Every expert decision is captured and analyzed to track AI recommendation accuracy. This feedback data 
            enables performance monitoring, identifies patterns, and builds a dataset for future model improvements. 
            The system tracks alignment between AI recommendations and expert decisions to ensure quality and compliance.
          </p>
        </motion.div>
      </motion.div>

      {/* Tier 1: Predictive Insights Panel */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={5}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#612D91] to-[#A64AC9] shadow-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Predictive Insights</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">Forecasts and risk predictions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-lg border-2 ${
                insight.priority === "high"
                  ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                  : insight.priority === "medium"
                  ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10"
                  : "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {insight.title}
                    </h3>
                    {insight.priority === "high" && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        High
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {insight.impact}
                  </p>
                  {insight.claims && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {insight.claims.slice(0, 4).map((claimId) => (
                        <span
                          key={claimId}
                          className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                          {claimId}
                        </span>
                      ))}
                      {insight.claims.length > 4 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          +{insight.claims.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#612D91]/10 to-[#A64AC9]/10 dark:from-[#612D91]/20 dark:to-[#A64AC9]/20 border border-[#612D91]/30 dark:border-[#A64AC9]/40">
                    <span className="text-xs font-bold text-[#612D91] dark:text-[#A64AC9]">
                      {insight.confidence}%
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white text-xs font-semibold hover:shadow-lg transition-all">
                {insight.action}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tier 1: Revenue Intelligence */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={5}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Intelligence</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                High-value claims prioritized by recovery potential
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <span className="text-sm font-bold text-green-700 dark:text-green-300">
              ₹{(totalRevenuePotential / 100000).toFixed(1)}L Total Potential
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Claim ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Provider
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Amount
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Recovery Potential
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Days Pending
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Priority
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((claim, idx) => (
                <motion.tr
                  key={claim.claimId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => onSelectClaim?.(claim.claimId)}
                >
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {claim.claimId}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{claim.provider}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{claim.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      ₹{claim.recoveryPotential.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {claim.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{claim.daysPending}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        claim.priority === "high"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                      }`}
                    >
                      {claim.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClaim?.(claim.claimId);
                      }}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white text-xs font-semibold hover:shadow-lg transition-all"
                    >
                      Review
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={6}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Trend</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Recovered vs Potential</p>
            </div>
          </div>
          <div className="space-y-3">
            {trendData.revenueByWeek.map((week, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{week.week}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 dark:text-gray-300">
                      Recovered: ₹{week.recovered.toFixed(1)}L
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Potential: ₹{week.potential.toFixed(1)}L
                    </span>
                  </div>
                </div>
                <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(week.recovered / week.potential) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((week.potential - week.recovered) / week.potential) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 + 0.2 }}
                    className="absolute right-0 top-0 h-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Efficiency Trend */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={7}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Efficiency Trend</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Claims processed per hour</p>
            </div>
          </div>
          <div className="space-y-3">
            {trendData.efficiencyTrend.map((month, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{month.month}</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {month.claimsPerHour.toFixed(1)} claims/hour
                  </span>
                </div>
                <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(month.claimsPerHour / 2.5) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Risk Mitigation Summary */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={8}
        className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-md">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Risk Mitigation</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Escalations prevented through AI predictions
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Escalations Prevented</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.riskMitigation.escalationsPrevented}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cost Saved</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{(metrics.riskMitigation.costSaved / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Confidence</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.riskMitigation.confidence}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

