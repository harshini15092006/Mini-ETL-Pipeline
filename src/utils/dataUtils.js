// ============================================================
// utils/dataUtils.js
// Core ETL logic: parse, merge, quality-process, download
// ============================================================

import * as XLSX from 'xlsx';

// ── File Parsing ─────────────────────────────────────────────

/**
 * Parse a CSV or TSV file text into array of row objects.
 * @param {string} text - raw file content
 * @param {string} delimiter - ',' for CSV, '\t' for TSV
 */
export function parseDelimited(text, delimiter = ',') {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n').filter(l => l.trim());
  if (!lines.length) return [];
  const headers = splitRespectingQuotes(lines[0], delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = splitRespectingQuotes(line, delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i] !== undefined ? vals[i] : ''; });
    return row;
  });
}

/** Splits a line by delimiter but ignores delimiters inside quotes */
function splitRespectingQuotes(line, delimiter) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === delimiter && !inQuote) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur);
  return result;
}

/** Parse JSON file — accepts array or single object */
export function parseJSON(text) {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : [data];
  return arr.map(row => {
    const flat = {};
    flattenObject(row, '', flat);
    return flat;
  });
}

/** Flatten nested objects into dot-notation keys */
function flattenObject(obj, prefix, result) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      flattenObject(v, key, result);
    } else {
      result[key] = v === null || v === undefined ? '' : String(v);
    }
  }
}

/** Parse an Excel file buffer */
export function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'binary' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
}

/** Main dispatcher — parse any supported file */
export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'xlsx' || ext === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try { resolve(parseExcel(e.target.result)); }
        catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target.result;
        if (ext === 'csv')  resolve(parseDelimited(text, ','));
        else if (ext === 'tsv') resolve(parseDelimited(text, '\t'));
        else if (ext === 'json') resolve(parseJSON(text));
        else reject(new Error(`Unsupported format: .${ext}`));
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ── Merge ────────────────────────────────────────────────────

/**
 * Merge multiple datasets into one, applying optional column mapping.
 * @param {Array<{name: string, data: Array}>} datasets
 * @param {Object} colMap - { originalCol: mappedCol }
 */
export function mergeDatasets(datasets, colMap = {}) {
  if (!datasets.length) return [];

  // Collect all unique columns after mapping
  const allCols = new Set();
  datasets.forEach(ds =>
    ds.data.forEach(row =>
      Object.keys(row).forEach(k => allCols.add(colMap[k] || k))
    )
  );

  let idCounter = 0;
  return datasets.flatMap(ds =>
    ds.data.map(row => {
      const mapped = { __id: idCounter++, __source: ds.name };
      // Pre-fill all columns with empty string
      allCols.forEach(col => { if (col !== '__id' && col !== '__source') mapped[col] = ''; });
      // Apply column mapping and copy values
      Object.entries(row).forEach(([k, v]) => {
        const targetKey = colMap[k] || k;
        mapped[targetKey] = v;
      });
      return mapped;
    })
  );
}

// ── Quality Processing ────────────────────────────────────────

/**
 * Run all quality checks and transformations.
 * @param {Array} data - merged dataset rows
 * @param {Object} opts - quality options
 * @returns {{ rows, report, corrections }}
 */
