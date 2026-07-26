// src/components/Topbar.jsx
import { useState } from "react";
import api          from "../api/api";
import { useApp }   from "../context/AppContext";
import Icon         from "./Icons";
import T            from "../styles/tokens";
import { timeAgo }  from "./UI";

// ── Notification drop-down panel ─────────────────────────────────────────────

export function NotificationPanel({ notifications, onClose }) {
  const { refreshNotifs } = useApp();

  return (
    <div className="notif-panel">
      <div className="notif-header">
        <span>Notifications</span>
        <button
          onClick={async () => { await api.notifReadAll(); refreshNotifs(); }}
          style={{
            background: "none", border: "none",
            color: T.orangeL, cursor: "pointer", fontSize: "0.78rem",
          }}
        >
          Mark all read
        </button>
      </div>

      <div className="notif-list">
        {notifications.length === 0 && (
          <div style={{ padding: "30px", textAlign: "center", color: T.grayDk, fontSize: "0.85rem" }}>
            No notifications yet
          </div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`notif-item ${!n.is_read ? "unread" : ""}`}
            onClick={async () => {
              await api.notifRead(n.id);
              refreshNotifs();
              onClose();
            }}
          >
            <div className="notif-item-title">{n.notif_type.replace(/_/g, " ")}</div>
            <div className="notif-item-msg">{n.message}</div>
            {n.purchase_order && (
              <div className="notif-item-msg" style={{ color: T.orange, marginTop: 2 }}>
                PO: {n.purchase_order.po_number}
              </div>
            )}
            <div className="notif-item-time">{timeAgo(n.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

export default function Topbar({
  title,
  user,                  // user object passed from App.jsx (React state only)
  setCollapsed,
  unreadCount,
  notifications,
  onBellClick,
  showNotifPanel,
  setShowNotifPanel,
  onLogout,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initial     = (user?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}`
    : user?.email?.split("@")[0] || "User";

  return (
    <div className="topbar">

      {/* ── Left: hamburger + page title ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          className="icon-btn"
          onClick={() => setCollapsed((c) => !c)}
          title="Toggle sidebar"
        >
          <Icon.Menu />
        </button>
        <span className="topbar-title">{title}</span>
      </div>

      {/* ── Right: bell + user pill ── */}
      <div className="topbar-actions">

        {/* Bell + notification drop-down */}
        <div style={{ position: "relative" }}>
          <button className="icon-btn" onClick={onBellClick} title="Notifications">
            <Icon.Bell />
            {unreadCount > 0 && (
              <span className="badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>
          {showNotifPanel && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setShowNotifPanel(false)}
            />
          )}
        </div>

        {/* User pill → opens dropdown with profile info + logout */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowUserMenu((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "5px 12px 5px 5px", borderRadius: 99,
              background: "rgba(114,110,158,0.18)",
              cursor: "pointer", transition: "background 0.15s",
              userSelect: "none",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(241,138,78,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(114,110,158,0.18)"}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: T.orange,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "0.82rem", color: "white",
              flexShrink: 0, border: "2px solid rgba(255,255,255,0.25)",
            }}>
              {initial}
            </div>
            <span style={{
              fontSize: "0.85rem", fontWeight: 600, color: "white",
              whiteSpace: "nowrap", maxWidth: 120,
              overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {displayName}
            </span>
          </div>

          {/* User dropdown menu */}
          {showUserMenu && (
            <div
              style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "white", borderRadius: 10,
                boxShadow: "0 8px 32px rgba(33,28,90,0.18)",
                minWidth: 200, overflow: "hidden", zIndex: 300,
                animation: "slideUp 0.18s ease",
              }}
            >
              {/* Profile header */}
              <div style={{ padding: "14px 16px", background: T.navy, color: "white" }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{displayName}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 2 }}>
                  {user?.email}
                </div>
                <div style={{
                  marginTop: 6, display: "inline-block",
                  padding: "2px 8px", borderRadius: 99,
                  background: "rgba(241,138,78,0.25)",
                  fontSize: "0.7rem", fontWeight: 600,
                  color: T.orangeL, letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  {user?.role?.replace(/_/g, " ")}
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={() => { setShowUserMenu(false); onLogout(); }}
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: "0.88rem", color: T.danger,
                  fontWeight: 600, textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(231,76,60,0.06)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <Icon.Logout className="icon-sm" />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}