// ============================================================
// components/DownloadStep.jsx
// Step 5 — Format selection and download
// ============================================================

import React, { useState, useMemo } from 'react';
import { downloadData, buildPreview } from '../utils/dataUtils';
import { Alert, FormatCard, CodePreview, SectionTitle, Tag, StatCard, Spinner } from './UI';

const FORMATS = [
  { id: 'csv',  icon: '📄', label: 'CSV',   desc: 'Comma-separated values (.csv)' },
  { id: 'tsv',  icon: '📋', label: 'TSV',   desc: 'Tab-separated values (.tsv)' },
  { id: 'json', icon: '📦', label: 'JSON',  desc: 'JavaScript Object Notation (.json)' },
  { id: 'xlsx', icon: '📊', label: 'Excel', desc: 'Microsoft Excel workbook (.xlsx)' },
];

export function DownloadStep({ cleanData, mergedData }) {
  const [format, setFormat]       = useState('csv');
  const [downloading, setDl]      = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const data = cleanData.length ? cleanData : mergedData;

  const preview = useMemo(() => {
    if (!data.length) return '';
    return buildPreview(data, format === 'xlsx' ? 'csv' : format, 3);
  }, [data, format]);

  const metaCols = new Set(['__id', '__source']);
  const cols = data.length ? Object.keys(data[0]).filter(k => !metaCols.has(k)) : [];

  const handleDownload = async () => {
    if (!data.length) return;
    setDl(true);
    setDownloaded(false);
    await new Promise(r => setTimeout(r, 500));
    downloadData(data, format);
    setDl(false);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  return (
    <div className="animate-fade-in-up">
      <SectionTitle badge="5" color="green">
        Download Clean Data
      </SectionTitle>

      {!data.length ? (
        <Alert type="amber" icon="💾">
          Process your data through the previous steps first, then return here to download.
        </Alert>
      ) : (
        <>
          {/* Dataset summary */}
          <Alert type={cleanData.length ? 'green' : 'cyan'} icon={cleanData.length ? '✅' : 'ℹ️'}>
            <strong>{data.length.toLocaleString()} rows</strong>, {cols.length} columns ready.&nbsp;
            {cleanData.length
              ? 'Using quality-processed clean dataset.'
              : 'Using merged (unprocessed) dataset. Run quality processing in Step 3 for best results.'
            }
          </Alert>

          {/* Summary stats */}
          <div className="grid-4 stagger" style={{ marginBottom: '1.5rem' }}>
            <StatCard icon="📋" label="Total rows"    value={data.length.toLocaleString()} color="cyan" />
            <StatCard icon="🔷" label="Columns"       value={cols.length}                 color="violet" />
            <StatCard icon="📁" label="Output format" value={format.toUpperCase()}         color="amber" />
            <StatCard icon="✅" label="Dataset"
              value={cleanData.length ? 'Cleaned' : 'Merged'}
              color={cleanData.length ? 'green' : 'amber'} />
          </div>

          {/* Format selection */}
          <div className="form-label" style={{ marginBottom: 10 }}>Select Output Format</div>
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            {FORMATS.map(f => (
              <FormatCard
                key={f.id}
                {...f}
                selected={format === f.id}
                onSelect={setFormat}
              />
            ))}
          </div>

          {/* Output preview */}
          {format !== 'xlsx' ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <CodePreview
                label={`Preview · ${format.toUpperCase()} output (first 3 rows)`}
                code={preview}
              />
            </div>
          ) : (
            <div className="inner-card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text2)' }}>
                Excel preview not available — the file will be generated on download.
              </div>
            </div>
          )}

          {/* Download button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-violet btn-lg"
              onClick={handleDownload}
              disabled={downloading}
              style={{ minWidth: 260 }}
            >
              {downloading
                ? <><Spinner /> Preparing file…</>
                : `⬇  Download as ${format.toUpperCase()}`
              }
            </button>
            {downloaded && <Tag color="green">✓ Download started!</Tag>}
          </div>

          {/* Tips */}
          <div className="inner-card" style={{ marginTop: '1.5rem' }}>
            <div className="form-label" style={{ marginBottom: 8 }}>Format Notes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['📄 CSV', 'Best for spreadsheet tools (Excel, Google Sheets). Universal compatibility.'],
                ['📋 TSV', 'Better when data contains commas. Used in bioinformatics and data pipelines.'],
                ['📦 JSON', 'Best for APIs and web applications. Preserves data types.'],
                ['📊 Excel', 'Best for sharing with non-technical users. Supports multiple sheets.'],
              ].map(([f, note]) => (
                <div key={f} style={{ display: 'flex', gap: 10, fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600, minWidth: 70, color: 'var(--text2)' }}>{f}</span>
                  <span style={{ color: 'var(--text3)' }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
