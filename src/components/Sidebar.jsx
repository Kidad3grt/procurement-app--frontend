// src/components/Sidebar.jsx
import Icon from "./Icons";
import T from "../styles/tokens";
import { DivconGlobe, DivconLogoFull } from "./DivconGlobe";

export default function Sidebar({ page, setPage, user, collapsed }) {
  const role = user?.role;

  const navItems = [
    { id: "home",          label: "Home",          icon: <Icon.Home /> },
    { id: "dashboard",     label: "Dashboard",     icon: <Icon.Dashboard /> },
    { id: "notifications", label: "Notifications", icon: <Icon.Bell /> },
    ...(role === "PROCUREMENT_OFFICER" ? [
      { id: "create-po",    label: "Create PO",    icon: <Icon.Plus /> },
      { id: "my-pos",       label: "My POs",       icon: <Icon.File /> },
      { id: "history",      label: "PO History",   icon: <Icon.History /> },
    ] : []),
    ...(role === "MANAGERIAL_OFFICER" ? [
      { id: "review-pos",  label: "Review POs",    icon: <Icon.Eye /> },
    ] : []),
    ...(role === "SUPERUSER" ? [
      { id: "all-pos",      label: "All POs",      icon: <Icon.File /> },
      { id: "manage-users", label: "Users",        icon: <Icon.Users /> },
      { id: "history",      label: "PO History",   icon: <Icon.History /> },
    ] : []),
  ];

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}`
    : user?.email?.split("@")[0] || "User";

  const initial = (user?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        {collapsed ? (
          // Collapsed: globe icon only (wordmark hidden)
          <DivconGlobe size={36} bgColor={T.navyDk} />
        ) : (
          // Expanded: globe + "DIVCON" wordmark
          <DivconLogoFull size={36} textSize="1.2rem" />
        )}
      </div>

      {/* ── Nav ── */}
      <div className="sidebar-nav">
        {!collapsed && <div className="sidebar-section">Navigation</div>}
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            {item.icon}
            {!collapsed && <span className="nav-item-label">{item.label}</span>}
          </div>
        ))}
      </div>

      {/* ── User display (read-only — logout is in the Topbar) ── */}
      <div style={{
        padding: "14px 16px",
        borderTop: "1px solid rgba(114,110,158,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        overflow: "hidden",
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: T.orange,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "0.9rem", color: "white",
          flexShrink: 0,
          border: "2px solid rgba(255,255,255,0.2)",
        }}>
          {initial}
        </div>

        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{
              fontSize: "0.85rem", fontWeight: 600, color: "white",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {displayName}
            </div>
            <div style={{
              fontSize: "0.7rem", color: "rgba(155,152,196,0.8)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              marginTop: 1,
            }}>
              {role?.replace(/_/g, " ")}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
