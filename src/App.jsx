import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { DemoModeProvider } from "./contexts/DemoModeContext";
import Layout from "./components/Layout";
import HomeDashboard from "./apps/cogniclaim/components/HomeDashboard";
import Worklist from "./apps/cogniclaim/components/Worklist";
import ExecutiveDashboard from "./apps/cogniclaim/components/ExecutiveDashboard";
import Reports from "./apps/cogniclaim/components/Reports";
import AIHub from "./apps/cogniclaim/components/AIHub";
import KnowledgeBase from "./apps/cogniclaim/components/KnowledgeBase";
import Settings from "./components/Settings";
import PitchHub from "./apps/cogniclaim/components/PitchHub";
import LoginPage from "./apps/cogniclaim/components/LoginPage";
import FabStoreLogin from "./components/FabStoreLogin";
import FabStore from "./components/FabStore";
// TP Resolve imports
import TPResolveHomeDashboard from "./apps/tp-resolve/components/HomeDashboard";
import TPResolveWorklist from "./apps/tp-resolve/components/Worklist";
import TPResolveAIHub from "./apps/tp-resolve/components/AIHub";
import TPResolveLayout from "./apps/tp-resolve/components/Layout";
// TP Lend imports
import TPLendHomeDashboard from "./apps/tp-lend/components/HomeDashboard";
import TPLendWorklist from "./apps/tp-lend/components/Worklist";
import TPLendAIHub from "./apps/tp-lend/components/AIHub";
import TPLendLayout from "./apps/tp-lend/components/Layout";
// TP Dispatch imports
import TPDispatchHomeDashboard from "./apps/tp-dispatch/components/HomeDashboard";
import TPDispatchWorklist from "./apps/tp-dispatch/components/Worklist";
import TPDispatchLayout from "./apps/tp-dispatch/components/Layout";
// TP Inventory imports
import TPInventoryHomeDashboard from "./apps/tp-inventory/components/HomeDashboard";
import TPInventoryLayout from "./apps/tp-inventory/components/Layout";
import ArchitecturePage from "./components/ArchitecturePage";

