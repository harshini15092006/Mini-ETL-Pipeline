Multi-Format ETL Data Merger & Quality Processor

A browser-based ETL application built with React that combines multiple data formats, detects schema differences, performs data quality operations, and exports clean, structured datasets.

Overview

The application simplifies the Extract, Transform, and Load (ETL) process by allowing users to upload, merge, clean, preview, and export datasets through an interactive interface.

No backend required — all data processing happens directly in the browser.

Key Features
Multi-Format Upload: Supports CSV, TSV, JSON, XLSX, and XLS files.
Schema Detection: Automatically identifies common and mismatched columns.
Data Merging: Combines datasets with interactive column mapping.
Data Cleaning: Removes duplicates, handles missing values, trims whitespace, and standardizes text.
Data Validation: Performs numeric conversion and identifies invalid values.
Quality Reporting: Tracks data corrections and quality metrics.
Interactive Preview: Supports search, sorting, and pagination.
Data Export: Downloads processed datasets as CSV, TSV, JSON, or Excel.
Modern UI: Responsive design with light and dark themes.
ETL Workflow
text
Upload Files
↓
Schema Detection & Mapping
↓
Data Merging
↓
Data Quality Processing
↓
Data Preview
↓
Export Processed Data

Technology Stack
Technology Purpose
React 18 Frontend framework
JavaScript Application logic
PapaParse CSV/TSV parsing
SheetJS (xlsx) Excel processing
CSS3 Styling and responsive UI
Project Structure
text
Mini-ETL-Pipeline/
├── public/
├── src/
│ ├── components/
│ │ ├── UploadStep.jsx
│ │ ├── MergeStep.jsx
│ │ ├── QualityStep.jsx
│ │ ├── PreviewStep.jsx
│ │ └── DownloadStep.jsx
│ ├── styles/
│ ├── utils/
│ │ └── dataUtils.js
│ ├── App.jsx
│ └── index.js
├── sample-data/
├── package.json
└── README.md

Getting Started

1. Clone the repository

bash
git clone https://github.com/harshini15092006/Mini-ETL-Pipeline.git

2. Navigate to the project

bash
cd Mini-ETL-Pipeline

3. Install dependencies

bash
npm install

4. Start the application

bash
npm start

Open http://localhost:3000 in your browser.

Sample Datasets

The project includes sample CSV, JSON, and TSV files containing duplicates, missing values, inconsistent casing, and whitespace issues for testing the ETL pipeline.

Future Enhancements
Python FastAPI backend integration.
Database connectivity.
Advanced data profiling and quality scoring.
Automated schema matching.
ETL job monitoring and history.

Developed by Harshini

Transforming raw data into clean, structured, and usable information.
