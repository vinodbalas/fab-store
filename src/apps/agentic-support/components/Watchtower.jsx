import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, BarChart3, TrendingUp, Store, Zap, Clock, DollarSign, 
  Users, CheckCircle2, AlertCircle, Bot, TrendingDown, Sparkles,
  Target, Award, ArrowRight, Brain, Shield, Timer, Wrench
} from "lucide-react";
import TicketsTable from "./TicketsTable";

const MOCK_STATS = {
  totalIncidents: 1250,
  selfHealed: 780,
  escalated: 320,
  failed: 150,
  avgSelfHealSeconds: 45,
  avgManualMinutes: 18,
  ticketsAvoided: 520,
  costSavingsPerMonth: 127000,
  customerSatisfaction: 94,
  mttr: 45, // Mean Time To Resolution in seconds
  agentProductivityGain: 68,
};

const MOCK_RECENT = [
  {
    id: "RUN-1042",
    time: "09:21",
    account: "TP Internal – Floor 3",
    workflow: "Printer Offline",
    outcome: "Self-healed",
    duration: "38s",
    saved: "15 min",
    agent: "Diagnostic Agent",
  },
  {
    id: "RUN-1041",
    time: "09:02",
    account: "Teleperformance Home Support",
    workflow: "Ink Cartridge Error",
    outcome: "Self-healed",
    duration: "52s",
    saved: "12 min",
    agent: "Hardware Agent",
  },
  {
    id: "RUN-1039",
    time: "08:47",
    account: "Large Retail – Store 21",
    workflow: "Printer Offline",
    outcome: "Escalated",
    duration: "1m 40s",
    saved: "8 min",
    agent: "Network Agent",
  },
];

const VALUE_METRICS = [
  {
    title: "Cost Savings",
    value: "$127K",
    subtitle: "per month",
    change: "+24%",
    icon: DollarSign,
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-50 to-emerald-50",
  },
  {
    title: "Time Saved",
    value: "2,340",
    subtitle: "hours this month",
    change: "+31%",
    icon: Clock,
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
  },
  {
    title: "Customer Satisfaction",
    value: "94%",
    subtitle: "CSAT score",
    change: "+12%",
    icon: Users,
    gradient: "from-purple-500 to-pink-600",
    bgGradient: "from-purple-50 to-pink-50",
  },
  {
    title: "Resolution Speed",
    value: "45s",
    subtitle: "avg. resolution time",
    change: "-76%",
    icon: Zap,
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-50 to-orange-50",
  },
];

