Multi-Format ETL Data Merger & Quality Processor

A browser-based ETL application for merging heterogeneous datasets, standardizing schemas, and improving data quality through an interactive processing pipeline.

<p align="center">
<strong>React 18 · JavaScript · PapaParse · SheetJS · Client-Side ETL</strong>
</p>

Overview

The Multi-Format ETL Data Merger & Quality Processor is a React-based data processing application designed to simplify the Extract, Transform, and Load (ETL) workflow.

It enables users to upload datasets in multiple formats, automatically detect and reconcile schemas, merge records, perform data quality operations, preview processed results, and export the final dataset in their preferred format.

The entire processing workflow runs directly in the browser, eliminating the need for backend infrastructure or server-side data processing.

Key Highlights
Multi-format data ingestion supporting CSV, TSV, JSON, XLSX, and XLS.
Automatic schema detection and column mapping.
Dataset merging with column mismatch identification.
Data cleaning, normalization, and validation.
Interactive data preview with search, sorting, and pagination.
Export processed datasets into multiple formats.
Responsive interface with light and dark themes.
Application Workflow

The application follows a five-stage ETL pipeline:

Stage Process Description
01 Extract Upload and parse multiple data files
02 Transform Detect schemas and merge datasets
03 Data Quality Clean, standardize, and validate records
04 Preview Inspect processed data interactively
05 Load Export the final dataset in the required format
Core Features

1. Multi-Format Data Ingestion
   Upload multiple files simultaneously.
   Drag-and-drop and file browser support.
   Supports CSV, TSV, JSON, XLSX, and XLS.
   File format validation and parsing error handling.
   Individual file statistics, including row and column counts.
   Remove individual files before processing.
2. Intelligent Schema Detection & Data Merging
   Automatically identifies columns across uploaded datasets.
   Detects common and mismatched columns.
   Visualizes column overlap between datasets.
   Interactive column mapping and renaming.
   Combines heterogeneous datasets into a unified structure.
   Displays merged row and column statistics.
3. Data Quality & Transformation

Implements a configurable data quality pipeline with the following operations:

Operation Description
Duplicate Removal Identifies and removes exact duplicate records
Missing Value Handling Fills missing values, removes incomplete rows, or retains them
Whitespace Trimming Removes unnecessary leading and trailing spaces
Case Standardization Converts text into Title Case, UPPERCASE, or lowercase
Type Conversion Converts numeric strings into numeric values
Data Validation Identifies invalid numeric values
Quality Reporting Generates metrics describing data quality improvements
Correction Tracking Tracks cell-level transformations 4. Interactive Data Preview
Responsive tabular data visualization.
Pagination with 10 records per page.
Full-text search across available columns.
Interactive ascending and descending sorting.
Visual highlighting of transformed cells.
Row and column statistics.
Preview of raw merged data and quality-processed data. 5. Flexible Data Export

Export the processed dataset in:

CSV
TSV
JSON
Excel (XLSX)

Additional capabilities:

Live output preview.
One-click file download.
Format-specific export options.
Guidance for selecting an appropriate output format. 6. User Interface
Responsive design for desktop and mobile.
Light and dark theme support.
Pipeline progress indicators.
Reusable UI components.
Smooth transitions and interactive controls.
Clean industrial-tech visual design.
Technology Stack
Technology Purpose
React 18.2 Component-based frontend development
JavaScript (ES6+) ETL processing and application logic
React Scripts 5.0 Development server and production build
PapaParse 5.4 CSV and TSV parsing
SheetJS (xlsx) 0.18 Excel file processing and export
CSS3 Responsive styling and theme management
Project Architecture
text
Mini-ETL-Pipeline/
│
├── public/
│ └── index.html
│
├── src/
│ ├── components/
│ │ ├── UI.jsx
│ │ ├── Stepper.jsx
│ │ ├── UploadStep.jsx
│ │ ├── MergeStep.jsx
│ │ ├── QualityStep.jsx
│ │ ├── PreviewStep.jsx
│ │ └── DownloadStep.jsx
│ │
│ ├── styles/
│ │ └── global.css
│ │
│ ├── utils/
│ │ └── dataUtils.js
│ │
│ ├── App.jsx
│ └── index.js
│
├── sample-data/
│ ├── students.csv
│ ├── scores.json
│ └── departments.tsv
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

Code Organization
App.jsx: Manages application state, pipeline navigation, and component integration.
components/: Contains modular components for each ETL processing stage.
dataUtils.js: Centralizes data parsing, merging, quality processing, and export operations.
global.css: Defines application styling, design variables, and theme support.
sample-data/: Provides sample datasets for testing the complete workflow.
Getting Started
Prerequisites

Ensure the following software is installed:

Node.js (v16 or later)
npm
Visual Studio Code (recommended)

1. Clone the Repository
   bash
   git clone https://github.com/harshini15092006/Mini-ETL-Pipeline.git

2. Navigate to the Project Directory
   bash
   cd Mini-ETL-Pipeline

3. Install Dependencies
   bash
   npm install

4. Start the Development Server
   bash
   npm start

Open your browser and navigate to:

text
http://localhost:3000

The application will run locally in your browser.

Testing with Sample Datasets

The repository includes three sample datasets containing different data quality issues.

Dataset Format Sample Data Characteristics
students.csv CSV Duplicate records, missing values, inconsistent casing, whitespace
scores.json JSON Missing grades, duplicate records, inconsistent subject names
departments.tsv TSV Missing department information, whitespace, inconsistent casing
Recommended Testing Workflow
Upload all three sample datasets.
Review the detected schemas and column mismatches.
Configure column mappings where necessary.
Merge the uploaded datasets.
Apply the available data quality operations.
Inspect the quality report and processed records.
Search, sort, and preview the resulting dataset.
Export the final dataset as CSV, TSV, JSON, or Excel.
Production Build

Generate an optimized production build using:

bash
npm run build

The optimized application will be generated in the build/ directory.

Since the application is browser-based, the production build can be deployed to static hosting platforms such as:

Vercel
Netlify
GitHub Pages
Backend Integration

The current application performs data processing entirely on the client side.

It can be extended to support backend-based ETL processing through REST APIs.

Potential API architecture:

HTTP Method Endpoint Responsibility
POST /api/upload Upload and extract datasets
POST /api/merge Merge datasets
POST /api/quality Execute data quality operations
GET /api/download/:format Export processed datasets

A backend implementation could introduce centralized processing, persistent storage, authentication, and support for larger datasets.

Future Enhancements

Potential improvements to extend the application:

Backend integration using Python and FastAPI.
Database connectivity with PostgreSQL or MySQL.
Automated data quality scoring.
Advanced schema matching and conflict resolution.
Support for larger datasets through optimized processing.
ETL job history and execution monitoring.
Automated data profiling and validation rules.
Unit and integration testing.
Engineering Highlights

This project demonstrates practical implementation of:

ETL pipeline design and workflow orchestration.
Multi-format data ingestion and parsing.
Schema reconciliation and data integration.
Data cleansing and normalization.
Data validation and quality monitoring.
Modular React architecture.
Client-side file processing.
Structured data export and transformation.
License

This project is intended for educational and portfolio demonstration purposes.

Developed by Harshini

Building practical data engineering solutions with modern frontend technologies.
