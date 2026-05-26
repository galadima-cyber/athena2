# ============================================================
# ml/predictor.py — FIXED v2
# ============================================================
# ROOT CAUSE OF BUG:
#   The Random Forest model was trained on UNSCALED features
#   in Notebook 03. The StandardScaler was only needed for LSTM.
#   Applying the scaler before RF prediction fed it completely
#   wrong (negative) values, causing everything to be malicious.
#
# FIX:
#   Pass features DIRECTLY to RF without scaling.
#   Scaler is no longer used here.

import pickle
import pandas as pd
from config import RF_MODEL_PATH, FEATURE_COLS_PATH
from config import RISK_HIGH, RISK_MEDIUM
from ml.parser import parse_log_file
from ml.preprocessor import engineer_features

MAX_RESPONSE_ROWS = 500

print('[ML] Loading Random Forest model...')
with open(RF_MODEL_PATH, 'rb') as f:
    _rf_model = pickle.load(f)

with open(FEATURE_COLS_PATH, 'r') as f:
    _feature_cols = [line.strip() for line in f.readlines()]

print('[ML] Model ready. (No scaler needed — RF trained on raw features)')


def _assign_risk_label(prob):
    if prob >= RISK_HIGH:
        return 'Malicious'
    elif prob >= RISK_MEDIUM:
        return 'Suspicious'
    return 'Normal'


def _identify_attack_type(req):
    if req.get('has_sqli'):
        return 'SQL Injection'
    if req.get('has_xss'):
        return 'XSS'
    if req.get('has_traversal'):
        return 'Directory Traversal'
    if req.get('has_cmd_injection'):
        return 'Command Injection'
    if req.get('accesses_sensitive_path'):
        return 'Unauthorized Access'
    return 'Anomaly'


def run_analysis(filepath, filename):
    # Step 1 — Parse
    print(f'[ML] Parsing: {filename}')
    raw_requests = parse_log_file(filepath)
    if not raw_requests:
        return {'error': 'No valid HTTP requests found in file.'}
    print(f'[ML] Parsed {len(raw_requests):,} requests.')

    # Step 2 — Feature engineering
    print('[ML] Engineering features...')
    feature_df, enriched = engineer_features(raw_requests)

    # Step 3 — Predict directly on RAW features (no scaling)
    # RF was trained on unscaled data — pass it unscaled data.
    print('[ML] Predicting...')
    X = feature_df[_feature_cols]
    probabilities = _rf_model.predict_proba(X)[:, 1]

    # Debug: confirm probabilities look sensible
    print(f'[ML] Sample probs (first 5): '
          f'{[round(float(p),4) for p in probabilities[:5]]}')

    # Step 4 — Build results
    results = []
    for i, req in enumerate(enriched):
        prob        = float(probabilities[i])
        label       = _assign_risk_label(prob)
        attack_type = _identify_attack_type(req) if label != 'Normal' else 'None'

        results.append({
            'id'           : i + 1,
            'method'       : req.get('method', ''),
            'url'          : req.get('url', '')[:200],
            'body'         : req.get('body', '')[:200],
            'url_length'   : req.get('url_length', 0),
            'body_length'  : req.get('body_length', 0),
            'num_params'   : req.get('num_params', 0),
            'has_sqli'     : req.get('has_sqli', 0),
            'has_xss'      : req.get('has_xss', 0),
            'has_traversal': req.get('has_traversal', 0),
            'risk_score'   : round(prob, 4),
            'risk_label'   : label,
            'attack_type'  : attack_type,
        })

    # Step 5 — Summary
    total      = len(results)
    malicious  = sum(1 for r in results if r['risk_label'] == 'Malicious')
    suspicious = sum(1 for r in results if r['risk_label'] == 'Suspicious')
    normal     = total - malicious - suspicious

    attack_counts = {}
    for r in results:
        if r['attack_type'] != 'None':
            t = r['attack_type']
            attack_counts[t] = attack_counts.get(t, 0) + 1

    ip_counts = {}
    for r, raw in zip(results, raw_requests):
        ip = raw.get('host', 'Unknown')
        if r['risk_label'] != 'Normal':
            if ip not in ip_counts:
                ip_counts[ip] = {'ip': ip, 'count': 0, 'attack_types': set()}
            ip_counts[ip]['count'] += 1
            if r['attack_type'] != 'None':
                ip_counts[ip]['attack_types'].add(r['attack_type'])

    top_ips = sorted(ip_counts.values(),
                     key=lambda x: x['count'], reverse=True)[:10]
    for e in top_ips:
        e['attack_types'] = list(e['attack_types'])

    summary = {
        'filename'     : filename,
        'total'        : total,
        'malicious'    : malicious,
        'suspicious'   : suspicious,
        'normal'       : normal,
        'attack_rate'  : round((malicious + suspicious) / total * 100, 2),
        'attack_counts': attack_counts,
        'top_ips'      : top_ips,
    }

    print(f'[ML] Done. {malicious} malicious | '
          f'{suspicious} suspicious | {normal} normal.')

    return {
        'filename'    : filename,
        'requests'    : results[:MAX_RESPONSE_ROWS],
        'all_requests': results,
        'summary'     : summary,
    }