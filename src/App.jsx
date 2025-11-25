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

const SHOW_LEGACY_LOGIN = false;

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [selectedClaim, setSelectedClaim] = useState(null);
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
      return <FabStoreLogin onBack={() => setShowFabLogin(false)} />;
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <FabStore readOnly onRequestLogin={() => setShowFabLogin(true)} />
      </div>
    );
  }

  // Handle navigation
  const handleNavigate = (key) => {
    setCurrentPage(key);
    setSelectedClaim(null);
  };

  const handleLaunchApp = (targetKey) => {
    if (!targetKey) return;
    setCurrentPage(targetKey);
  };

  // Determine active sidebar item
  const getActiveKey = () => {
    if (selectedClaim) return "worklist";
    return currentPage;
  };

  // Determine which view to show
  const getView = () => {
    if (selectedClaim) return "aihub";
    if (currentPage === "store") return "store";
    if (currentPage === "home") return "home";
    if (currentPage === "worklist") return "worklist";
    if (currentPage === "executive") return "executive";
    if (currentPage === "reports") return "reports";
    if (currentPage === "knowledge") return "knowledge";
    if (currentPage === "settings") return "settings";
    if (currentPage === "pitch") return "pitch";
    return "home"; // Default to home
  };

  // Authenticated flow
  const view = getView();
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
