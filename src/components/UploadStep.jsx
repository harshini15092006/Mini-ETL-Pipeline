// ============================================================
// components/UploadStep.jsx
// Step 1 — Multi-file drag-drop upload with parsing
// ============================================================

import React, { useState, useCallback, useRef } from 'react';
import { parseFile, formatBytes } from '../utils/dataUtils';
import { Alert, ProgressBar, Tag, SectionTitle, StatCard } from './UI';

const ALLOWED_EXT = ['csv', 'tsv', 'json', 'xlsx', 'xls'];
const FORMAT_COLORS = { csv: 'cyan', tsv: 'violet', json: 'amber', xlsx: 'green', xls: 'green' };

export function UploadStep({ files, setFiles, datasets, setDatasets }) {
  const [dragging, setDragging]   = useState(false);
  const [errors, setErrors]       = useState([]);
  const [progress, setProgress]   = useState({});
  const inputRef = useRef();

  /* ── File handler ────────────────────────────────────────── */
  const handleNewFiles = useCallback(async (newFiles) => {
    const valid = [], errs = [];
    setErrors([]);

    Array.from(newFiles).forEach(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      // Duplicate check
      if (files.some(ex => ex.name === f.name)) {
        errs.push(`"${f.name}" is already uploaded.`);
        return;
      }
      if (!ALLOWED_EXT.includes(ext)) {
        errs.push(`"${f.name}" — unsupported format (.${ext}). Accepted: CSV, TSV, JSON, XLSX.`);
        return;
      }
      valid.push(f);
    });

    if (errs.length) setErrors(errs);
    if (!valid.length) return;

    // Add files immediately (shows chip)
    setFiles(prev => [...prev, ...valid]);

    // Parse each file
    for (const file of valid) {
      setProgress(p => ({ ...p, [file.name]: 10 }));
      try {
        // Simulate slight delay for UX
        await new Promise(r => setTimeout(r, 150));
        setProgress(p => ({ ...p, [file.name]: 50 }));
        const data = await parseFile(file);
        setProgress(p => ({ ...p, [file.name]: 100 }));
        setDatasets(prev => ({
          ...prev,
          [file.name]: {
            name: file.name,
            data,
            cols: data.length ? Object.keys(data[0]) : [],
            rows: data.length,
          },
        }));
      } catch (err) {
        setProgress(p => ({ ...p, [file.name]: -1 }));
        setErrors(prev => [...prev, `Failed to parse "${file.name}": ${err.message}`]);
      }
    }
  }, [files, setFiles, setDatasets]);

  /* ── Drag events ─────────────────────────────────────────── */
  const onDragOver  = e => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop      = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    handleNewFiles(e.dataTransfer.files);
  }, [handleNewFiles]);

  /* ── Remove file ─────────────────────────────────────────── */
  const removeFile = name => {
    setFiles(f => f.filter(x => x.name !== name));
    setDatasets(d => { const n = { ...d }; delete n[name]; return n; });
    setProgress(p => { const n = { ...p }; delete n[name]; return n; });
  };

  /* ── Totals ──────────────────────────────────────────────── */
  const totalRows = Object.values(datasets).reduce((s, d) => s + d.rows, 0);
  const totalCols = new Set(Object.values(datasets).flatMap(d => d.cols)).size;

  return (
    <div className="animate-fade-in-up">
      <SectionTitle badge="1" color="cyan" right={
        files.length > 0 && <Tag color="cyan">{files.length} files</Tag>
      }>
        File Upload
      </SectionTitle>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
      >
        <span className="drop-zone-icon">{dragging ? '🎯' : '📂'}</span>
        <div className="drop-zone-title">
          {dragging ? 'Release to upload' : 'Drag & Drop files here, or click to browse'}
        </div>
        <div className="drop-zone-hint" style={{ marginTop: 8 }}>
          Supported:&nbsp;
          {['CSV', 'TSV', 'JSON', 'XLSX'].map(f => (
            <Tag key={f} color={FORMAT_COLORS[f.toLowerCase()]}>{f}</Tag>
          ))}
          &nbsp;· Multiple files allowed
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".csv,.tsv,.json,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={e => handleNewFiles(e.target.files)}
        />
      </div>

      {/* Errors */}
      {errors.map((err, i) => (
        <Alert key={i} type="red" icon="⚠️">
          <strong>Error:</strong> {err}
        </Alert>
      ))}

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <div className="form-label" style={{ marginBottom: 10 }}>Uploaded Files</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.25rem' }}>
            {files.map(f => {
              const ext = f.name.split('.').pop().toLowerCase();
              const pct = progress[f.name] ?? 0;
              const failed = pct === -1;
              return (
                <div key={f.name}>
                  <div className="file-chip">
                    <Tag color={FORMAT_COLORS[ext] || 'muted'}>.{ext}</Tag>
                    <span className="file-chip-name">{f.name}</span>
                    <span className="file-chip-size">{formatBytes(f.size)}</span>
                    {pct === 100 && <span style={{ color: 'var(--green)', fontSize: '0.9rem' }}>✓</span>}
                    {failed && <span style={{ color: 'var(--red)', fontSize: '0.85rem' }}>✕</span>}
                    <button className="file-chip-remove" onClick={e => { e.stopPropagation(); removeFile(f.name); }}>×</button>
                  </div>
                  {pct > 0 && pct < 100 && !failed && (
                    <div style={{ marginTop: 4, width: 240 }}>
                      <ProgressBar value={pct} color={FORMAT_COLORS[ext] || 'cyan'} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary stats */}
          {Object.keys(datasets).length > 0 && (
            <>
              <div className="form-label" style={{ marginBottom: 10 }}>Parse Summary</div>
              <div className="grid-4 stagger">
                <StatCard icon="📁" label="Files parsed" value={Object.keys(datasets).length} color="cyan" />
                <StatCard icon="📋" label="Total rows"   value={totalRows} color="violet" />
                <StatCard icon="🔷" label="Unique cols"  value={totalCols} color="amber" />
                <StatCard icon="💾" label="Total size"
                  value={formatBytes(files.reduce((s, f) => s + f.size, 0))} color="green" />
              </div>

              {/* Per-file cards */}
              <div style={{ marginTop: '1.25rem' }}>
                <div className="form-label" style={{ marginBottom: 10 }}>File Details</div>
                <div className="grid-auto stagger">
                  {Object.values(datasets).map(ds => (
                    <div key={ds.name} className="inner-card animate-fade-in-up"
                      style={{ borderLeft: `3px solid var(--cyan)` }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--text3)', marginBottom: 6,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ds.name}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--cyan)', fontFamily: 'var(--mono)', lineHeight: 1 }}>
                        {ds.rows.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 3 }}>
                        rows · {ds.cols.length} cols
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
