// src/pages/NotificationsPage.jsx
import { useState } from "react";
import api from "../api/api";
import { StatusBadge, EmptyState, toast, timeAgo } from "../components/UI";
import Icon from "../components/Icons";
import T from "../styles/tokens";

export default function NotificationsPage({ notifications, refresh }) {
  const [filter, setFilter] = useState("all");

  const shown =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const markAllRead = async () => {
    try {
      await api.notifReadAll();
      toast("All notifications marked as read", "success");
      refresh();
    } catch {
      toast("Failed to mark notifications", "error");
    }
  };

  const markOne = async (n) => {
    if (n.is_read) return;
    try {
      await api.notifRead(n.id);
      refresh();
    } catch {}
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800 }}>
          Notifications
        </h2>
        <button className="btn btn-outline btn-sm" onClick={markAllRead}>
          <Icon.Check /> Mark All Read
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["all", "unread"].map((f) => (
          <div
            key={f}
            className={`tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{
              marginLeft: 6, borderRadius: 99, padding: "1px 7px",
              fontSize: "0.7rem", fontWeight: 700,
              background: filter === f ? T.orange : T.gray,
              color: filter === f ? "white" : T.grayDk,
            }}>
              {f === "unread"
                ? notifications.filter((n) => !n.is_read).length
                : notifications.length}
            </span>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="card">
        {shown.length === 0 && (
          <EmptyState icon="🔔" title="All caught up!" message="No notifications to show." />
        )}

        {shown.map((n) => (
          <div
            key={n.id}
            onClick={() => markOne(n)}
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${T.gray}`,
              cursor: !n.is_read ? "pointer" : "default",
              background: !n.is_read ? "rgba(241,138,78,0.04)" : "white",
              borderLeft: !n.is_read ? `3px solid ${T.orange}` : "3px solid transparent",
              transition: "background 0.15s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{
                fontSize: "0.78rem", fontWeight: 700,
                color: T.purple, textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                {n.notif_type.replace(/_/g, " ")}
              </span>
              <span style={{ fontSize: "0.75rem", color: T.grayDk }}>
                {timeAgo(n.created_at)}
              </span>
            </div>

            <div style={{ fontSize: "0.9rem", color: T.navy, lineHeight: 1.5 }}>
              {n.message}
            </div>

            {n.purchase_order && (
              <div style={{
                marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
                padding: "3px 10px", background: T.offWhite,
                borderRadius: 99, fontSize: "0.78rem", color: T.navy,
              }}>
                <Icon.File />
                <span>{n.purchase_order.po_number}</span>
                &nbsp;·&nbsp;
                <StatusBadge status={n.purchase_order.status} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}