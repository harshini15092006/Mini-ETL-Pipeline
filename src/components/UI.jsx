// ============================================================
// components/UI.jsx
// Shared reusable UI building blocks
// ============================================================

import React from 'react';

// ── Badge (numbered icon) ─────────────────────────────────────
export function Badge({ num, color = 'cyan' }) {
  return <span className={`badge badge-${color}`}>{num}</span>;
}

// ── Colored tag pill ──────────────────────────────────────────
export function Tag({ color = 'cyan', children }) {
  return <span className={`tag tag-${color}`}>{children}</span>;
}

// ── Alert box ─────────────────────────────────────────────────
export function Alert({ type = 'cyan', icon, children }) {
  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">{icon}</span>
      <div className="alert-content">{children}</div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────
export function ProgressBar({ value, color = 'cyan', label }) {
  return (
    <div className="progress-wrap">
      {label && (
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          <span className={`progress-value tag-${color}`} style={{ color: `var(--${color})` }}>
            {Math.round(value)}%
          </span>
        </div>
      )}
      <div className="progress-track">
        <div className={`progress-bar ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
export function StatCard({ icon, value, label, color = 'cyan' }) {
  return (
    <div className={`stat-card ${color} animate-fade-in-up`}>
      <span className="stat-icon">{icon}</span>
      <div>
        <div className="stat-num">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className="stat-lbl">{label}</div>
      </div>
    </div>
  );
}

// ── Checkbox row ──────────────────────────────────────────────
export function Checkbox({ checked, onChange, label, hint }) {
  return (
    <div className="checkbox-row" onClick={() => onChange(!checked)}>
      <div className={`checkbox-box ${checked ? 'checked' : ''}`}>
        {checked && <span className="checkbox-check">✓</span>}
      </div>
      <div>
        <div className="checkbox-label">{label}</div>
        {hint && <div className="checkbox-hint">{hint}</div>}
      </div>
    </div>
  );
}

// ── Radio option ──────────────────────────────────────────────
export function Radio({ checked, onChange, label }) {
  return (
    <div className="radio-row" onClick={onChange}>
      <div className={`radio-dot ${checked ? 'checked' : ''}`}>
        {checked && <div className="radio-inner" />}
      </div>
      <span>{label}</span>
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────────
export function Spinner({ dark = false }) {
  return <div className={`spinner ${dark ? 'dark' : ''}`} />;
}

// ── Theme toggle button ───────────────────────────────────────
export function ThemeToggle({ dark, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} title="Toggle dark/light mode">
      {dark ? '☀️' : '🌙'}
    </button>
  );
}

// ── Section title row ─────────────────────────────────────────
export function SectionTitle({ badge, color = 'cyan', children, right }) {
  return (
    <div className="section-title">
      <Badge num={badge} color={color} />
      {children}
      {right && <div className="section-title-right">{right}</div>}
    </div>
  );
}

// ── Inner card wrapper ────────────────────────────────────────
export function InnerCard({ children, style }) {
  return <div className="inner-card" style={style}>{children}</div>;
}

// ── Format selector card ──────────────────────────────────────
export function FormatCard({ id, icon, label, desc, selected, onSelect }) {
  return (
    <div className={`format-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(id)}>
      <span className="format-icon">{icon}</span>
      <div>
        <div className="format-label">{label}</div>
        <div className="format-desc">{desc}</div>
      </div>
      {selected && <span className="format-check">✓</span>}
    </div>
  );
}

// ── Code preview block ────────────────────────────────────────
export function CodePreview({ code, label }) {
  return (
    <div>
      {label && (
        <div className="form-label" style={{ marginBottom: 6 }}>{label}</div>
      )}
      <pre className="code-preview">{code}</pre>
    </div>
  );
}

// ── Empty state placeholder ───────────────────────────────────
export function EmptyState({ icon, message }) {
  return (
    <div
      className="inner-card animate-fade-in"
      style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text3)' }}
    >
      <div style={{ fontSize: '2.25rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: '0.875rem' }}>{message}</div>
    </div>
  );
}
