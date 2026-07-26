// src/components/UI.jsx
// Reusable UI primitives shared across all pages and components.

import { useState, useEffect } from "react";
import Icon from "./Icons";

// ── Formatters ──────────────────────────────────────────────────────────────

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function formatCurrency(amount, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(amount || 0);
}

export function timeAgo(d) {
  if (!d) return "";
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return formatDate(d);
}

// ── StatusBadge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }) {
  const labels = {
    DRAFT:              "Draft",
    SUBMITTED:          "Submitted",
    CHANGES_REQUESTED:  "Changes Requested",
    APPROVED:           "Approved",
    REJECTED:           "Rejected",
    SAVED_TO_DB:        "Saved to DB",
  };
  return (
    <span className={`status-badge status-${status}`}>
      {labels[status] || status}
    </span>
  );
}

// ── Loader ──────────────────────────────────────────────────────────────────

export function Loader({ size = 22 }) {
  return <div className="loader" style={{ width: size, height: size }} />;
}

// ── EmptyState ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, message }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon || "📋"}</div>
      <h3>{title}</h3>
      <p style={{ fontSize: "0.85rem" }}>{message}</p>
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children, size, footer }) {
  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal ${size === "lg" ? "modal-lg" : ""}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="icon-btn"
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Icon.X />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Toast system ────────────────────────────────────────────────────────────
// toast() is a module-level function so it can be called from anywhere
// (api layer, hooks, page components) without needing React context.

let _toastSetter = null;

export function toast(msg, type = "info") {
  if (_toastSetter) {
    _toastSetter((prev) => [...prev, { id: Date.now(), msg, type }]);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _toastSetter = setToasts;   // wire the module-level setter on every render

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts((p) => p.slice(1)), 3500);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button
            onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
          >
            <Icon.X />
          </button>
        </div>
      ))}
    </div>
  );
}