import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const DEFAULT_USER = {
  name: "Demo Analyst",
  email: "analyst@teleperformance.com",
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState(DEFAULT_USER);

  const login = (profile = DEFAULT_USER) => {
    setUser(profile);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
    }),
    [isAuthenticated, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}