export default function AgenticSupportWatchtower({ onNavigate }) {
  const [activeAgents, setActiveAgents] = useState(3);
  const [liveIncident, setLiveIncident] = useState(null);

  const automationRate = useMemo(
    () => Math.round((MOCK_STATS.selfHealed / MOCK_STATS.totalIncidents) * 100),
    []
  );

  const escalationAvoidRate = useMemo(
    () => Math.round((MOCK_STATS.ticketsAvoided / MOCK_STATS.totalIncidents) * 100),
    []
  );

  // Simulate live agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgents(Math.floor(Math.random() * 5) + 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live incident processing
  useEffect(() => {
    const incidents = [
      { type: "Printer Offline", agent: "Diagnostic Agent", status: "analyzing" },
      { type: "Network Issue", agent: "Network Agent", status: "resolving" },
      { type: "Software Update", agent: "System Agent", status: "executing" },
      { type: "VPN Connection", agent: "Security Agent", status: "authenticating" },
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      setLiveIncident(incidents[index]);
      index = (index + 1) % incidents.length;
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#612D91] via-[#7B3FE4] to-[#C26BFF] p-8 shadow-2xl"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    AI Watchtower
                  </h1>
                  <p className="text-purple-100 text-sm sm:text-base">
                    Your autonomous support operations command center
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">{automationRate}%</div>
                  <div className="text-purple-100 text-xs mt-1">Auto-Resolution Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">{activeAgents}</div>
                  <div className="text-purple-100 text-xs mt-1">Active AI Agents</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">{MOCK_STATS.ticketsAvoided}</div>
                  <div className="text-purple-100 text-xs mt-1">Tickets Prevented</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-purple-100 text-xs mt-1">Always Monitoring</div>
                </div>
              </div>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate("store")}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg border border-white/30 backdrop-blur-sm transition-all"
                title="Back to FAB Store"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Store</span>
              </button>
            )}
          </div>

          {/* Live Agent Activity */}
          <AnimatePresence mode="wait">
            {liveIncident && (
              <motion.div
                key={liveIncident.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="relative">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">{liveIncident.agent}</div>
                  <div className="text-purple-100 text-xs truncate">{liveIncident.status} {liveIncident.type}...</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/20 border border-green-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-white font-medium">Live</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tickets Worklist full-width, Live Activity below */}
      <div className="space-y-6 mt-6">
        {/* Tickets - full width table */}
        <div className="rounded-3xl bg-white border border-gray-200 shadow-lg p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#612D91]" />
            <h2 className="text-lg font-bold text-gray-900">Generated Tickets</h2>
          </div>
          
          <div className="flex-1 min-h-0">
            <TicketsTable onSelect={(ticket) => {
              // Handle ticket selection if needed
              console.log("Selected ticket:", ticket);
            }} />
          </div>
        </div>

        {/* Live Activity - full width */}
        <div className="rounded-3xl bg-white border border-gray-200 shadow-lg p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#612D91]" />
              <h2 className="text-lg font-bold text-gray-900">Live Activity</h2>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-700 font-medium">Live</span>
            </div>
          </div>
          
          <div className="space-y-3 flex-1 min-h-0 overflow-y-auto">
            {MOCK_RECENT.map((run, idx) => (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group rounded-xl border border-gray-200 p-3 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#612D91]" />
                    <span className="text-xs font-medium text-gray-600">{run.agent}</span>
                  </div>
                  <span className="text-xs text-gray-400">{run.time}</span>
                </div>
                
                <div className="font-semibold text-sm text-gray-900 mb-1">{run.workflow}</div>
                <div className="text-xs text-gray-500 mb-2">{run.account}</div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    run.outcome === "Self-healed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {run.outcome}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Timer className="w-3 h-3" />
                    <span>{run.duration}</span>
                    <span className="text-green-600 font-medium">+{run.saved}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Value Metric Card with animation
function ValueMetricCard({ metric, index }) {
  const Icon = metric.icon;
  const isNegativeGood = metric.change.startsWith('-');
  const changeColor = isNegativeGood ? 'text-green-600' : 'text-green-600';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-2xl bg-gradient-to-br ${metric.bgGradient} border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all group overflow-hidden`}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm ${changeColor}`}>
            {isNegativeGood ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            <span className="text-xs font-bold">{metric.change}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
          <div className="text-sm text-gray-600">{metric.subtitle}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{metric.title}</div>
        </div>
      </div>
    </motion.div>
  );
}

// Workflow Step Component
function WorkflowStep({ number, icon, title, description, color }) {
  return (
    <div className="relative">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${color} shadow-lg flex items-center justify-center`}>
          <div className="text-white">{icon}</div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900">{number}</span>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
      {number !== "4" && (
        <div className="hidden md:block absolute top-8 left-[calc(100%+0.5rem)] w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
      )}
    </div>
  );
}

// Comparison Metric Component
function ComparisonMetric({ label, value, trend, improvement }) {
  const isPositive = trend === "positive";
  
  return (
    <div className={`p-3 rounded-xl border-2 ${isPositive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs text-gray-600 mb-1">{label}</div>
          <div className={`text-lg font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
            {value}
          </div>
        </div>
        {improvement && (
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {improvement}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Workflow Card
function EnhancedWorkflowCard({ name, total, selfHealed, escalated, failed, icon }) {
  const automationRate = Math.round((selfHealed / total) * 100);
  const successRate = Math.round(((selfHealed + escalated) / total) * 100);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative rounded-2xl border-2 border-gray-200 bg-white p-6 space-y-4 hover:border-purple-300 hover:shadow-xl transition-all overflow-hidden group"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#612D91] to-[#A64AC9] shadow-md">
              {icon}
              <span className="text-white"></span>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{name}</div>
              <div className="text-xs text-gray-500">{total} total incidents</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-2xl font-bold">{automationRate}%</span>
            </div>
            <div className="text-xs text-gray-500">automated</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Success Rate</span>
            <span className="font-bold">{successRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="flex h-full">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500" 
                style={{ width: `${(selfHealed / total) * 100}%` }}
              />
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500" 
                style={{ width: `${(escalated / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-700">{selfHealed}</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Self-healed
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-2xl font-bold text-amber-700">{escalated}</div>
            <div className="text-xs text-amber-600 mt-1 flex items-center justify-center gap-1">
              <ArrowRight className="w-3 h-3" />
              Escalated
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-2xl font-bold text-red-600">{failed}</div>
            <div className="text-xs text-red-600 mt-1 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Failed
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


