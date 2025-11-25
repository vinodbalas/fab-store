import { createContext, useContext, useMemo, useState } from "react";

const DemoModeContext = createContext(null);

export function DemoModeProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(true);

  const toggleDemoMode = () => setIsDemoMode((prev) => !prev);

  const value = useMemo(
    () => ({
      isDemoMode,
      toggleDemoMode,
    }),
    [isDemoMode]
  );

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    throw new Error("useDemoMode must be used inside DemoModeProvider");
  }
  return ctx;
}

