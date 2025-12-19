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
  Users,
  Timer,
  Shield,
} from "lucide-react";
import { getTicketStats } from "../services/ticketsService";

/**
 * Executive Dashboard for TP FAB Agents
 * C-level focused view with ROI metrics, automation impact, and business intelligence
 */

// Get executive metrics from ticket stats
const getExecutiveMetrics = (stats) => {
  const total = stats.total || 1;
  const selfHealed = stats.selfHealed || 0;
  const escalated = stats.escalated || 0;
  
  // Calculate cost savings (assuming $50 per ticket avoided, $25 per self-healed)
  const costPerTicket = 50;
  const costPerSelfHeal = 25;
  const costSavings = (selfHealed * costPerSelfHeal) + ((total - escalated) * costPerTicket);
  
  // Calculate time savings (assuming 15 min per ticket, 2 min per self-heal)
  const timePerTicket = 15; // minutes
  const timePerSelfHeal = 2; // minutes
  const timeSaved = (selfHealed * timePerSelfHeal) + ((total - escalated) * timePerTicket);
  
  // Calculate automation rate
  const automationRate = total > 0 ? Math.round((selfHealed / total) * 100) : 0;
  
  // Calculate efficiency gain (productivity increase)
  const efficiencyGain = automationRate > 0 ? Math.round(automationRate * 0.8) : 0;
  
  return {
    costSavings: {
      current: costSavings,
      previous: costSavings * 0.85, // Simulated previous period
      trend: "+18%",
      source: "Automated resolution and ticket prevention",
    },
    timeSaved: {
      current: timeSaved,
      previous: timeSaved * 0.88,
      trend: "+12%",
      hours: Math.round(timeSaved / 60),
      minutes: timeSaved % 60,
    },
    automationRate: {
      current: automationRate,
      previous: automationRate - 5,
      trend: `+${automationRate - (automationRate - 5)}%`,
      target: 75,
    },
    efficiencyGain: {
      current: efficiencyGain,
      previous: efficiencyGain - 3,
      trend: "+3%",
      metric: `${automationRate}% automated vs ${automationRate - 5}% baseline`,
    },
    customerSatisfaction: {
      current: 94,
      previous: 88,
      trend: "+6%",
    },
    resolutionSpeed: {
      current: 45, // seconds
      previous: 1080, // 18 minutes
      trend: "-96%",
      improvement: "From 18 min to 45 sec",
    },
    roi: {
      investment: 100000, // $100K
      return: costSavings,
      ratio: (costSavings / 100000).toFixed(1),
    },
  };
};

// Mock predictive insights
const getPredictiveInsights = (stats) => [
  {
    id: 1,
    type: "automation",
    title: `${stats.selfHealed || 0} tickets self-healed this month`,
    confidence: 95,
    impact: `$${((stats.selfHealed || 0) * 25).toLocaleString()} saved`,
    action: "View details",
    priority: "high",
  },
  {
    id: 2,
    type: "escalation",
    title: `${stats.escalated || 0} tickets escalated to human agents`,
    confidence: 92,
    impact: "Requires review",
    action: "Review patterns",
    priority: "medium",
  },
  {
    id: 3,
    type: "workflow",
    title: "Top workflow: Printer Offline",
    confidence: 87,
    impact: `${stats.byWorkflow?.["printer_offline"] || 0} incidents`,
    action: "Optimize workflow",
    priority: "medium",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function ExecutiveDashboard({ onNavigate }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [stats, setStats] = useState({
    total: 0,
    selfHealed: 0,
    escalated: 0,
    inProgress: 0,
    failed: 0,
    bySystem: {},
    byWorkflow: {},
  });

  // Load stats
  useEffect(() => {
    const loadStats = () => {
      const ticketStats = getTicketStats();
      setStats(ticketStats);
    };
    
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => getExecutiveMetrics(stats), [stats]);
  const insights = useMemo(() => getPredictiveInsights(stats), [stats]);

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
              Real-time ROI metrics, automation impact, and business intelligence
            </p>
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
        {/* Cost Savings */}
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
              <span className="text-sm font-bold">{metrics.costSavings.trend}</span>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cost Savings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${(metrics.costSavings.current / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="pt-3 border-t border-green-200 dark:border-green-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {metrics.costSavings.source}
            </p>
          </div>
        </motion.div>

        {/* Time Saved */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-bold">{metrics.timeSaved.trend}</span>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Time Saved</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.timeSaved.hours}h
            </p>
          </div>
          <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {metrics.timeSaved.minutes} minutes this month
            </p>
          </div>
        </motion.div>

        {/* Automation Rate */}
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
              <span className="text-sm font-bold">{metrics.automationRate.trend}</span>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Automation Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.automationRate.current}%
            </p>
          </div>
          <div className="pt-3 border-t border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Target</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {metrics.automationRate.target}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(metrics.automationRate.current / metrics.automationRate.target) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
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
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-bold">{metrics.roi.ratio}x</span>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ROI Ratio</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.roi.ratio}x
            </p>
          </div>
          <div className="pt-3 border-t border-amber-200 dark:border-amber-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ${(metrics.roi.investment / 1000).toFixed(0)}K investment
            </p>
          </div>
        </motion.div>
      </div>

      {/* Tier 2: Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Customer Satisfaction */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.customerSatisfaction.current}%
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-bold">{metrics.customerSatisfaction.trend}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resolution Speed */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={5}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Resolution Speed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.resolutionSpeed.current}s
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-xs font-bold">{metrics.resolutionSpeed.trend}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {metrics.resolutionSpeed.improvement}
          </p>
        </motion.div>

        {/* Efficiency Gain */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={6}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Efficiency Gain</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.efficiencyGain.current}%
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-bold">{metrics.efficiencyGain.trend}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {metrics.efficiencyGain.metric}
          </p>
        </motion.div>
      </div>

      {/* Predictive Insights */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={7}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9]" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Predictive Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border-2 ${
                insight.priority === "high"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : insight.priority === "medium"
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
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
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {insight.confidence}% confidence
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

