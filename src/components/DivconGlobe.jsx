// src/components/DivconLogo.jsx
// ─────────────────────────────────────────────────────────────────────────────
// DIVCON brand logo — globe sphere with two-tone wordmark.
// "DIV" renders in orange (#F18A4E), "CON" in white.
//
// Props:
//   size      – diameter of the globe circle in px  (default: 36)
//   showText  – whether to show "DIVCON" text label beside the icon (default: true)
//   textSize  – font size of the wordmark text in rem (default: 1.15)
//   variant   – "icon"   → globe only, no text
//               "full"   → globe + wordmark side by side  (default)
//               "stacked"→ globe above wordmark (for login page)
// ─────────────────────────────────────────────────────────────────────────────

import T from "../styles/tokens";

// ── Globe SVG (the icon part only) ──────────────────────────────────────────
export function DivconGlobe({ size = 36, bgColor = T.navyDk }) {
  const r  = size / 2;        // radius
  const cx = r;
  const cy = r;

  // Latitude / longitude oval radii as fractions of the main radius
  const latRatios = [0.24, 0.55, 0.85];
  const lonRatios = [0.24, 0.55, 0.85];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ flexShrink: 0, display: "block" }}
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill={bgColor} />

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke="rgba(58,74,122,0.9)" strokeWidth={size * 0.04} />

      {/* Latitude ellipses (horizontal ovals) */}
      {latRatios.map((ratio, i) => (
        <ellipse
          key={`lat-${i}`}
          cx={cx} cy={cy}
          rx={r * 0.95}
          ry={r * ratio}
          fill="none"
          stroke="rgba(58,74,122,0.85)"
          strokeWidth={size * 0.03}
        />
      ))}

      {/* Longitude ellipses (vertical ovals) */}
      {lonRatios.map((ratio, i) => (
        <ellipse
          key={`lon-${i}`}
          cx={cx} cy={cy}
          rx={r * ratio}
          ry={r * 0.95}
          fill="none"
          stroke="rgba(58,74,122,0.85)"
          strokeWidth={size * 0.03}
        />
      ))}

      {/* Center cross lines */}
      <line
        x1={cx} y1={cy - r + 1}
        x2={cx} y2={cy + r - 1}
        stroke="rgba(58,74,122,0.85)"
        strokeWidth={size * 0.03}
      />
      <line
        x1={cx - r + 1} y1={cy}
        x2={cx + r - 1} y2={cy}
        stroke="rgba(58,74,122,0.85)"
        strokeWidth={size * 0.03}
      />

      {/* "DIVCON" text centered on globe */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize={size * 0.3}
        letterSpacing="-0.5"
      >
        <tspan fill={T.orange}>DIV</tspan>
        <tspan fill="white">CON</tspan>
      </text>
    </svg>
  );
}

// ── Full logo: globe + wordmark side by side ─────────────────────────────────
export function DivconLogoFull({ size = 36, textSize = "1.15rem" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <DivconGlobe size={size} />
      <span style={{
        fontFamily: "'Arial Black', 'Syne', sans-serif",
        fontWeight: 900,
        fontSize: textSize,
        letterSpacing: "0.04em",
        lineHeight: 1,
        userSelect: "none",
      }}>
        <span style={{ color: T.orange }}>DIV</span>
        <span style={{ color: "white" }}>CON</span>
      </span>
    </div>
  );
}

// ── Stacked logo: globe above wordmark (login page) ──────────────────────────
export function DivconLogoStacked({ size = 80 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <DivconGlobe size={size} bgColor={T.navy} />
      <span style={{
        fontFamily: "'Arial Black', 'Syne', sans-serif",
        fontWeight: 900,
        fontSize: "1.8rem",
        letterSpacing: "0.06em",
        lineHeight: 1,
        userSelect: "none",
      }}>
        <span style={{ color: T.orange }}>DIV</span>
        <span style={{ color: T.navy }}>CON</span>
      </span>
    </div>
  );
}

// Default export = icon-only globe (used in Sidebar collapsed state)
export default DivconGlobe;