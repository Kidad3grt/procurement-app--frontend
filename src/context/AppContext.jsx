// src/context/AppContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

export const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // ─────────────────────────────────────────────
  // Load current user (cookie-based auth)
  // ─────────────────────────────────────────────
  const loadUser = async () => {
    try {
      const data = await api.me();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  // ─────────────────────────────────────────────
  // Notifications
  // ─────────────────────────────────────────────
  const refreshNotifs = async () => {
    try {
      const data = await api.notifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    loadUser();
    refreshNotifs();
  }, []);

  return (
    <AppCtx.Provider
      value={{
        user,
        setUser,
        notifications,
        refreshNotifs,
        reloadUser: loadUser,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

/**
 * useApp() – consume global app state
 */
export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppCtx.Provider");
  return ctx;
}