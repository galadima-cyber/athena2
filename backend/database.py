# ============================================================
# database.py — SQLite database setup and helpers
# ============================================================
# Two tables:
#   analyses → one row per uploaded log file
#   requests → one row per HTTP request inside that file
# Relationship: one analysis -> many requests (one-to-many)

import sqlite3
import json
from datetime import datetime
from config import DB_PATH, PAGE_SIZE


def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Creates tables if they don't exist. Safe to call on every startup."""
    conn   = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analyses (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            filename        TEXT    NOT NULL,
            upload_time     TEXT    NOT NULL,
            total_requests  INTEGER NOT NULL,
            total_attacks   INTEGER NOT NULL,
            total_normal    INTEGER NOT NULL,
            attack_rate     REAL    NOT NULL,
            model_used      TEXT    NOT NULL DEFAULT "Random Forest",
            top_attack_type TEXT,
            summary_json    TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS requests (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            analysis_id     INTEGER NOT NULL,
            method          TEXT,
            url             TEXT,
            body            TEXT,
            url_length      INTEGER,
            body_length     INTEGER,
            num_params      INTEGER,
            has_sqli        INTEGER,
            has_xss         INTEGER,
            has_traversal   INTEGER,
            risk_score      REAL,
            risk_label      TEXT,
            attack_type     TEXT,
            FOREIGN KEY (analysis_id) REFERENCES analyses(id)
        )
    ''')

    conn.commit()
    conn.close()
    print('[DB] Database initialised.')


def save_analysis(filename, results):
    """Saves a complete analysis result to the database."""
    conn   = get_connection()
    cursor = conn.cursor()

    reqs       = results['requests']
    total      = len(reqs)
    attacks    = sum(1 for r in reqs if r['risk_label'] != 'Normal')
    normal     = total - attacks
    rate       = attacks / total if total > 0 else 0

    type_counts = {}
    for r in reqs:
        t = r.get('attack_type','None')
        if t and t != 'None':
            type_counts[t] = type_counts.get(t, 0) + 1
    top_attack = max(type_counts, key=type_counts.get) if type_counts else 'None'

    cursor.execute('''
        INSERT INTO analyses
            (filename, upload_time, total_requests, total_attacks,
             total_normal, attack_rate, model_used, top_attack_type, summary_json)
        VALUES (?,?,?,?,?,?,?,?,?)
    ''', (filename,
          datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
          total, attacks, normal, rate,
          'Random Forest', top_attack,
          json.dumps(results.get('summary', {}))))

    analysis_id = cursor.lastrowid

    for r in reqs:
        cursor.execute('''
            INSERT INTO requests
                (analysis_id, method, url, body, url_length, body_length,
                 num_params, has_sqli, has_xss, has_traversal,
                 risk_score, risk_label, attack_type)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', (analysis_id,
              r.get('method',''),
              r.get('url','')[:500],
              r.get('body','')[:500],
              r.get('url_length',0),
              r.get('body_length',0),
              r.get('num_params',0),
              r.get('has_sqli',0),
              r.get('has_xss',0),
              r.get('has_traversal',0),
              r.get('risk_score',0.0),
              r.get('risk_label','Normal'),
              r.get('attack_type','None')))

    conn.commit()
    conn.close()
    return analysis_id


def get_all_analyses():
    conn  = get_connection()
    rows  = conn.execute(
        'SELECT * FROM analyses ORDER BY upload_time DESC').fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_analysis_by_id(analysis_id):
    conn = get_connection()
    row  = conn.execute(
        'SELECT * FROM analyses WHERE id=?', (analysis_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_requests_by_analysis(analysis_id, page=1, risk_filter=None):
    offset = (page - 1) * PAGE_SIZE
    conn   = get_connection()
    if risk_filter and risk_filter != 'All':
        rows = conn.execute(
            'SELECT * FROM requests WHERE analysis_id=? AND risk_label=? '
            'LIMIT ? OFFSET ?',
            (analysis_id, risk_filter, PAGE_SIZE, offset)).fetchall()
    else:
        rows = conn.execute(
            'SELECT * FROM requests WHERE analysis_id=? LIMIT ? OFFSET ?',
            (analysis_id, PAGE_SIZE, offset)).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def delete_all_analyses():
    """Deletes all analyses and associated requests. Use with caution."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM requests')
    cur.execute('DELETE FROM analyses')
    conn.commit()
    conn.close()
