# ⚡ Multi-Format ETL Data Merger & Quality Processor

A production-grade React frontend for merging multi-format data files (CSV, TSV, JSON, Excel)
and running a full data quality pipeline — all in the browser with zero backend required.

---

## 📁 Project Structure

```
ETL_DataMerger/
├── public/
│   └── index.html              ← HTML shell
├── src/
│   ├── index.js                ← React entry point
│   ├── App.jsx                 ← Root component (state + layout)
│   ├── styles/
│   │   └── global.css          ← Design system (CSS variables, all styles)
│   ├── components/
│   │   ├── UI.jsx              ← Shared UI primitives (Badge, Alert, StatCard…)
│   │   ├── Stepper.jsx         ← Step navigation bar
│   │   ├── UploadStep.jsx      ← Step 1: File upload & parsing
│   │   ├── MergeStep.jsx       ← Step 2: Schema detection & merge
│   │   ├── QualityStep.jsx     ← Step 3: Data quality processing
│   │   ├── PreviewStep.jsx     ← Step 4: Table preview with search/sort/pagination
│   │   └── DownloadStep.jsx    ← Step 5: Format selection & download
│   └── utils/
│       └── dataUtils.js        ← All ETL logic (parse, merge, quality, download)
├── sample-data/
│   ├── students.csv            ← Test CSV (20 rows, duplicates + nulls + casing)
│   ├── scores.json             ← Test JSON (15 rows, mixed case + nulls)
│   └── departments.tsv         ← Test TSV (10 rows, whitespace + missing values)
├── .vscode/
│   ├── settings.json           ← Editor config (format on save, emmet)
│   ├── extensions.json         ← Recommended extensions
│   └── launch.json             ← Chrome debug config
├── package.json                ← Dependencies & scripts
└── README.md                   ← This file
```

---

## 🚀 Quick Start in VS Code

### Prerequisites
- **Node.js** v16 or higher → https://nodejs.org
- **VS Code** → https://code.visualstudio.com

### Steps

**1. Open the project in VS Code**
```
File → Open Folder → select ETL_DataMerger/
```

**2. Install dependencies**

Open the integrated terminal (`Ctrl+`` ` `` ` or `View → Terminal`) and run:
```bash
npm install
```
This installs React, xlsx, papaparse, and react-scripts (~2-3 minutes first time).

**3. Start the development server**
```bash
npm start
```

The app opens automatically at **http://localhost:3000** 🎉

---

## 📦 Build for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` folder.
Deploy the `build/` folder to any static host (Netlify, Vercel, GitHub Pages).

---

## 🧩 Features

### 📂 Step 1 — File Upload
- ✅ Drag & drop or click-to-browse
- ✅ Multiple file support (mix formats freely)
- ✅ Supported: `.csv` `.tsv` `.json` `.xlsx` `.xls`
- ✅ Real-time file parsing with progress indicator
- ✅ Format validation with clear error messages
- ✅ Per-file row/column stats
- ✅ Remove individual files

### 🔀 Step 2 — Merge Configuration
- ✅ Automatic schema detection from all files
- ✅ Color-coded column overlap visualization
- ✅ Column mismatch warnings with count
- ✅ Interactive column mapping UI (rename to unify)
- ✅ Animated merge with progress bars
- ✅ Row/column count after merge

### 🧹 Step 3 — Data Quality Processing
- ✅ Remove exact duplicate rows
- ✅ Missing values: fill with default OR drop rows OR keep
- ✅ Trim leading/trailing whitespace from all strings
- ✅ Text case standardization (Title / UPPER / lower)
- ✅ Numeric type coercion (strings → numbers)
- ✅ Numeric field validation (flag non-numeric)
- ✅ Detailed quality report with 6 metrics
- ✅ Cell-level correction tracking

### 📊 Step 4 — Data Preview
- ✅ Responsive paginated table (10 rows/page)
- ✅ Live full-text search across all columns
- ✅ Click-to-sort on any column (toggle asc/desc)
- ✅ Color-coded cell highlights (filled/trimmed/cased/typed)
- ✅ Row count, column count display
- ✅ Shows raw merged data if quality not yet run

### ⬇ Step 5 — Download
- ✅ Format selector: CSV / TSV / JSON / Excel
- ✅ Live output preview (first 3 rows)
- ✅ One-click download in selected format
- ✅ Format tips and use-case guidance

### 🎨 UI
- ✅ Light / Dark mode toggle
- ✅ Live pipeline status in header
- ✅ Responsive layout (mobile & desktop)
- ✅ Smooth animations and transitions
- ✅ Industrial-tech aesthetic

---

## 🛠 Technology Stack

| Technology | Version | Usage |
|------------|---------|-------|
| React | 18.2 | UI framework |
| react-scripts (CRA) | 5.0 | Build toolchain |
| xlsx (SheetJS) | 0.18 | Excel read/write |
| papaparse | 5.4 | CSV/TSV parsing |
| CSS Custom Properties | - | Theming & dark mode |

---

## 🔌 Backend Integration Guide

The app works fully in-browser using mock data. To connect a real backend:

**In `src/utils/dataUtils.js`**, replace `parseFile()` with an API call:

```js
export async function parseFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  return response.json(); // expects array of row objects
}
```

**Expected API endpoints:**
```
POST   /api/upload            → { data: [{...}, ...] }
POST   /api/merge             → { data: [{...}, ...] }
POST   /api/quality           → { data: [{...}, ...], report: {...} }
GET    /api/download/:format  → File binary stream
```

---

## 🧪 Testing with Sample Data

Three sample files in `sample-data/` are pre-loaded with quality issues:

| File | Issues | Purpose |
|------|--------|---------|
| `students.csv` | Duplicate row, nulls, mixed case, whitespace | Main student data |
| `scores.json` | Duplicate row, null grades, mixed case subjects | Exam scores |
| `departments.tsv` | Missing HOD name, missing count, casing | Department info |

**Upload all 3 together** to test the full pipeline including column mismatch handling.

---

## ⌨️ VS Code Keyboard Shortcuts

| Action | Shortcut |
|--------|---------|
| Open Terminal | Ctrl+` |
| Run `npm start` | Type in terminal |
| Format file | Alt+Shift+F |
| Go to file | Ctrl+P |
| Find in project | Ctrl+Shift+F |

---

## 🐛 Troubleshooting

**"npm install" fails**
→ Make sure Node.js v16+ is installed: `node --version`

**Port 3000 already in use**
→ Run on different port: `PORT=3001 npm start` (Mac/Linux) or set in `.env`

**Excel file won't parse**
→ Ensure the file is `.xlsx` not `.xls` (older format). Use "Save As" in Excel to convert.

**App shows white screen**
→ Open browser console (F12) and check for errors. Usually a missing `npm install`.

---

Built with React · Zero backend required · 100% browser-based ETL
"# Mini-ETL-Pipeline" 
