# Athena — System Architecture Document

**System Name:** Athena Web-Based Log Analysis and Security Monitoring System  
**Version:** 1.0  
**Author:** [Your Name]  
**Institution:** [Your University]  
**Supervisor:** [Supervisor Name]  

---

## 1. Overview

Athena is a web-based security monitoring system that uses machine learning to detect unauthorized access attempts and web-based attacks in HTTP server logs. The system integrates a trained Random Forest classifier — developed during the IURC 2026 research phase — into a full-stack web application that enables security analysts to upload log files, view analysis results, and export reports.

---

## 2. System Architecture

Athena follows a three-tier client-server architecture:

```
┌─────────────────────────────────────────────────────────┐
│              PRESENTATION TIER (React.js)               │
│  Upload │ Dashboard │ Log Table │ History │ ML Model    │
│  Port 5173 (development) / Port 80 (production)         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST API (JSON)
                       │ CORS-enabled
┌──────────────────────▼──────────────────────────────────┐
│               LOGIC TIER (Python Flask)                  │
│  POST /api/analyze  GET /api/history                     │
│  GET  /api/analysis/:id                                  │
│  GET  /api/export/csv/:id  GET /api/export/pdf/:id       │
│  Port 5000                                               │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              ML ENGINE                          │    │
│  │  parser.py → preprocessor.py → predictor.py    │    │
│  │  Random Forest (random_forest.pkl)              │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │ SQLite queries
┌──────────────────────▼──────────────────────────────────┐
│               DATA TIER (SQLite)                         │
│  analyses table  (one row per log file analysed)         │
│  requests table  (one row per HTTP request)              │
│  File: athena.db                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer       | Technology          | Version  | Justification                                      |
|-------------|---------------------|----------|----------------------------------------------------|
| Frontend    | React.js            | 19.x     | Component-based UI, fast rendering, wide ecosystem |
| Frontend    | Vite                | 6.x      | Fast dev server, optimised builds                  |
| Frontend    | Tailwind CSS        | 3.x      | Utility-first styling, no custom CSS needed        |
| Frontend    | Recharts            | 2.x      | React-native charting library                      |
| Frontend    | React Router        | 7.x      | Client-side routing                                |
| Backend     | Python Flask        | 3.0      | Lightweight, Python-native, easy ML integration    |
| Backend     | Flask-CORS          | 4.0      | Cross-origin resource sharing for React-Flask comm |
| ML          | scikit-learn        | 1.3      | RandomForestClassifier training and inference      |
| ML          | pandas / numpy      | 2.x / 1.x| Feature engineering and data manipulation          |
| Database    | SQLite              | Built-in | Zero-configuration, file-based, portable           |
| Export      | ReportLab           | 4.x      | PDF report generation                              |

---

## 4. Component Descriptions

### 4.1 Frontend Components

| Component         | File                    | Responsibility                                        |
|-------------------|-------------------------|-------------------------------------------------------|
| App               | `src/App.jsx`           | Root component, global state, routing                 |
| Navbar            | `src/components/Navbar.jsx` | Navigation bar, active link highlighting          |
| StatCard          | `src/components/StatCard.jsx` | Reusable metric display card                    |
| RiskBadge         | `src/components/RiskBadge.jsx` | Colour-coded Malicious/Suspicious/Normal label  |
| Upload Page       | `src/pages/Upload.jsx`  | Drag-and-drop file upload, analysis trigger           |
| Dashboard Page    | `src/pages/Dashboard.jsx` | Charts, stat cards, IP table, export buttons        |
| Log Table Page    | `src/pages/LogTable.jsx`| Filterable, searchable, sortable request table        |
| History Page      | `src/pages/History.jsx` | Past analyses list, load previous results             |
| Model Info Page   | `src/pages/ModelInfo.jsx` | ML model performance, research results display      |
| API Client        | `src/api/client.js`     | All HTTP calls to Flask backend                       |

### 4.2 Backend Modules

| Module            | File                        | Responsibility                                    |
|-------------------|-----------------------------|---------------------------------------------------|
| App Entry         | `app.py`                    | Flask app, Blueprint registration, server start   |
| Configuration     | `config.py`                 | File paths, thresholds, Flask settings            |
| Database          | `database.py`               | SQLite schema, CRUD operations                    |
| Log Parser        | `ml/parser.py`              | Parse HTTP CSIC and Apache log formats            |
| Preprocessor      | `ml/preprocessor.py`        | 15-feature engineering pipeline                   |
| Predictor         | `ml/predictor.py`           | Load RF model, run predictions, assign labels     |
| Analyze Route     | `routes/analyze.py`         | POST /api/analyze endpoint                        |
| History Route     | `routes/history.py`         | GET /api/history and /api/analysis/:id            |
| Export Route      | `routes/export.py`          | PDF and CSV export endpoints                      |

---

## 5. Data Flow

```
User uploads log.txt
        │
        ▼
[routes/analyze.py]
  Validates file type and size
  Saves to uploads/ temporarily
        │
        ▼
