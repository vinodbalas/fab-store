import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Home,
  Settings,
  Sparkles,
  Store,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Monitor,
} from "lucide-react";
import { useDemoMode } from "../contexts/DemoModeContext";

const DEFAULT_NAV_ITEMS = [
  { key: "store", label: "FAB Store", icon: Store },
  { key: "home", label: "Home", icon: Home },
  { key: "worklist", label: "Worklist", icon: ClipboardList },
  { key: "executive", label: "Executive", icon: TrendingUp },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "knowledge", label: "Knowledge Base", icon: BookOpen },
  { key: "pitch", label: "Product Hub", icon: Sparkles },
];

export default function Sidebar({
  active = "home",
  onNavigate = () => {},
  navItems,
  showSettings = true,
}) {
  const [collapsed, setCollapsed] = useState(true);
  const { isDemoMode } = useDemoMode();

  const items = navItems && navItems.length ? navItems : DEFAULT_NAV_ITEMS;

  return (
    <aside
      className={`h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <button
              type="button"
              key={key}
              onClick={() => onNavigate(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                isActive
                  ? "bg-[#F5F3FF] dark:bg-[#4B2E83]/30 text-[#612D91] dark:text-[#A64AC9]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={collapsed ? label : ""}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section with Demo Mode, Settings (optional) and Collapse Toggle */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        {/* Demo Mode Toggle */}
        <button
          type="button"
          className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all group relative ${
            isDemoMode
              ? "bg-[#F5F3FF] dark:bg-[#4B2E83]/30 text-[#612D91] dark:text-[#A64AC9]"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          title={collapsed ? (isDemoMode ? "Demo Mode: Frontend" : "Demo Mode: Backend") : ""}
        >
          <div className="w-full flex items-center gap-3 px-2">
            <Monitor className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">
                {isDemoMode ? "Frontend Mode" : "Backend Mode"}
              </span>
            )}
          </div>
          
          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
              {isDemoMode ? "Demo Mode: Frontend" : "Demo Mode: Backend"}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45" />
            </div>
          )}
        </button>

        {/* Settings Button (optional) */}
        {showSettings && (
          <button
            type="button"
            onClick={() => onNavigate("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all group relative ${
              active === "settings"
                ? "bg-[#F5F3FF] dark:bg-[#4B2E83]/30 text-[#612D91] dark:text-[#A64AC9]"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={collapsed ? "Settings" : ""}
          >
            <div className="w-full flex items-center gap-3 px-2">
              <Settings className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Settings</span>}
            </div>
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                Settings
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45" />
              </div>
            )}
          </button>
        )}

        {/* Help/Support Button */}
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group relative"
          title={collapsed ? "Help & Support" : ""}
        >
          <div className="w-full flex items-center gap-3 px-2">
            <MessageSquare className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Help & Support</span>}
          </div>
          
          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
              Help & Support
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45" />
            </div>
          )}
        </button>

        {/* Collapse/Expand Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group relative"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="w-full flex items-center gap-3 px-2">
            {collapsed ? (
              <ChevronRight className="w-5 h-5 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </div>
          
          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
              Expand sidebar
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
