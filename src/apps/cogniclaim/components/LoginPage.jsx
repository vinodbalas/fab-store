import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../auth/AuthContext";
import {
  Brain,
  Zap,
  Target,
  AlertCircle,
  Filter,
  TrendingUp,
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";

// AI Features to showcase
const aiFeatures = [
  { icon: Target, label: "Priority Queue", color: "from-indigo-500/20 to-purple-500/20" },
  { icon: AlertCircle, label: "Anomaly Detection", color: "from-red-500/20 to-orange-500/20" },
  { icon: Zap, label: "Smart Filters", color: "from-yellow-500/20 to-amber-500/20" },
  { icon: TrendingUp, label: "Predictive Analytics", color: "from-blue-500/20 to-cyan-500/20" },
  { icon: Brain, label: "AI Insights", color: "from-purple-500/20 to-pink-500/20" },
  { icon: Search, label: "Semantic Search", color: "from-green-500/20 to-emerald-500/20" },
  { icon: Sparkles, label: "Contextual Suggestions", color: "from-teal-500/20 to-cyan-500/20" },
  { icon: Filter, label: "Priority Badges", color: "from-violet-500/20 to-purple-500/20" },
];

function AnimatedFeatureFeatures() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % aiFeatures.length);
    }, 2000); // Rotate every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-32">
      <AnimatePresence mode="wait">
        {aiFeatures.map((feature, idx) => {
          if (idx !== currentIndex) return null;
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.color} border border-white/20 backdrop-blur-sm`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{feature.label}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Feature indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 mt-2">
        {aiFeatures.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-6 bg-white"
                : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email: email.trim(), password, remember });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3B0E63] via-[#4E1D84] to-[#150428] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_40px_120px_rgba(15,4,40,0.55)] overflow-hidden flex flex-col lg:flex-row min-h-[640px]">
        {/* Left brand panel with animated AI features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#612D91] via-[#7E34B0] to-[#A64AC9] text-white items-center justify-center p-14 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        </div>

        <div className="max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold tracking-tight">Cogniclaim</div>
            </div>
            <div className="mt-2 text-white/90 text-lg font-medium">SOP-Compliant Agentic AI</div>
            <div className="mt-1 text-white/70 text-sm">Multi-agent system that processes claims by your Standard Operating Procedures</div>
          </motion.div>

          {/* AI Features Grid */}
          <div className="mt-8 space-y-3">
            <AnimatedFeatureFeatures />
          </div>

          {/* Key Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 pt-6 border-t border-white/20"
          >
            <div className="text-sm text-white/90 font-medium mb-3">Key Benefits:</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Reduce claim processing time by 40% with AI-guided decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Real-time anomaly detection and priority scoring</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Intelligent SOP matching with semantic search</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

        {/* Right login card */}
        <div className="flex-1 flex items-center justify-center bg-white/95 dark:bg-gray-900/80 p-8 relative">
          <div className="absolute inset-y-10 left-0 w-px bg-gradient-to-b from-transparent via-[#E5D4F5] to-transparent opacity-70 hidden lg:block" />
          <div className="w-full max-w-md relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/tp-logo.svg" alt="Teleperformance" className="h-8" onError={(e)=>{e.currentTarget.style.display='none'}}/>
            <div className="text-2xl font-semibold text-gray-900">Teleperformance</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-xl font-semibold text-gray-900">Sign in to Cogniclaim</h1>
            <p className="text-sm text-gray-500 mt-1">Use your corporate email to continue.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A64AC9]/50"
                  placeholder="you@teleperformance.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-700">Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A64AC9]/50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-sm text-[#612D91] hover:underline"
                  onClick={() => alert("Contact IT helpdesk to reset your password.")}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white rounded-xl py-2.5 text-sm font-medium hover:shadow-lg disabled:opacity-70"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-[11px] text-gray-500">
              By continuing you agree to Teleperformance policies. Unauthorized access is prohibited.
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} Teleperformance</div>
        </div>
      </div>
      </div>
    </div>
  );
}