export function runQuality(data, opts) {
  let rows = data.map(r => ({ ...r }));
  const report = {
    duplicates: 0,
    nullsFilled: 0,
    nullsDropped: 0,
    textCorrected: 0,
    whitespace: 0,
    typeCoercions: 0,
    invalidValues: 0,
  };
  const corrections = {}; // cellKey → 'filled'|'trimmed'|'cased'|'typed'

  const metaCols = new Set(['__id', '__source']);
  const dataCols = Object.keys(rows[0] || {}).filter(k => !metaCols.has(k));

  // ── 1. Remove duplicates ──────────────────────────────────
  if (opts.removeDuplicates) {
    const seen = new Set();
    const before = rows.length;
    rows = rows.filter(row => {
      const key = JSON.stringify(dataCols.reduce((acc, c) => { acc[c] = row[c]; return acc; }, {}));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    report.duplicates = before - rows.length;
  }

  // ── 2. Per-cell transformations ───────────────────────────
  rows = rows.map((row, ri) => {
    const newRow = { ...row };
    dataCols.forEach(col => {
      const raw = newRow[col];
      const cellKey = `${ri}_${col}`;
      const isEmpty = raw === '' || raw === null || raw === undefined;

      // Trim whitespace first
      if (!isEmpty && opts.trimWhitespace && typeof raw === 'string' && raw !== raw.trim()) {
        newRow[col] = raw.trim();
        corrections[cellKey] = 'trimmed';
        report.whitespace++;
      }

      const val = newRow[col];
      const valEmpty = val === '' || val === null || val === undefined;

      if (valEmpty) {
        if (opts.missingAction === 'fill') {
          newRow[col] = opts.fillValue !== undefined ? opts.fillValue : '';
          corrections[cellKey] = 'filled';
          report.nullsFilled++;
        }
        return; // skip further transforms for empty cells
      }

      // Standardize case
      if (opts.standardizeCase && typeof val === 'string' && /[a-zA-Z]/.test(val)) {
        let standardized = val;
        if (opts.caseFormat === 'upper') standardized = val.toUpperCase();
        else if (opts.caseFormat === 'lower') standardized = val.toLowerCase();
        else if (opts.caseFormat === 'title') {
          standardized = val.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        }
        if (standardized !== val) {
          newRow[col] = standardized;
          corrections[cellKey] = corrections[cellKey] || 'cased';
          report.textCorrected++;
        }
      }

      // Type coercion — numeric strings to numbers
      if (opts.coerceTypes && typeof val === 'string') {
        const trimmed = val.trim();
        const num = Number(trimmed);
        if (trimmed !== '' && !isNaN(num) && isFinite(num)) {
          newRow[col] = num;
          corrections[cellKey] = corrections[cellKey] || 'typed';
          report.typeCoercions++;
        }
      }

      // Validate numeric fields — flag non-numeric in numeric columns
      if (opts.validateNumeric && typeof val === 'string') {
        const num = Number(val.trim());
        if (isNaN(num) && val.trim() !== '') {
          corrections[cellKey] = 'invalid';
          report.invalidValues++;
        }
      }
    });
    return newRow;
  });

  // ── 3. Drop rows with missing values ──────────────────────
  if (opts.missingAction === 'drop') {
    const before = rows.length;
    rows = rows.filter(row =>
      dataCols.every(col => row[col] !== '' && row[col] !== null && row[col] !== undefined)
    );
    report.nullsDropped = before - rows.length;
  }

  return { rows, report, corrections };
}

// ── Helpers ────────────────────────────────────────────────────

/** Get all unique column names from datasets */
export function getColumns(datasets) {
  const all = new Set();
  datasets.forEach(ds => ds.data.forEach(row => Object.keys(row).forEach(k => all.add(k))));
  return [...all];
}

/** Get columns common to all datasets */
export function getCommonColumns(datasets) {
  if (!datasets.length) return [];
  const sets = datasets.map(d => new Set(d.data[0] ? Object.keys(d.data[0]) : []));
  return [...sets[0]].filter(col => sets.every(s => s.has(col)));
}

/** Format bytes to human-readable */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Download ───────────────────────────────────────────────────

/** Download processed data in the selected format */
export function downloadData(data, format) {
  const metaCols = new Set(['__id', '__source']);
  const cols = Object.keys(data[0] || {}).filter(k => !metaCols.has(k));
  const clean = data.map(row => Object.fromEntries(cols.map(c => [c, row[c] ?? ''])));

  switch (format) {
    case 'json': {
      const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
      triggerDownload(blob, 'cleaned_data.json');
      break;
    }
    case 'csv': {
      const text = buildDelimited(clean, cols, ',');
      triggerDownload(new Blob([text], { type: 'text/csv' }), 'cleaned_data.csv');
      break;
    }
    case 'tsv': {
      const text = buildDelimited(clean, cols, '\t');
      triggerDownload(new Blob([text], { type: 'text/tab-separated-values' }), 'cleaned_data.tsv');
      break;
    }
    case 'xlsx': {
      const ws = XLSX.utils.json_to_sheet(clean);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'CleanedData');
      XLSX.writeFile(wb, 'cleaned_data.xlsx');
      break;
    }
    default:
      console.error('Unknown format:', format);
  }
}

function buildDelimited(rows, cols, sep) {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = cols.map(escape).join(sep);
  const body = rows.map(row => cols.map(c => escape(row[c])).join(sep));
  return [header, ...body].join('\n');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Build a short output preview string */
export function buildPreview(data, format, maxRows = 3) {
  const metaCols = new Set(['__id', '__source']);
  const cols = Object.keys(data[0] || {}).filter(k => !metaCols.has(k));
  const sample = data.slice(0, maxRows).map(row => Object.fromEntries(cols.map(c => [c, row[c] ?? ''])));

  if (format === 'json') {
    return JSON.stringify(sample, null, 2);
  } else {
    const sep = format === 'tsv' ? '\t' : ',';
    const header = cols.join(sep);
    const rows = sample.map(r => cols.map(c => `"${String(r[c] ?? '')}"`).join(sep));
    return [header, ...rows].join('\n');
  }
}
