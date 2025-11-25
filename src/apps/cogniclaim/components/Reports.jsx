import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Sparkles, ArrowUpRight, Activity, Store } from "lucide-react";

/* ---------------------------------------------
   Mock analytics data
----------------------------------------------*/
const trendByDay = [
  { d: "Mon", val: 18 },
  { d: "Tue", val: 22 },
  { d: "Wed", val: 19 },
  { d: "Thu", val: 25 },
  { d: "Fri", val: 21 },
  { d: "Sat", val: 17 },
  { d: "Sun", val: 16 },
];

const distByAction = [
  { name: "Request Info", val: 12 },
  { name: "Pre-Auth", val: 9 },
  { name: "Follow-up", val: 6 },
  { name: "Escalate", val: 4 },
];

const providerTAT = [
  { name: "Apex", tat: 2.8 },
  { name: "GlobalMed", tat: 3.5 },
  { name: "MediCore", tat: 1.9 },
  { name: "CarePlus", tat: 2.2 },
];

const revenueByMonth = [
  { month: "Jan", recovered: 2.8, potential: 4.2 },
  { month: "Feb", recovered: 3.1, potential: 4.5 },
  { month: "Mar", recovered: 3.5, potential: 4.8 },
  { month: "Apr", recovered: 3.8, potential: 5.1 },
  { month: "May", recovered: 4.2, potential: 5.4 },
  { month: "Jun", recovered: 4.5, potential: 5.7 },
];

const claimStatusDistribution = [
  { status: "Approved", count: 145, value: 2.8 },
  { status: "Pending", count: 48, value: 1.2 },
  { status: "Escalated", count: 12, value: 0.3 },
  { status: "Info Needed", count: 23, value: 0.6 },
];

/* ---------------------------------------------
   Helpers
----------------------------------------------*/
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: i * 0.06 },
  }),
};

function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-900/80 backdrop-blur " +
        className
      }
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------
   Reports Component
----------------------------------------------*/
export default function Reports({ onNavigate }) {
  return (
    <div className="space-y-6 pb-6 px-6 pt-6">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive insights into claims performance, trends, and revenue
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
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend line */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                  Turnaround Trend (7 days)
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Average processing time per day
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-[#7E34B0]" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendByDay}>
                  <XAxis dataKey="d" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ stroke: "#e9d5ff" }}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="val"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    dot={{ fill: "#8B5CF6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Distribution bar */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                  AI Recommendations (last 50)
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Distribution by action type
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distByAction}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar
                    dataKey="val"
                    radius={[8, 8, 0, 0]}
                    fill="#A78BFA"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Revenue Trend - full width */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="lg:col-span-2"
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                  Revenue Recovery Trend (6 months)
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Recovered vs potential value (in ₹Lakhs)
                </div>
              </div>
              <Activity className="w-5 h-5 text-[#34D399]" />
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonth}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="potential"
                    stackId="1"
                    stroke="#34D399"
                    fill="#34D399"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="recovered"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Provider TAT */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                  Avg. Turnaround by Provider (days)
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Performance comparison
                </div>
              </div>
              <Activity className="w-5 h-5 text-[#34D399]" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={providerTAT}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area
                    dataKey="tat"
                    type="monotone"
                    stroke="#34D399"
                    fill="#34D399"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                  Claims by Status
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Count and value distribution
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={claimStatusDistribution}>
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    fill="#A78BFA"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="value"
                    fill="#34D399"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

