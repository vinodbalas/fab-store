import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { casesAPI } from "../services/api";
import {
  Activity,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Store,
  Zap,
} from "lucide-react";

export default function HomeDashboard({ onSelectCase, onNavigate }) {
  const [stats, setStats] = useState({
    totalCases: 0,
    appeals: 0,
    grievances: 0,
    underInvestigation: 0,
    urgentDeadlines: 0,
    resolved: 0,
    totalAmount: 0,
  });
  const [priorityCases, setPriorityCases] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const allCases = await casesAPI.getAll({ page: 1, pageSize: 1000 });
        const cases = allCases.cases;
        
        const appeals = cases.filter(c => c.type === "Appeal").length;
        const grievances = cases.filter(c => c.type === "Grievance").length;
        const underInvestigation = cases.filter(c => c.status === "Under Investigation").length;
        const urgentDeadlines = cases.filter(c => c.daysUntilDeadline !== null && c.daysUntilDeadline < 7 && c.daysUntilDeadline >= 0).length;
        const resolved = cases.filter(c => c.status === "Resolved").length;
        const totalAmount = cases.reduce((sum, c) => sum + (c.amount || 0), 0);
        
        setStats({
          totalCases: cases.length,
          appeals,
          grievances,
          underInvestigation,
          urgentDeadlines,
          resolved,
          totalAmount,
        });

        // Derive a simple AI-style priority queue: higher amount + closer deadline
        const enriched = cases.map((c) => ({
          ...c,
          aiPriority:
            (c.daysUntilDeadline !== null ? Math.max(0, 30 - c.daysUntilDeadline) : 10) +
            (c.amount || 0) / 50000,
        }));

        const sortedByPriority = enriched
          .filter((c) => c.status !== "Resolved")
          .sort((a, b) => (b.aiPriority || 0) - (a.aiPriority || 0))
          .slice(0, 5);
        setPriorityCases(sortedByPriority);

        // Simple anomalies: urgent deadlines + unusually high disputed amount
        const anomalyCards = [];
        const urgent = cases.filter(
          (c) => c.daysUntilDeadline !== null && c.daysUntilDeadline < 3 && c.status !== "Resolved"
        );
        if (urgent.length) {
          anomalyCards.push({
            id: "urgent-deadlines",
            title: "Appeals close to breaching SLA",
            description: `${urgent.length} cases with less than 3 days remaining before cut-off.`,
            severity: "high",
          });
        }
        const highValue = cases.filter((c) => (c.amount || 0) > 500000);
        if (highValue.length) {
          anomalyCards.push({
            id: "high-value-appeals",
            title: "High-value appeals stuck in queue",
            description: `${highValue.length} cases above $500K still pending decision.`,
            severity: "medium",
          });
        }
        setAnomalies(anomalyCards);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Cases",
      value: stats.totalCases,
      icon: FileText,
      gradient: "from-[#612D91] to-[#A64AC9]",
    },
    {
      title: "Appeals",
      value: stats.appeals,
      icon: AlertCircle,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      title: "Grievances",
      value: stats.grievances,
      icon: FileText,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Under Investigation",
      value: stats.underInvestigation,
      icon: Activity,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Urgent Deadlines",
      value: stats.urgentDeadlines,
      icon: Clock,
      gradient: "from-red-500 to-orange-500",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Disputed Amount",
      value: `$${(stats.totalAmount / 1000).toFixed(0)}K`,
      icon: DollarSign,
      gradient: "from-amber-500 to-yellow-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#612D91]"></div>
      </div>
    );
  }

  const aiSpotlights = [
    {
      title: "Deadlines at Risk (7 days)",
      value: stats.urgentDeadlines,
      description: "Appeals likely to miss regulatory turnaround if not acted on this week.",
      tone: "warning",
    },
    {
      title: "High-Value Appeals in Progress",
      value: Math.max(3, Math.round(stats.totalCases * 0.1)),
      description: "Top-dollar cases where a single decision moves NPS and cost curves.",
      tone: "value",
    },
    {
      title: "Repeat Grievance Patterns",
      value: Math.max(1, Math.round(stats.grievances * 0.15)),
      description: "Signals to feed back into SOP Executor for root-cause playbooks.",
      tone: "pattern",
    },
  ];

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 md:p-7">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#612D91] via-[#A64AC9] to-[#F97316] shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                AI Watchtower
              </h1>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Real-time signals on appeals, grievances and aging backlogs, powered by SOP Executor.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-500/40 text-[11px] font-medium text-green-700 dark:text-green-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Demo
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

        {/* SLA-style risk band, aligned with Cogniclaim */}
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
                    SLA Breach & Escalation Risk – Appeals
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Appeals and grievances that are close to missing regulatory or contractual timelines.
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">
                Critical
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Inbox</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {stats.underInvestigation}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">high-touch cases</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cases Near SLA (7 days)</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {stats.urgentDeadlines}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">appeals &amp; grievances</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Open Appeals (Total)</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  {stats.appeals}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">in queue</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Disputed Amount</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  ${((stats.totalAmount || 0) / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">exposure in current docket</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI-Powered Priority Queue for appeals & grievances */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI-Powered Priority Queue
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
              🤖 AI Recommended
            </span>
          </div>
          {priorityCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {priorityCases.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => onSelectCase && onSelectCase(c)}
                  className="rounded-xl border-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Priority #{idx + 1}
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        {c.caseNumber || c.id}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {c.memberName || c.member || "Member appeal"}
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-md text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      {c.aiPriority?.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    ${((c.amount || 0) / 1000).toFixed(0)}K •{" "}
                    {c.daysUntilDeadline !== null
                      ? `${c.daysUntilDeadline}d to deadline`
                      : "No hard deadline"}
                  </div>
                  <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-800">
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      → Open in AI Watchtower
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              No prioritized appeals available right now.
            </div>
          )}
        </div>

        {/* Anomaly Detection for appeals */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Anomaly Detection
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
              🤖 AI Detected
            </span>
          </div>
          {anomalies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anomalies.map((a, idx) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`rounded-xl border-2 bg-gradient-to-br ${
                    a.severity === "high"
                      ? "from-red-500/20 to-orange-500/20 border-red-500/30"
                      : "from-yellow-500/20 to-amber-500/20 border-yellow-500/30"
                  } bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 hover:shadow-xl transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {a.title}
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {a.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              No anomalies detected in the current appeals backlog.
            </div>
          )}
        </div>

        {/* Quick Actions – aligned with Cogniclaim footer band */}
        <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
              Jump into work
            </h2>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Pick a path to see AI Reasoning applied on live cases
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => onSelectCase && onSelectCase({ id: "new-appeal", type: "Appeal" })}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#612D91] hover:bg-[#612D91]/5 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                New Appeal
                <ArrowRight className="w-3 h-3 text-[#612D91]" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                File and reason through a fresh appeals case.
              </div>
            </button>
            <button
              onClick={() => onSelectCase && onSelectCase({ id: "new-grievance", type: "Grievance" })}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#612D91] hover:bg-[#612D91]/5 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                New Grievance
                <ArrowRight className="w-3 h-3 text-[#612D91]" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Capture a member grievance and route via SOP Executor.
              </div>
            </button>
            <button
              onClick={() => onNavigate && onNavigate("resolve/worklist")}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#612D91] hover:bg-[#612D91]/5 transition-all text-left"
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                Open Worklist
                <ArrowRight className="w-3 h-3 text-[#612D91]" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                See prioritized appeals & grievances with AI triage.
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

