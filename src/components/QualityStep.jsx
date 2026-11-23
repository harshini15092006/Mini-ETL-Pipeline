// ============================================================
// components/QualityStep.jsx
// Step 3 — Data quality checks and transformations
// ============================================================

import React, { useState } from 'react';
import { runQuality } from '../utils/dataUtils';
import { Alert, Checkbox, Radio, StatCard, ProgressBar, Spinner, SectionTitle, Tag, InnerCard, EmptyState } from './UI';

const DEFAULT_OPTS = {
  removeDuplicates: true,
  missingAction: 'fill',
  fillValue: '0',
  standardizeCase: false,
  caseFormat: 'title',
  trimWhitespace: true,
  coerceTypes: true,
  validateNumeric: false,
};

export function QualityStep({ mergedData, cleanData, setCleanData, corrections, setCorrections }) {
  const [opts, setOpts]       = useState(DEFAULT_OPTS);
  const [report, setReport]   = useState(null);
  const [running, setRunning] = useState(false);

  const setOpt = (k, v) => setOpts(o => ({ ...o, [k]: v }));

  /* ── Run quality pipeline ────────────────────────────────── */
  const handleRun = async () => {
    setRunning(true);
    setReport(null);
    await new Promise(r => setTimeout(r, 900));
    const result = runQuality(mergedData, opts);
    setCleanData(result.rows);
    setCorrections(result.corrections);
    setReport(result.report);
    setRunning(false);
  };

  if (!mergedData.length) {
    return (
      <div className="animate-fade-in-up">
        <SectionTitle badge="3" color="amber">Data Quality Processing</SectionTitle>
        <Alert type="amber" icon="🔀">Merge files in Step 2 before running quality processing.</Alert>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <SectionTitle badge="3" color="amber"
        right={report && <Tag color="green">✓ Processed</Tag>}
      >
        Data Quality Processing
      </SectionTitle>

      <div className="grid-2" style={{ gap: '1.5rem' }}>
        {/* ── Options column ─────────────────────────────── */}
        <div>
          {/* Cleanup */}
          <InnerCard style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>
              🧹 Cleanup
            </div>
            <Checkbox
              checked={opts.removeDuplicates}
              onChange={v => setOpt('removeDuplicates', v)}
              label="Remove duplicate records"
              hint="Detects and removes exact duplicate rows"
            />
            <Checkbox
              checked={opts.trimWhitespace}
              onChange={v => setOpt('trimWhitespace', v)}
              label="Trim whitespace"
              hint="Strips leading/trailing spaces from strings"
            />
            <Checkbox
              checked={opts.coerceTypes}
              onChange={v => setOpt('coerceTypes', v)}
              label="Coerce data types"
              hint="Converts numeric strings to actual numbers"
            />
            <Checkbox
              checked={opts.validateNumeric}
              onChange={v => setOpt('validateNumeric', v)}
              label="Validate numeric fields"
              hint="Flags non-numeric values in numeric columns"
            />
          </InnerCard>

          {/* Missing values */}
          <InnerCard style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>
              ❓ Handle Missing Values
            </div>
            <Radio checked={opts.missingAction === 'fill'} onChange={() => setOpt('missingAction', 'fill')}
              label="Fill with default value" />
            <Radio checked={opts.missingAction === 'drop'} onChange={() => setOpt('missingAction', 'drop')}
              label="Drop rows with missing values" />
            <Radio checked={opts.missingAction === 'keep'} onChange={() => setOpt('missingAction', 'keep')}
              label="Keep missing values as-is" />

            {opts.missingAction === 'fill' && (
              <div style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Fill value</label>
                <input
                  className="form-input"
                  placeholder="e.g. 0, N/A, Unknown"
                  value={opts.fillValue}
                  onChange={e => setOpt('fillValue', e.target.value)}
                  style={{ maxWidth: 200 }}
                />
              </div>
            )}
          </InnerCard>

          {/* Text standardization */}
          <InnerCard>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>
              🔤 Text Standardization
            </div>
            <Checkbox
              checked={opts.standardizeCase}
              onChange={v => setOpt('standardizeCase', v)}
              label="Standardize text case"
              hint="Apply consistent casing to all text fields"
            />
            {opts.standardizeCase && (
              <div style={{ marginTop: '0.65rem', marginLeft: 28 }}>
                <label className="form-label">Case format</label>
                <select
                  className="form-input form-select"
                  style={{ width: 'auto' }}
                  value={opts.caseFormat}
                  onChange={e => setOpt('caseFormat', e.target.value)}
                >
                  <option value="title">Title Case (Hello World)</option>
                  <option value="upper">UPPER CASE</option>
                  <option value="lower">lower case</option>
                </select>
              </div>
            )}
          </InnerCard>
        </div>

        {/* ── Results column ─────────────────────────────── */}
        <div>
          <button
            className="btn btn-success btn-xl"
            onClick={handleRun}
            disabled={running}
            style={{ marginBottom: '1.25rem' }}
          >
            {running ? <><Spinner /> Running Pipeline…</> : '🧹 Run Quality Processing'}
          </button>

          {/* Running progress */}
          {running && (
            <InnerCard style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.85rem', fontWeight: 500 }}>
                Processing…
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ProgressBar value={80}  color="cyan"   label="Scanning duplicates" />
                <ProgressBar value={60}  color="amber"  label="Handling missing values" />
                <ProgressBar value={45}  color="violet" label="Standardizing text" />
                <ProgressBar value={30}  color="green"  label="Coercing data types" />
              </div>
            </InnerCard>
          )}

          {/* Report */}
          {report && !running && (
            <div>
              <Alert type="green" icon="✅">
                <strong>Quality processing complete!</strong>&nbsp;
                {cleanData.length.toLocaleString()} rows in cleaned dataset.
                {Object.keys(corrections).length > 0 && (
                  <> &nbsp;·&nbsp; {Object.keys(corrections).length} cells corrected.</>
                )}
              </Alert>

              <div className="grid-2 stagger">
                <StatCard icon="🔁" label="Duplicates removed"  value={report.duplicates}      color="red" />
                <StatCard icon="🔧" label="Nulls filled"        value={report.nullsFilled}     color="amber" />
                <StatCard icon="🗑" label="Rows dropped"        value={report.nullsDropped}    color="red" />
                <StatCard icon="✏️" label="Text corrected"      value={report.textCorrected}   color="violet" />
                <StatCard icon="🔢" label="Types coerced"       value={report.typeCoercions}   color="cyan" />
                <StatCard icon="✂️" label="Whitespace trimmed"  value={report.whitespace}      color="green" />
              </div>

              {report.invalidValues > 0 && (
                <div style={{ marginTop: 10 }}>
                  <StatCard icon="⚠️" label="Invalid values flagged" value={report.invalidValues} color="amber" />
                </div>
              )}

              {/* Correction legend */}
              {Object.keys(corrections).length > 0 && (
                <InnerCard style={{ marginTop: '1rem' }}>
                  <div className="form-label" style={{ marginBottom: 8 }}>Cell Highlight Legend</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Tag color="amber">Null filled</Tag>
                    <Tag color="violet">Whitespace trimmed</Tag>
                    <Tag color="cyan">Case standardized</Tag>
                    <Tag color="green">Type coerced</Tag>
                    <Tag color="red">Invalid value</Tag>
                  </div>
                </InnerCard>
              )}
            </div>
          )}

          {!report && !running && (
            <EmptyState icon="🧪" message={'Configure options on the left\nthen click "Run Quality Processing"'} />
          )}
        </div>
      </div>
    </div>
  );
}
