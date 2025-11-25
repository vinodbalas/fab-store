import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";
import { Sparkles, Lock, ArrowRight, Zap, Shield, Globe } from "lucide-react";

export default function FabStoreLogin({ onBack }) {
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#F9F7FF] via-[#EEF2FF] to-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[520px] h-[520px] bg-[rgba(155,138,255,0.25)] blur-[200px] animate-pulse" />
        <div className="absolute bottom-0 right-1/5 w-[540px] h-[540px] bg-[rgba(118,196,255,0.2)] blur-[220px] animate-pulse" style={{ animationDelay: "1.2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[780px] h-[780px] bg-[rgba(255,208,233,0.22)] blur-[240px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(114,103,255,0.07) 1px, transparent 1px),
                            linear-gradient(0deg, rgba(114,103,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl">
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="absolute -top-16 left-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#5C36C8] hover:text-white bg-white border border-[#E1DBFF] shadow-[0_8px_25px_rgba(92,54,200,0.15)] transition-all"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Store
          </motion.button>
        )}

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 text-gray-900"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E1DBFF] bg-white text-[#5C36C8] font-semibold">
                <Sparkles className="w-4 h-4 text-[#F4B000]" />
                TP.ai FAB
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Unlock every experience
                <br />
                <span className="bg-gradient-to-r from-amber-300 to-cyan-300 bg-clip-text text-transparent">
                  with one identity
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Access Cogniclaim, Assist, Collect, Banking Command, and all TP.ai solutions from a single secure login.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                { icon: Zap, text: "Instant access to all FAB solutions" },
                { icon: Shield, text: "Enterprise-grade security & compliance" },
                { icon: Globe, text: "Single sign-on across platforms" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <div className="p-2 rounded-lg border border-[#E2DEFF] bg-white text-[#5C36C8]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-[0_30px_80px_rgba(15,14,63,0.15)]">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#F5B437] to-[#6C4DE5] text-white">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Sign in to FAB</h2>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CBB7FF]/50 focus:border-[#CBB7FF]/50 transition-all"
                    placeholder="you@tp.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CBB7FF]/50 focus:border-[#CBB7FF]/50 transition-all"
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
                      className="rounded border-gray-300 text-[#5C36C8] focus:ring-[#CBB7FF]/50"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-sm text-[#5C36C8] font-semibold hover:text-[#2E0F73] transition-colors"
                    onClick={() => alert("Contact IT helpdesk to reset your password.")}
                  >
                    Forgot password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#F5B437] via-[#88EA99] to-[#3EC6F7] text-gray-900 rounded-xl py-3.5 text-sm font-semibold hover:shadow-lg hover:shadow-[#3EC6F7]/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-white/50 text-center">
                  By continuing, you agree to TP.ai policies. Unauthorized access is prohibited.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

