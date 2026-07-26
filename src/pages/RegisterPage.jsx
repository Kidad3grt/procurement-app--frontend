import { useState } from "react";
import api from "../api/api";
import { Loader } from "../components/UI";
import T from "../styles/tokens";
import { DivconLogoStacked } from "../components/DivconGlobe";

// ── Inline field-level error helper ─────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p style={{ color: T.danger, fontSize: "0.78rem", marginTop: 4, marginBottom: 0 }}>
      {msg}
    </p>
  );
}

// ── Password strength meter ──────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.pass).length;
  const colors = ["", T.danger, T.warning, T.warning, T.success];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: i <= score ? colors[score] : T.gray,
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.75rem", color: colors[score] }}>
          {labels[score]}
        </span>

        <div style={{ fontSize: "0.7rem", display: "flex", gap: 10 }}>
          {checks.map((c) => (
            <span key={c.label} style={{ color: c.pass ? T.success : T.grayDk }}>
              {c.pass ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function RegisterPage({ onRegistered, onBackToLogin }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    phone_number: "",
    role: "PROCUREMENT_OFFICER",
    password: "",
    password2: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const f = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors((p) => ({ ...p, [field]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.first_name) errors.first_name = "First name required";
    if (!form.last_name) errors.last_name = "Last name required";
    if (!form.email) errors.email = "Email required";
    if (!form.password) errors.password = "Password required";
    if (form.password !== form.password2)
      errors.password2 = "Passwords do not match";
    return errors;
  };

  // ── SUBMIT (COOKIE BASED) ────────────────────────────────────────────────
  const handleSubmit = async () => {
    setServerError("");

    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // IMPORTANT: backend must set HttpOnly cookies
      await api.registerUser(
        {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim().toLowerCase(),
          department: form.department.trim(),
          phone_number: form.phone_number.trim(),
          role: form.role,
          password: form.password,
          password2: form.password2,
        },
        { withCredentials: true } // 👈 CRITICAL FOR COOKIE AUTH
      );

      setStep(2);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "Registration failed. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: "center" }}>
          <h2>Account Created 🎉</h2>
          <p>You can now sign in.</p>

          <button className="btn btn-primary" onClick={onRegistered || onBackToLogin}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── FORM ───────────────────────────────────────────────────────────────────
  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <DivconLogoStacked size={70} />
          <p>Create account</p>
        </div>

        {serverError && (
          <div style={{ color: T.danger, marginBottom: 10 }}>
            {serverError}
          </div>
        )}

        <input
          placeholder="First Name"
          value={form.first_name}
          onChange={(e) => f("first_name", e.target.value)}
        />
        <FieldError msg={fieldErrors.first_name} />

        <input
          placeholder="Last Name"
          value={form.last_name}
          onChange={(e) => f("last_name", e.target.value)}
        />
        <FieldError msg={fieldErrors.last_name} />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => f("email", e.target.value)}
        />
        <FieldError msg={fieldErrors.email} />

        <input
          placeholder="Password"
          type={showPw ? "text" : "password"}
          value={form.password}
          onChange={(e) => f("password", e.target.value)}
        />

        <input
          placeholder="Confirm Password"
          type={showPw2 ? "text" : "password"}
          value={form.password2}
          onChange={(e) => f("password2", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <FieldError msg={fieldErrors.password2} />

        <PasswordStrength password={form.password} />

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Loader size={18} /> : "Create Account"}
        </button>

        <p style={{ marginTop: 10 }}>
          Already have an account?{" "}
          <button onClick={onBackToLogin}>Sign in</button>
        </p>
      </div>
    </div>
  );
}