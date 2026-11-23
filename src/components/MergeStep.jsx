// ============================================================
// components/MergeStep.jsx
// Step 2 — Schema detection, column mapping, merge
// ============================================================

import React, { useState, useMemo } from 'react';
import { mergeDatasets, getColumns, getCommonColumns } from '../utils/dataUtils';
import { Alert, StatCard, Tag, SectionTitle, ProgressBar, Spinner } from './UI';

export function MergeStep({ datasets, mergedData, setMergedData }) {
  const [colMap, setColMap]     = useState({});
  const [merging, setMerging]   = useState(false);
  const [done, setDone]         = useState(false);

  const datasetList = useMemo(() => Object.values(datasets), [datasets]);

  const allCols    = useMemo(() => getColumns(datasetList), [datasetList]);
  const commonCols = useMemo(() => getCommonColumns(datasetList), [datasetList]);
  const mismatched = useMemo(() => allCols.filter(c => !commonCols.includes(c)), [allCols, commonCols]);
  const hasMismatch = mismatched.length > 0;

  const totalRows = datasetList.reduce((s, d) => s + d.rows, 0);

  /* ── Merge handler ───────────────────────────────────────── */
  const handleMerge = async () => {
    setMerging(true);
    setDone(false);
    await new Promise(r => setTimeout(r, 700));
    const result = mergeDatasets(datasetList, colMap);
    setMergedData(result);
    setDone(true);
    setMerging(false);
  };

  if (!datasetList.length) {
    return (
      <div className="animate-fade-in-up">
        <SectionTitle badge="2" color="violet">Merge Configuration</SectionTitle>
        <Alert type="amber" icon="📁">
          Upload at least one file in Step 1 to configure the merge.
        </Alert>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <SectionTitle badge="2" color="violet"
        right={done && <Tag color="green">✓ Merged</Tag>}
      >
        Merge Configuration
      </SectionTitle>

      {/* Stats */}
      <div className="grid-4 stagger" style={{ marginBottom: '1.5rem' }}>
        <StatCard icon="📂" label="Files"         value={datasetList.length}   color="cyan" />
        <StatCard icon="🔷" label="Total Columns" value={allCols.length}       color="violet" />
        <StatCard icon="✅" label="Common Cols"   value={commonCols.length}    color="green" />
        <StatCard icon="📋" label="Total Rows"    value={totalRows.toLocaleString()} color="amber" />
      </div>

      {/* Schema Preview */}
      <div className="inner-card" style={{ marginBottom: '1.25rem' }}>
        <div className="form-label" style={{ marginBottom: 8 }}>Detected Schema</div>
        <div className="schema-pills">
          {allCols.map(col => (
            <Tag key={col} color={commonCols.includes(col) ? 'green' : 'amber'}>
              {col}{!commonCols.includes(col) && ' ⚠'}
            </Tag>
          ))}
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text3)' }}>
            <Tag color="green">■</Tag> Present in all files
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text3)' }}>
            <Tag color="amber">⚠</Tag> Only in some files
          </div>
        </div>
      </div>

      {/* Column Mismatch Warning */}
      {hasMismatch && (
        <Alert type="amber" icon="⚠️">
          <strong>Schema Mismatch ({mismatched.length} columns):</strong> Some files have columns that
          don't appear in all files. Map them to unified names below, or leave blank to keep as-is.
        </Alert>
      )}

      {/* Column Mapping */}
      {hasMismatch && (
        <div className="inner-card" style={{ marginBottom: '1.25rem' }}>
          <div className="form-label" style={{ marginBottom: 10 }}>
            Column Mapping&nbsp;
            <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(original → unified name)</span>
          </div>
          <div className="mapping-grid">
            {mismatched.map(col => (
              <React.Fragment key={col}>
                <div className="mapping-from">{col}</div>
                <div className="mapping-arrow">→</div>
                <input
                  className="form-input"
                  placeholder={col}
                  value={colMap[col] || ''}
                  onChange={e => setColMap(m => ({ ...m, [col]: e.target.value }))}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* File list */}
      <div className="inner-card" style={{ marginBottom: '1.5rem' }}>
        <div className="form-label" style={{ marginBottom: 10 }}>Files to Merge</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {datasetList.map((ds, i) => (
            <div key={ds.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.5rem 0', borderBottom: i < datasetList.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--text3)', minWidth: 20 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text)' }}>{ds.name}</span>
              <Tag color="cyan">{ds.rows.toLocaleString()} rows</Tag>
              <Tag color="violet">{ds.cols.length} cols</Tag>
            </div>
          ))}
        </div>
      </div>

      {/* Merge button */}
      <button className="btn btn-primary btn-xl" onClick={handleMerge} disabled={merging}
        style={{ maxWidth: 320 }}>
        {merging ? (
          <><Spinner /> Merging…</>
        ) : (
          <> ⚡ Merge {datasetList.length} Files</>
        )}
      </button>

      {/* Progress during merge */}
      {merging && (
        <div className="inner-card" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ProgressBar value={75} color="cyan"   label="Unifying schemas" />
            <ProgressBar value={50} color="violet" label="Applying column mapping" />
            <ProgressBar value={30} color="amber"  label="Concatenating rows" />
          </div>
        </div>
      )}

      {/* Success */}
      {done && !merging && (
        <Alert type="green" icon="✅" >
          <strong>Merge complete!</strong>&nbsp;
          {mergedData.length.toLocaleString()} rows merged from {datasetList.length} files into a single dataset.
        </Alert>
      )}
    </div>
  );
}