[ml/parser.py]
  Detects format (CSIC block / Apache)
  Extracts: method, url, body, headers
  Returns: list of request dicts
        │
        ▼
[ml/preprocessor.py]
  URL decodes (double-pass for encoded attacks)
  Engineers 15 numeric features per request
  Returns: pandas DataFrame + enriched dicts
        │
        ▼
[ml/predictor.py]
  Passes raw DataFrame to Random Forest
  (No scaling — RF trained on unscaled features)
  Gets attack probability per request (0.0–1.0)
  Assigns risk label:
    >= 0.75 → Malicious (red)
    >= 0.40 → Suspicious (yellow)
    <  0.40 → Normal (green)
  Identifies attack type from rule flags
        │
        ▼
[database.py]
  Saves analysis summary to analyses table
  Saves all requests to requests table
        │
        ▼
[routes/analyze.py]
  Returns JSON: { analysis_id, summary, requests[0:500] }
        │
        ▼
[React Dashboard]
  Renders stat cards, charts, IP table
  User can filter, export, or view history
```

---

## 6. Database Schema

### analyses table
| Column          | Type    | Description                                |
|-----------------|---------|--------------------------------------------|
| id              | INTEGER | Primary key, auto-increment                |
| filename        | TEXT    | Original uploaded filename                 |
| upload_time     | TEXT    | ISO datetime of analysis                   |
| total_requests  | INTEGER | Total HTTP requests in the file            |
| total_attacks   | INTEGER | Requests flagged as Malicious or Suspicious|
| total_normal    | INTEGER | Requests labelled Normal                   |
| attack_rate     | REAL    | Fraction of requests that are attacks      |
| model_used      | TEXT    | ML model name (default: Random Forest)     |
| top_attack_type | TEXT    | Most frequent attack type detected         |
| summary_json    | TEXT    | JSON blob with attack_counts and top_ips   |

### requests table
| Column          | Type    | Description                                |
|-----------------|---------|--------------------------------------------|
| id              | INTEGER | Primary key, auto-increment                |
| analysis_id     | INTEGER | Foreign key → analyses.id                  |
| method          | TEXT    | HTTP method (GET/POST/PUT)                 |
| url             | TEXT    | Request URL (max 500 chars)                |
| body            | TEXT    | Request body (max 500 chars)               |
| url_length      | INTEGER | Length of decoded URL                      |
| body_length     | INTEGER | Length of decoded body                     |
| num_params      | INTEGER | Number of URL query parameters             |
| has_sqli        | INTEGER | 1 if SQLi pattern detected, 0 otherwise    |
| has_xss         | INTEGER | 1 if XSS pattern detected, 0 otherwise     |
| has_traversal   | INTEGER | 1 if traversal pattern detected            |
| risk_score      | REAL    | Attack probability (0.0 to 1.0)            |
| risk_label      | TEXT    | Malicious / Suspicious / Normal            |
| attack_type     | TEXT    | SQL Injection / XSS / Traversal / etc.     |

---

## 7. ML Model Details

| Property            | Value                                      |
|---------------------|--------------------------------------------|
| Algorithm           | Random Forest Classifier (scikit-learn)    |
| Training Dataset    | HTTP CSIC 2010                             |
| Training Samples    | 77,652 (80% of 97,065)                     |
| Test Samples        | 19,413 (20% of 97,065)                     |
| Features            | 15 engineered features                     |
| n_estimators        | 100 decision trees                         |
| Class weighting     | Balanced (attack weight = 1.94)            |
| Accuracy            | 87.00%                                     |
| Recall              | 89.29%                                     |
| F1-Score            | 78.01%                                     |
| ROC-AUC             | 95.94%                                     |
| Scaling             | None (RF is scale-invariant)               |
| Model file          | models/random_forest.pkl                   |

---

## 8. Security Considerations

- Uploaded files are validated for extension and size before processing
- Temporary files are deleted immediately after analysis
- The system is intended for local/intranet deployment — not public internet
- Flask runs in debug mode for development; use Gunicorn for production
- SQLite is sufficient for single-user/demo use; PostgreSQL for production

---

## 9. File Structure

```
athena/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── requirements.txt
│   ├── athena.db           (created on first run)
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── parser.py
│   │   ├── preprocessor.py
│   │   └── predictor.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── analyze.py
│   │   ├── history.py
│   │   └── export.py
│   ├── models/
│   │   ├── random_forest.pkl
│   │   ├── scaler.pkl
│   │   ├── class_weights.pkl
│   │   └── feature_columns.txt
│   └── uploads/            (temporary, auto-cleared)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── api/client.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── RiskBadge.jsx
│   │   └── pages/
│   │       ├── Upload.jsx
│   │       ├── Dashboard.jsx
│   │       ├── LogTable.jsx
│   │       ├── History.jsx
│   │       └── ModelInfo.jsx
│   ├── package.json
│   └── vite.config.js
└── docs/
    ├── system_architecture.md  (this file)
    ├── api_reference.md
    └── user_manual.md
```
