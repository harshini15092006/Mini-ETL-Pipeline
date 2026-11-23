// ============================================================
// App.jsx — Root component
// Manages global state, theme, routing between steps
// ============================================================

import React, { useState, useEffect } from 'react';
import './styles/global.css';

import { Stepper }      from './components/Stepper';
import { UploadStep }   from './components/UploadStep';
import { MergeStep }    from './components/MergeStep';
import { QualityStep }  from './components/QualityStep';
import { PreviewStep }  from './components/PreviewStep';
import { DownloadStep } from './components/DownloadStep';
import { ThemeToggle, Tag } from './components/UI';

export default function App() {
  // ── Theme ──────────────────────────────────────────────────
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // ── Navigation ─────────────────────────────────────────────
  const [step, setStep] = useState(0);

  // ── Pipeline State ─────────────────────────────────────────
  const [files, setFiles]               = useState([]);       // File objects
  const [datasets, setDatasets]         = useState({});       // Parsed datasets keyed by filename
  const [mergedData, setMergedData]     = useState([]);       // Merged rows array
  const [cleanData, setCleanData]       = useState([]);       // Quality-processed rows
  const [corrections, setCorrections]   = useState({});       // Cell-level correction map

  // ── Pipeline dots for header ───────────────────────────────
  const pipelineDots = [
    { active: Object.keys(datasets).length > 0, color: 'var(--cyan)' },
    { active: mergedData.length > 0,             color: 'var(--violet)' },
    { active: cleanData.length > 0,              color: 'var(--green)' },
  ];

  return (
    <div className="app">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="header">
        <div className="header-logo">
          <div className="logo-mark">⚡</div>
          <div>
            <div className="logo-title">ETL Data Merger</div>
            <div className="logo-sub">Multi-Format · Quality Processor</div>
          </div>
        </div>

        <div className="header-right">
          {/* Live pipeline status dots */}
          <div className="pipeline-dots">
            {pipelineDots.map((d, i) => (
              <div
                key={i}
                className="pipeline-dot"
                title={['Files loaded', 'Data merged', 'Data cleaned'][i]}
                style={{
                  background: d.active ? d.color : 'var(--border2)',
                }}
              />
            ))}
          </div>

          {/* Status tags (desktop) */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.keys(datasets).length > 0 && (
              <Tag color="cyan">{Object.keys(datasets).length} files</Tag>
            )}
            {mergedData.length > 0 && (
              <Tag color="violet">{mergedData.length.toLocaleString()} merged</Tag>
            )}
            {cleanData.length > 0 && (
              <Tag color="green">{cleanData.length.toLocaleString()} cleaned</Tag>
            )}
          </div>

          <div className="divider-v" />
          <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="main">

        {/* Step bar */}
        <Stepper currentStep={step} onStepClick={setStep} />

        {/* Step content */}
        <div className="section-card">
          {step === 0 && (
            <UploadStep
              files={files}
              setFiles={setFiles}
              datasets={datasets}
              setDatasets={setDatasets}
            />
          )}
          {step === 1 && (
            <MergeStep
              datasets={datasets}
              mergedData={mergedData}
              setMergedData={setMergedData}
            />
          )}
          {step === 2 && (
            <QualityStep
              mergedData={mergedData}
              cleanData={cleanData}
              setCleanData={setCleanData}
              corrections={corrections}
              setCorrections={setCorrections}
            />
          )}
          {step === 3 && (
            <PreviewStep
              cleanData={cleanData}
              mergedData={mergedData}
              corrections={corrections}
            />
          )}
          {step === 4 && (
            <DownloadStep
              cleanData={cleanData}
              mergedData={mergedData}
            />
          )}
        </div>

        {/* Step navigation */}
        <div className="step-nav">
          <button
            className="btn btn-ghost btn-md"
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
            onClick={() => setStep(s => s - 1)}
          >
            ← Previous
          </button>
          <button
            className="btn btn-primary btn-md"
            style={{ visibility: step === 4 ? 'hidden' : 'visible' }}
            onClick={() => setStep(s => s + 1)}
          >
            Next Step →
          </button>
        </div>

      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="footer">
        Multi-Format ETL Data Merger &amp; Quality Processor&nbsp;·&nbsp;
        Supports CSV · TSV · JSON · Excel&nbsp;·&nbsp;
        Runs 100% in the browser
      </footer>

    </div>
  );
}
