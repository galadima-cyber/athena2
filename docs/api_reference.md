# Athena — API Reference

**Base URL:** `http://localhost:5000`  
**Format:** All requests and responses use JSON unless stated otherwise.

---

## Endpoints

### POST /api/analyze

Uploads a log file and runs the full ML analysis pipeline.

**Request**
- Content-Type: `multipart/form-data`
- Body field: `file` — the log file (.txt, .log, or .csv)

**Response 200**
```json
{
  "analysis_id": 1,
  "summary": {
    "filename"     : "access.log",
    "total"        : 5000,
    "malicious"    : 320,
    "suspicious"   : 180,
    "normal"       : 4500,
    "attack_rate"  : 10.0,
    "attack_counts": { "SQL Injection": 200, "XSS": 120 },
    "top_ips"      : [{ "ip": "192.168.1.5", "count": 45,
                        "attack_types": ["SQL Injection"] }]
  },
  "requests": [
    {
      "id"           : 1,
      "method"       : "GET",
      "url"          : "/login.php?id=1",
      "body"         : "",
      "url_length"   : 17,
      "body_length"  : 0,
      "num_params"   : 1,
      "has_sqli"     : 0,
      "has_xss"      : 0,
      "has_traversal": 0,
      "risk_score"   : 0.08,
      "risk_label"   : "Normal",
      "attack_type"  : "None"
    }
  ]
}
```
Note: `requests` contains a maximum of 500 rows.
All rows are stored in the database.

**Response 400** — No file or invalid file type  
**Response 422** — File parsed but contained no valid HTTP requests  
**Response 500** — Internal server error (check backend logs)

---

### GET /api/history

Returns all past analyses in reverse chronological order.

**Response 200**
```json
{
  "analyses": [
    {
      "id"             : 1,
      "filename"       : "access.log",
      "upload_time"    : "2026-05-24 14:30:00",
      "total_requests" : 5000,
      "total_attacks"  : 500,
      "total_normal"   : 4500,
      "attack_rate"    : 0.10,
      "model_used"     : "Random Forest",
      "top_attack_type": "SQL Injection",
      "summary_json"   : "{...}"
    }
  ]
}
```

---

### GET /api/analysis/:id

Returns details for one past analysis with paginated requests.

**Parameters**
- `id` (path) — analysis ID from /api/history
- `page` (query, optional) — page number, default 1
- `risk_filter` (query, optional) — All | Normal | Suspicious | Malicious

**Response 200**
```json
{
  "summary"  : { ... },
  "requests" : [ ... ],
  "page"     : 1
}
```

**Response 404** — Analysis ID not found

---

### GET /api/export/csv/:id

Downloads all requests for one analysis as a CSV file.

**Response** — `text/csv` file download  
Filename: `athena_analysis_{id}.csv`

---

### GET /api/export/pdf/:id

Generates and downloads a PDF report for one analysis.

**Response** — `application/pdf` file download  
Filename: `athena_report_{id}.pdf`  
Contains: summary table and first 50 requests.

---

### GET /api/health

Health check endpoint.

**Response 200**
```json
{ "status": "ok", "system": "Athena v1.0" }
```
