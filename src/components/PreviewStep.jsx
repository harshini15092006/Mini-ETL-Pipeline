// ============================================================
// components/PreviewStep.jsx
// Step 4 — Data table with search, sort, pagination, highlights
// ============================================================

import React, { useState, useMemo } from 'react';
import { Alert, Tag, SectionTitle, EmptyState } from './UI';

const PAGE_SIZE = 10;
const META_COLS = new Set(['__id', '__source']);

const CELL_CLASSES = {
  filled:  'cell-filled',
  trimmed: 'cell-trimmed',
  cased:   'cell-cased',
  typed:   'cell-typed',
  invalid: 'cell-invalid',
};

export function PreviewStep({ cleanData, mergedData, corrections }) {
  const [search, setSearch]     = useState('');
  const [sortCol, setSortCol]   = useState(null);
  const [sortAsc, setSortAsc]   = useState(true);
  const [page, setPage]         = useState(0);

  const data = cleanData.length ? cleanData : mergedData;
  const cols = useMemo(
    () => Object.keys(data[0] || {}).filter(k => !META_COLS.has(k)),
    [data]
  );

  /* ── Filtered + sorted data ─────────────────────────────── */
  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(row => cols.some(c => String(row[c] ?? '').toLowerCase().includes(q)));
    }
    if (sortCol) {
      rows = [...rows].sort((a, b) => {
        let va = a[sortCol], vb = b[sortCol];
        if (va === vb) return 0;
        const cmp = va < vb ? -1 : 1;
        return sortAsc ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, sortCol, sortAsc, cols]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  /* ── Sort toggle ────────────────────────────────────────── */
  const toggleSort = col => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
    setPage(0);
  };

  /* ── Cell correction class ──────────────────────────────── */
  const getCellClass = (row, col) => {
    if (!corrections) return '';
    // Find the original index in the data array
    const realIdx = data.indexOf(row);
    const key = `${realIdx}_${col}`;
    return CELL_CLASSES[corrections[key]] || '';
  };

  /* ── Pagination helpers ─────────────────────────────────── */
  const getPageNums = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
      return pages;
    }
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    for (let i = start; i < Math.min(start + 5, totalPages); i++) pages.push(i);
    return pages;
  };

  if (!data.length) {
    return (
      <div className="animate-fade-in-up">
        <SectionTitle badge="4" color="green">Data Preview</SectionTitle>
        <Alert type="amber" icon="📊">
          Upload and merge data first. After running quality processing, the cleaned data will appear here.
        </Alert>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <SectionTitle badge="4" color="green"
        right={
          <div style={{ display: 'flex', gap: 6 }}>
            <Tag color="cyan">{data.length.toLocaleString()} rows</Tag>
            <Tag color="violet">{cols.length} cols</Tag>
            {cleanData.length > 0 && <Tag color="green">✓ Cleaned</Tag>}
            {cleanData.length === 0 && mergedData.length > 0 && <Tag color="amber">Merged (raw)</Tag>}
          </div>
        }
      >
        Data Preview
      </SectionTitle>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text3)', pointerEvents: 'none' }}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search across all columns…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        {sortCol && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSortCol(null); }}>
            Sorted by: {sortCol} {sortAsc ? '↑' : '↓'} ×
          </button>
        )}
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text3)', marginLeft: 'auto' }}>
          {filtered.length !== data.length
            ? `${filtered.length.toLocaleString()} of ${data.length.toLocaleString()} rows`
            : `${data.length.toLocaleString()} rows`
          }
        </span>
      </div>

      {/* Correction legend */}
      {corrections && Object.keys(corrections).length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Highlights:</span>
          <Tag color="amber">Null filled</Tag>
          <Tag color="violet">Whitespace trimmed</Tag>
          <Tag color="cyan">Case standardized</Tag>
          <Tag color="green">Type coerced</Tag>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {cols.map(col => (
                <th key={col} onClick={() => toggleSort(col)}>
                  {col}
                  {sortCol === col
                    ? <span style={{ marginLeft: 4 }}>{sortAsc ? ' ↑' : ' ↓'}</span>
                    : <span style={{ marginLeft: 4, opacity: 0.3 }}>⇅</span>
                  }
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} style={{ textAlign: 'center', padding: '2.5rem',
                  color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
                  No rows match "{search}"
                </td>
              </tr>
            ) : (
              pageRows.map((row, ri) => (
                <tr key={row.__id ?? ri}>
                  {cols.map(col => (
                    <td key={col} className={getCellClass(row, col)} title={String(row[col] ?? '')}>
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span className="pagination-info">
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}&nbsp;
          of {filtered.length.toLocaleString()} rows
        </span>
        <div className="pagination-btns">
          <button className="page-btn" disabled={page === 0} onClick={() => setPage(0)}>«</button>
          <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
          {getPageNums().map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
              {p + 1}
            </button>
          ))}
          <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
          <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>»</button>
        </div>
      </div>
    </div>
  );
}
