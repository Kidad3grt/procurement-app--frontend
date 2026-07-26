// App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Clean architecture version (COOKIE + JWT backend controlled auth)
//
// ❌ Removed:
// - tokenStorage
// - sessionStorage/localStorage auth logic
// - manual session restore
// - restoreSession()
// - hybrid auth hacks
//
// ✅ Now uses:
// - api.me() for user identity
// - cookie-based authentication
// - backend-controlled JWT session
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

// Styles
import GLOBAL_CSS from "./styles/globalStyles";

// API + WebSocket
import api from "./api/api";
import useWebSocket from "./hooks/useWebSocket";

// Context
import { AppCtx } from "./context/AppContext";

// UI Components
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ToastContainer, toast } from "./components/UI";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import CreatePOPage from "./pages/CreatePOPage";
import MyPOsPage from "./pages/MyPOsPage";
import ReviewPOsPage from "./pages/ReviewPOsPage";
import POHistoryPage from "./pages/POHistoryPage";
import NotificationsPage from "./pages/NotificationsPage";
import ManageUsersPage from "./pages/ManageUsersPage";

// ─────────────────────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  home: "Home",
  dashboard: "Dashboard",
  notifications: "Notifications",
  "create-po": "Create Purchase Order",
  "my-pos": "My Purchase Orders",
  history: "PO History",
  "review-pos": "Review Purchase Orders",
  "all-pos": "All Purchase Orders",
  "manage-users": "Manage Users",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {

  // ── Auth state (backend is source of truth) ───────────────────────────────
  const [user, setUser] = useState(null);

  // ── Routing ───────────────────────────────────────────────────────────────
  const [page, setPage] = useState("home");
  const [activePO, setActivePO] = useState(null);

  // ── Layout ────────────────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Inject global CSS once ────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("divcon-styles")) return;
    const style = document.createElement("style");
    style.id = "divcon-styles";
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }, []);

  // ── Load authenticated user (cookie-based) ────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const data = await api.me();
        if (mounted) setUser(data);
      } catch {
        if (mounted) setUser(null);
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // ── Notifications fetcher ─────────────────────────────────────────────────
  const refreshNotifs = useCallback(async () => {
    try {
      const [data, count] = await Promise.all([
        api.notifications(),
        api.notifCount(),
      ]);

      setNotifications(data.results || data);
      setUnreadCount(count.count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) refreshNotifs();
  }, [user, refreshNotifs]);

  // ── Poll fallback ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const id = setInterval(() => {
      api.notifCount()
        .then((d) => setUnreadCount(d.count || 0))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(id);
  }, [user]);

  // ── WebSocket notifications ───────────────────────────────────────────────
  const handleWSNotification = useCallback((data) => {
    setUnreadCount((c) => c + 1);

    setNotifications((prev) => [
      {
        id: data.id,
        notif_type: data.notif_type,
        message: data.message,
        is_read: false,
        created_at: data.created_at,
        purchase_order: data.po_id
          ? { id: data.po_id, po_number: data.po_number }
          : null,
      },
      ...prev,
    ]);

    const preview = data.message?.slice(0, 80) ?? "";
    toast(preview + (data.message?.length > 80 ? "…" : ""), "info");
  }, []);

  useWebSocket(user?.id, handleWSNotification);

  // ── Auth view ─────────────────────────────────────────────────────────────
  const [authView, setAuthView] = useState("login");

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = (userData) => {
    setUser(userData);
    setAuthView("login");
    setPage("home");
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}

    setUser(null);
    setPage("home");
    setNotifications([]);
    setUnreadCount(0);
  };

  // ── Navigation helper ─────────────────────────────────────────────────────
  const navigate = (target) => {
    if (target !== "create-po") setActivePO(null);
    setPage(target);
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        {authView === "register" ? (
          <RegisterPage
            onRegistered={() => setAuthView("login")}
            onBackToLogin={() => setAuthView("login")}
          />
        ) : (
          <LoginPage
            onLogin={handleLogin}
            onGoToRegister={() => setAuthView("register")}
          />
        )}
        <ToastContainer />
      </>
    );
  }

  // ── Page title ────────────────────────────────────────────────────────────
  const title =
    page === "create-po" && activePO
      ? "Edit Purchase Order"
      : PAGE_TITLES[page] ?? "DIVCON";

  // ── Pages ─────────────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case "home":
      case "dashboard":
        return <HomePage user={user} setPage={navigate} />;

      case "create-po":
        return (
          <CreatePOPage
            editPO={activePO}
            onSaved={() => {
              setActivePO(null);
              navigate("my-pos");
            }}
          />
        );

      case "my-pos":
        return (
          <MyPOsPage
            setPage={navigate}
            setActivePO={(po) => {
              setActivePO(po);
              setPage("create-po");
            }}
          />
        );

      case "history":
      case "all-pos":
        return <POHistoryPage />;

      case "review-pos":
        return <ReviewPOsPage />;

      case "notifications":
        return (
          <NotificationsPage
            notifications={notifications}
            refresh={refreshNotifs}
          />
        );

      case "manage-users":
        return <ManageUsersPage />;

      default:
        return <HomePage user={user} setPage={navigate} />;
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <AppCtx.Provider value={{ refreshNotifs }}>
      <div style={{ display: "flex" }}>
        <Sidebar
          page={page}
          setPage={navigate}
          user={user}
          collapsed={collapsed}
        />

        <div className={`main-layout ${collapsed ? "collapsed" : ""}`}>
          <Topbar
            title={title}
            setCollapsed={setCollapsed}
            unreadCount={unreadCount}
            notifications={notifications}
            onBellClick={() => setShowNotifPanel((v) => !v)}
            showNotifPanel={showNotifPanel}
            setShowNotifPanel={setShowNotifPanel}
            onLogout={handleLogout}
          />

          <div
            className="page-content"
            onClick={() => showNotifPanel && setShowNotifPanel(false)}
          >
            {renderPage()}
          </div>
        </div>
      </div>

      <ToastContainer />
    </AppCtx.Provider>
  );
}