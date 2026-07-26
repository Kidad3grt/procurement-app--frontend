// src/pages/LoginPage.jsx
import { useState } from "react";
import api from "../api/api";
import { Loader } from "../components/UI";
import { DivconLogoStacked } from "../components/DivconGlobe";
import T from "../styles/tokens";

export default function LoginPage({ onLogin, onGoToRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const f = (field, val) =>
    setForm((p) => ({ ...p, [field]: val }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await api.login(form.email, form.password);

      // Backend now handles auth via cookies/JWT
      // We only pass user back to App.jsx
      onLogin(data.user);

    } catch (e) {
      setError(e?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* ── Logo ── */}
        <div className="login-logo">
          <DivconLogoStacked size={80} />
          <p style={{ marginTop: 10, fontSize: "0.85rem", color: T.grayDk }}>
            Procurement Management System
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: "rgba(231,76,60,0.08)",
            border: "1px solid rgba(231,76,60,0.3)",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 18,
            color: T.danger,
            fontSize: "0.85rem",
          }}>
            {error}
          </div>
        )}

        {/* ── Email ── */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-control"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => f("email", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoComplete="email"
          />
        </div>

        {/* ── Password ── */}
        <div className="form-group">
          <label className="form-label">Password</label>

          <div style={{ position: "relative" }}>
            <input
              className="form-control"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => f("password", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ paddingRight: 42 }}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.grayDk,
              }}
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* ── Remember Me (UI ONLY) ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20
        }}>
          <input
            type="checkbox"
            id="remember_me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{
              width: 16,
              height: 16,
              accentColor: T.orange,
              cursor: "pointer"
            }}
          />
          <label
            htmlFor="remember_me"
            style={{
              fontSize: "0.88rem",
              color: T.grayDk,
              cursor: "pointer"
            }}
          >
            Stay logged in on this device
          </label>
        </div>

        {/* ── Submit ── */}
        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Loader size={18} /> : "Sign In"}
        </button>

        {/* ── Divider ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "20px 0"
        }}>
          <div style={{ flex: 1, height: 1, background: T.gray }} />
          <span style={{ fontSize: "0.78rem", color: T.grayDk }}>
            New to DIVCON?
          </span>
          <div style={{ flex: 1, height: 1, background: T.gray }} />
        </div>

        {/* ── Register ── */}
        <button
          className="btn btn-outline"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={onGoToRegister}
        >
          Create an Account
        </button>

        {/* ── Hint ── */}
        <p style={{
          marginTop: 16,
          fontSize: "0.74rem",
          color: T.grayMd,
          textAlign: "center"
        }}>
          {rememberMe
            ? "Session persists on this device (handled by backend)."
            : "Session ends when you close the browser."}
        </p>

      </div>
    </div>
  );
}