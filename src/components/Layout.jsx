import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useDemoMode } from "../contexts/DemoModeContext";
import Sidebar from "./Sidebar";

const TP_LOGO = "/tp-logo.svg";
const AVATAR_FALLBACK = "/kv.jpeg";

export default function Layout({ children, onNavigate, active }) {
  const { user, logout } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cogniclaim.darkMode");
      if (stored !== null) {
        const isDark = stored === "true";
        if (isDark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
        return isDark;
      }
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) document.documentElement.classList.add("dark");
      return prefersDark;
    }
    return false;
  });
  const menuRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("cogniclaim.darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("cogniclaim.darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <header className="fixed top-0 left-0 right-0 h-[68px] bg-gradient-to-r from-[#4C0F8A] via-[#7A1FC6] to-[#C769FF] text-white flex items-center justify-between px-4 sm:px-8 shadow-2xl z-50 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <img src={TP_LOGO} alt="Teleperformance" className="w-7 h-7 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="flex items-baseline gap-3">
              <h1 className="text-[26px] sm:text-[28px] font-extrabold tracking-tight">Cogniclaim</h1>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] font-semibold text-white/80 hidden md:block">
                AI-Powered Claims Intelligence
              </span>
            </div>
          </div>
          {isDemoMode && (
            <span className="text-[10px] uppercase ml-2 px-2 py-0.5 rounded-full bg-white/20">
              Demo mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-2xl transition-all border border-white/40 bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/20"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
          </button>

          <div className="flex items-center gap-3 relative" ref={menuRef}>
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors cursor-pointer shadow-lg"
            >
              <img
                src={user?.avatar || AVATAR_FALLBACK}
                alt={user?.name || "User"}
                className="w-9 h-9 rounded-full ring-2 ring-white/50 shadow-md object-cover"
              />
              <span className="text-sm font-semibold hidden md:block">{user?.name || "Vinod"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </div>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.name || "Vinod"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email || ""}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-[68px] overflow-hidden">
        <Sidebar onNavigate={onNavigate} active={active} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 min-h-0">{children}</main>
          <footer className="shrink-0 text-xs text-gray-500 dark:text-gray-400 py-3 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            v0.1 — Teleperformance Internal Demo Build
          </footer>
        </div>
      </div>
    </div>
  );
}

