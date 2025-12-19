import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "./Sidebar";
import RoleSwitcher from "./RoleSwitcher";

const TP_LOGO = "/tp-logo.svg";
const AVATAR_DEFAULT = "/vkv.jpeg";

/**
 * Generic solution layout for SOP Executor–based applications.
 *
 * Shared shell (header, user menu, sidebar, footer) with configurable:
 * - productName: e.g. "Cogniclaim", "TP Resolve"
 * - tagline: e.g. "AI-Powered Claims Intelligence"
 * - navItems: array of { key, label, icon }
 * - storageKey: prefix for theme settings (e.g. "cogniclaim", "tp-resolve")
 */
export default function SolutionLayout({
  children,
  onNavigate,
  active,
  productName,
  tagline,
  navItems,
  storageKey = "app",
  footerText = "Powered by Teleperformance • SOP Executor",
  showSettings = true,
  extraHeaderRight = null,
}) {
  const { user, logout } = usePageAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useDarkMode(`${storageKey}.darkMode`);
  const menuRef = useRef(null);

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
      <header className="fixed top-0 left-0 right-0 h-[68px] bg-gradient-to-r from-[#4C2A9B] via-[#7B3FE4] to-[#C26BFF] text-white flex items-center justify-between px-4 sm:px-8 shadow-2xl z-50 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <img src={TP_LOGO} alt="Teleperformance" className="w-7 h-7 object-contain" />
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight">
              {productName}
            </h1>
            {tagline && (
              <span className="text-[11px] sm:text-[12px] uppercase tracking-[0.2em] font-semibold text-white/85 hidden md:inline-block">
                {tagline}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Optional extra controls (e.g., Back to Store) */}
          {extraHeaderRight}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-2xl transition-all border border-white/40 bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/20"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
          </button>

          <div className="flex items-center gap-3" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors shadow-lg"
              title={user?.name || "Vinod Kumar V"}
            >
              <img
                src={user?.avatar || AVATAR_DEFAULT}
                alt={user?.name || "User"}
                className="w-full h-full rounded-full object-cover ring-2 ring-white/50"
              />
              <ChevronDown
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-gray-600 bg-white rounded-full border-2 border-white shadow-sm transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-4 top-16 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={user?.avatar || AVATAR_DEFAULT}
                      alt={user?.name || "User"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user?.name || "Vinod Kumar V"}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                      )}
                    </div>
                  </div>
                  {user?.role && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Role:</span>
                      <span className="text-xs text-[#612D91] dark:text-[#A64AC9] font-semibold capitalize px-2 py-0.5 rounded-full bg-[#612D91]/10 dark:bg-[#A64AC9]/20">
                        {user.role}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                  <RoleSwitcher />
                </div>
                <div className="px-4 py-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-[68px] overflow-hidden">
        <Sidebar
          onNavigate={onNavigate}
          active={active}
          navItems={navItems}
          showSettings={showSettings}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 min-h-0">
            {children}
          </main>
          <footer className="shrink-0 text-xs text-gray-500 dark:text-gray-400 py-3 px-6 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
            {footerText}
          </footer>
        </div>
      </div>
    </div>
  );
}

function useDarkMode(storageKey) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const isDark = stored === "true";
        if (isDark) document.body.classList.add("dark");
        else document.body.classList.remove("dark");
        return isDark;
      }
      const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefers) document.body.classList.add("dark");
      return prefers;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem(storageKey, "true");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem(storageKey, "false");
    }
  }, [darkMode, storageKey]);

  return [darkMode, setDarkMode];
}

function usePageAuth() {
  const auth = useAuth();
  return auth;
}


