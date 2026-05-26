# Athena — User Manual

**Version:** 1.0  
**System:** Web-Based Log Analysis and Security Monitoring System

---

## 1. System Requirements

| Component | Requirement                              |
|-----------|------------------------------------------|
| OS        | Windows 10/11, macOS, or Linux           |
| Python    | 3.10 or higher                           |
| Node.js   | 18 or higher                             |
| RAM       | Minimum 4 GB (8 GB recommended)          |
| Disk      | 500 MB free space                        |
| Browser   | Chrome, Firefox, or Edge (latest)        |

---

## 2. Installation

### Step 1 — Install Python dependencies
```bash
cd athena/backend
pip install flask flask-cors pandas numpy scikit-learn reportlab
```

### Step 2 — Install Node.js dependencies
```bash
cd athena/frontend
npm install
```

---

## 3. Starting the System

Two terminal windows are required — one for the backend, one for the frontend.

**Terminal 1 — Backend:**
```bash
cd athena/backend
python app.py
```
Expected output:
```
ATHENA Security Monitoring System
Backend starting on http://localhost:5000
[DB] Database initialised.
[ML] Loading Random Forest model...
[ML] All models ready.
```

**Terminal 2 — Frontend:**
```bash
cd athena/frontend
npm run dev
```
Expected output:
```
VITE ready in 300ms
➜ Local: http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

---

## 4. Using Athena

### 4.1 Uploading a Log File (Upload Page)

1. Navigate to the Upload page (home page)
2. Drag and drop a log file onto the upload zone, OR click the zone to browse
3. Supported formats: `.txt`, `.log`, `.csv`
4. Maximum file size: 100 MB
5. Click **Run ML Analysis**
6. Wait for the progress messages to complete
7. The Dashboard loads automatically when analysis finishes

**Supported log formats:**
- HTTP CSIC 2010 block format (requests separated by blank lines)
- Apache Combined Log Format (one request per line)
- Nginx access logs

### 4.2 Viewing Results (Dashboard Page)

The Dashboard shows four sections:

**Summary Cards (top row)**
- Total Requests — total HTTP requests analysed
- Malicious — requests with attack probability ≥ 75%
- Suspicious — requests with attack probability ≥ 40%
- Normal — all remaining requests

**Attack Type Breakdown (pie chart)**
Shows the distribution of detected attack types:
SQL Injection, XSS, Directory Traversal, Command Injection, Unauthorized Access

**Risk Distribution (bar chart)**
Visual comparison of Normal vs Suspicious vs Malicious request counts

**Top Suspicious IPs (table)**
The 10 IP addresses responsible for the most suspicious requests, with their attack types

### 4.3 Filtering Logs (Log Table Page)

1. Click **Log Table** in the navigation bar
2. Use the search box to filter by URL, method, or attack type
3. Click filter buttons (All / Malicious / Suspicious / Normal) to narrow results
4. Click any column header to sort by that column
5. Click **Show** on any row to expand full URL, body, and feature flags

**Risk Score column:**
The coloured bar shows the ML attack probability:
- Red bar → high probability of attack
- Yellow bar → medium probability
- Green bar → low probability

### 4.4 Exporting Reports

From the Dashboard page:

**Export CSV:** Downloads all requests as a spreadsheet  
**Export PDF:** Downloads a formatted PDF report with summary table and first 50 requests

### 4.5 Viewing History (History Page)

1. Click **History** in the navigation bar
2. All past analyses are listed with their key metrics
3. Click **View Details** to reload any past analysis onto the Dashboard
4. The attack rate bar colour indicates severity:
   - Green = low attack rate (< 10%)
   - Yellow = medium attack rate (10–30%)
   - Red = high attack rate (> 30%)

### 4.6 Model Performance (ML Model Page)

Click **ML Model** in the navigation bar to view:
- Performance comparison of all three models tested
- Training dataset statistics
- Feature importance explanation
- Research findings from the underlying study

---

## 5. Understanding Risk Labels

| Label      | Risk Score    | Colour | Meaning                                         |
|------------|---------------|--------|-------------------------------------------------|
| Malicious  | ≥ 0.75        | Red    | High probability of attack — investigate        |
| Suspicious | 0.40 – 0.74   | Yellow | Possible attack — monitor closely               |
| Normal     | < 0.40        | Green  | Low probability — routine web traffic           |

Thresholds can be adjusted in `backend/config.py`:
```python
RISK_HIGH   = 0.75   # >= this → Malicious
RISK_MEDIUM = 0.40   # >= this → Suspicious
```

---

## 6. Troubleshooting

| Problem | Solution |
|---------|----------|
| "Analysis failed" | Ensure backend is running on port 5000. Check backend terminal for errors. |
| All requests classified as malicious | Ensure `models/random_forest.pkl` matches the version from Notebook 03 |
| File upload rejected | Check file extension (.txt, .log, .csv only) and size (< 100 MB) |
| PDF export empty | File requires ReportLab: `pip install reportlab` |
| History page empty | No analyses have been saved yet — upload a file first |
| Port already in use | Change port in `app.py` (line: `app.run(port=5000)`) |