const SHOW_LEGACY_LOGIN = false;

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  // Default to FAB store, and persist it in sessionStorage to survive re-renders
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("cogniclaim.currentPage");
      return stored || "store";
    }
    return "store";
  });
  const [showFabLogin, setShowFabLogin] = useState(false);

  // Persist currentPage to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cogniclaim.currentPage", currentPage);
    }
  }, [currentPage]);

  // When user logs in from FAB Store, ensure they stay on the store page
  useEffect(() => {
    if (isAuthenticated) {
      const stored = sessionStorage.getItem("cogniclaim.currentPage");
      // If no stored page preference, default to store (FAB Store entry point)
      if (!stored) {
        setCurrentPage("store");
      }
    }
  }, [isAuthenticated]);

  // When logged out → show login screen
  if (!isAuthenticated) {
    if (SHOW_LEGACY_LOGIN) {
      return (
        <div className="relative min-h-screen bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center">
          <LoginPage />
        </div>
      );
    }

    if (showFabLogin) {
      return (
        <FabStoreLogin
          onBack={() => setShowFabLogin(false)}
          onLoginSuccess={() => {
            setShowFabLogin(false);
            setCurrentPage("store");
            if (typeof window !== "undefined") {
              sessionStorage.setItem("cogniclaim.currentPage", "store");
            }
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <FabStore readOnly onRequestLogin={() => setShowFabLogin(true)} />
      </div>
    );
  }

  // Determine which view to show
  const getView = () => {
    if (selectedLoan) return "lend-aihub";
    if (selectedCase) return "resolve-aihub";
    if (selectedClaim) return "aihub";
    if (selectedWorkOrder) return "dispatch-aihub";
    if (currentPage === "architecture") return "architecture";
    if (currentPage === "store") return "store";
    if (currentPage === "home") return "home";
    if (currentPage === "worklist") return "worklist";
    if (currentPage === "executive") return "executive";
    if (currentPage === "reports") return "reports";
    if (currentPage === "knowledge") return "knowledge";
    if (currentPage === "settings") return "settings";
    if (currentPage === "pitch") return "pitch";
    if (currentPage === "resolve") return "resolve-home";
    if (currentPage === "resolve/worklist") return "resolve-worklist";
    if (currentPage === "lend") return "lend-home";
    if (currentPage === "lend/worklist") return "lend-worklist";
    if (currentPage === "dispatch") return "dispatch-home";
    if (currentPage === "dispatch/worklist") return "dispatch-worklist";
    if (currentPage === "inventory") return "inventory-home";
    if (currentPage === "inventory/list") return "inventory-list";
    return "home"; // Default to home
  };

  // Authenticated flow
  const view = getView();

  // Navigation helpers (used by both FAB Store and main app shell)
  const handleNavigate = (key) => {
    setCurrentPage(key);
    setSelectedClaim(null);
    setSelectedCase(null);
    setSelectedLoan(null);
    setSelectedWorkOrder(null);
  };

  const handleLaunchApp = (targetKey) => {
    if (!targetKey) return;
    setCurrentPage(targetKey);
    setSelectedClaim(null);
    setSelectedCase(null);
    setSelectedLoan(null);
    setSelectedWorkOrder(null);
  };

  const getActiveKey = () => {
    if (selectedClaim) return "worklist";
    return currentPage;
  };

  // Special-case FAB Store: keep users on the same fullscreen store surface
  // instead of dropping them into the Cogniclaim shell.
  if (view === "store") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <FabStore onLaunch={handleLaunchApp} onNavigate={handleNavigate} />
      </div>
    );
  }

  // Architecture page - full screen
  if (view === "architecture") {
    return (
      <ArchitecturePage onBack={() => handleNavigate("store")} />
    );
  }

  // TP Resolve shell: separate layout and no Cogniclaim navigation/branding
  if (view === "resolve-home" || view === "resolve-worklist" || view === "resolve-aihub") {
    return (
      <TPResolveLayout onNavigate={handleNavigate} active={currentPage}>
        <AnimatePresence mode="wait">
          {view === "resolve-aihub" ? (
            <motion.div
              key="resolve-aihub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <TPResolveAIHub case={selectedCase} onBack={() => setSelectedCase(null)} />
            </motion.div>
          ) : view === "resolve-worklist" ? (
            <motion.div
              key="resolve-worklist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <TPResolveWorklist onSelectCase={setSelectedCase} onNavigate={handleNavigate} />
            </motion.div>
          ) : (
            <motion.div
              key="resolve-home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <TPResolveHomeDashboard onSelectCase={setSelectedCase} onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </TPResolveLayout>
    );
  }

  // TP Lend shell: separate layout and no Cogniclaim navigation/branding
  if (view === "lend-home" || view === "lend-worklist" || view === "lend-aihub") {
    return (
      <TPLendLayout onNavigate={handleNavigate} active={currentPage}>
        <AnimatePresence mode="wait">
          {view === "lend-aihub" ? (
            <motion.div
              key="lend-aihub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <TPLendAIHub loan={selectedLoan} onBack={() => setSelectedLoan(null)} />
            </motion.div>
          ) : view === "lend-worklist" ? (
            <motion.div
              key="lend-worklist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <TPLendWorklist onSelectLoan={setSelectedLoan} onNavigate={handleNavigate} />
            </motion.div>
          ) : (
            <motion.div
              key="lend-home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <TPLendHomeDashboard onSelectLoan={setSelectedLoan} onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </TPLendLayout>
    );
  }

  // TP Dispatch shell: separate layout
  if (view === "dispatch-home" || view === "dispatch-worklist" || view === "dispatch-aihub") {
    return (
      <TPDispatchLayout onNavigate={handleNavigate} active={currentPage}>
        <AnimatePresence mode="wait">
          {view === "dispatch-aihub" ? (
            <motion.div
              key="dispatch-aihub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              <TPDispatchAIHub workOrder={selectedWorkOrder} onBack={() => setSelectedWorkOrder(null)} />
            </motion.div>
          ) : view === "dispatch-worklist" ? (
            <motion.div
              key="dispatch-worklist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <TPDispatchWorklist onSelectWorkOrder={setSelectedWorkOrder} onNavigate={handleNavigate} />
            </motion.div>
          ) : (
            <motion.div
              key="dispatch-home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <TPDispatchHomeDashboard onSelectWorkOrder={setSelectedWorkOrder} onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </TPDispatchLayout>
    );
  }

  // TP Inventory shell
  if (view === "inventory-home" || view === "inventory-list") {
    return (
      <TPInventoryLayout onNavigate={handleNavigate} active={currentPage}>
        <AnimatePresence mode="wait">
          {view === "inventory-list" ? (
            <motion.div
              key="inventory-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">All Inventory Items</h1>
                <p className="text-gray-600">Full inventory list coming soon...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="inventory-home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <TPInventoryHomeDashboard onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </TPInventoryLayout>
    );
  }

  return (
    <Layout onNavigate={handleNavigate} active={getActiveKey()} currentPage={currentPage}>
      <AnimatePresence mode="wait">
        {view === "aihub" ? (
          // AI REASONING VIEW
          <motion.div
            key="aihub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <AIHub claim={selectedClaim} onBack={() => setSelectedClaim(null)} />
          </motion.div>
        ) : view === "executive" ? (
          // EXECUTIVE DASHBOARD VIEW
          <motion.div
            key="executive"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <ExecutiveDashboard onSelectClaim={setSelectedClaim} onNavigate={handleNavigate} />
          </motion.div>
        ) : view === "store" ? (
          <motion.div
            key="store"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <FabStore onLaunch={handleLaunchApp} />
          </motion.div>
        ) : view === "reports" ? (
          // REPORTS VIEW
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <Reports onNavigate={handleNavigate} />
          </motion.div>
        ) : view === "knowledge" ? (
          // KNOWLEDGE VIEW
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <KnowledgeBase onNavigate={handleNavigate} />
          </motion.div>
        ) : view === "settings" ? (
          // SETTINGS VIEW
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <Settings />
          </motion.div>
        ) : view === "pitch" ? (
          // PITCH HUB VIEW
          <motion.div
            key="pitch"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <PitchHub onNavigate={handleNavigate} />
          </motion.div>
        ) : view === "home" ? (
          // HOME DASHBOARD VIEW
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <HomeDashboard onNavigate={handleNavigate} onSelectClaim={setSelectedClaim} />
          </motion.div>
        ) : view === "worklist" ? (
          // WORKLIST VIEW
          <motion.div
            key="worklist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <Worklist onSelectClaim={setSelectedClaim} onNavigate={handleNavigate} />
          </motion.div>
        ) : view === "resolve-home" ? (
          // TP RESOLVE HOME DASHBOARD
          <motion.div
            key="resolve-home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <TPResolveHomeDashboard onSelectCase={setSelectedCase} onNavigate={handleNavigate} />
          </motion.div>
        ) : view === "resolve-worklist" ? (
          // TP RESOLVE WORKLIST
          <motion.div
            key="resolve-worklist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <TPResolveWorklist onSelectCase={setSelectedCase} onNavigate={handleNavigate} />
          </motion.div>
        ) : view === "resolve-aihub" ? (
          // TP RESOLVE AI HUB
          <motion.div
            key="resolve-aihub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <TPResolveAIHub case={selectedCase} onBack={() => setSelectedCase(null)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DemoModeProvider>
        <AppContent />
      </DemoModeProvider>
    </AuthProvider>
  );
}
