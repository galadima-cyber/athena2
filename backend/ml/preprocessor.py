# ============================================================
# ml/preprocessor.py — v3 FIXED
# ============================================================
# Fixes:
#   1. Expanded METHOD_MAP — now handles DELETE, HEAD, OPTIONS,
#      PATCH (mapped to 3,4,5,6). Previously DELETE→0 (same as
#      GET) which confused the model.
#   2. Added format_type field — lets predictor.py know whether
#      the log is CSIC or Apache format so it can apply the
#      correct confidence adjustment.
#   3. Apache logs: url_length now includes full URL string
#      (path + any query string if present).

import re
import pandas as pd
from ml.parser import decode_url

SQLI_PATTERNS = [
    r"select\s", r"union\s", r"insert\s+into", r"delete\s+from",
    r"drop\s+table", r"or\s+1\s*=\s*1", r"and\s+1\s*=\s*1",
    r"or\s+'\w+'\s*=\s*'\w+'", r"--", r"/\*",
    r"exec\s*\(", r"xp_", r"sleep\s*\(", r"benchmark\s*\(",
    r"waitfor\s+delay", r"char\s*\(",
]

XSS_PATTERNS = [
    r"<script", r"</script", r"javascript:", r"vbscript:",
    r"onload\s*=", r"onerror\s*=", r"onclick\s*=",
    r"onmouseover\s*=", r"alert\s*\(", r"document\.cookie",
    r"document\.write", r"eval\s*\(", r"<iframe", r"expression\s*\(",
]

TRAVERSAL_PATTERNS = [
    r"\.\./", r"\.\.\\", r"%2e%2e",
    r"etc/passwd", r"etc/shadow", r"win\.ini", r"boot\.ini",
]

CMD_PATTERNS = [
    r";\s*(cat|ls|pwd|id|whoami|wget|curl|bash|sh)",
    r"\|\s*(cat|ls|pwd|id|whoami|bash)",
    r"`[^`]+`", r"\$\([^)]+\)", r"&&\s*\w+",
]

SENSITIVE_PATHS = [
    r"/admin", r"/phpmyadmin", r"/wp-admin", r"/.env",
    r"/config", r"/backup", r"/.git", r"\.bak", r"\.sql",
]

SPECIAL_CHARS = set("'\"<>(){}[];--#/*")

# FIX 1: Expanded method map
# GET=0, POST=1, PUT=2, DELETE=3, HEAD=4, OPTIONS=5, PATCH=6
# Unknown methods map to 0 (treated as GET-like)
METHOD_MAP = {
    'GET'    : 0,
    'POST'   : 1,
    'PUT'    : 2,
    'DELETE' : 3,
    'HEAD'   : 4,
    'OPTIONS': 5,
    'PATCH'  : 6,
}

FEATURE_COLUMNS = [
    'url_length', 'body_length', 'content_length_val', 'num_params',
    'num_special_chars_url', 'num_special_chars_body', 'has_body',
    'has_sqli', 'sqli_match_count',
    'has_xss',  'xss_match_count',
    'has_traversal', 'has_cmd_injection', 'accesses_sensitive_path',
    'method_encoded',
]

_SQLI_RE      = re.compile('|'.join(SQLI_PATTERNS),      re.IGNORECASE)
_XSS_RE       = re.compile('|'.join(XSS_PATTERNS),       re.IGNORECASE)
_TRAVERSAL_RE = re.compile('|'.join(TRAVERSAL_PATTERNS), re.IGNORECASE)
_CMD_RE       = re.compile('|'.join(CMD_PATTERNS),        re.IGNORECASE)
_PATH_RE      = re.compile('|'.join(SENSITIVE_PATHS),     re.IGNORECASE)

def engineer_features(requests):
    """
    Converts list of raw request dicts into a feature DataFrame.
    Returns:
        df       : pd.DataFrame — 15 features per request
        enriched : list of dicts — original requests + features + format_type
    """
    enriched = []
    for req in requests:
        url_dec  = decode_url(req.get('url',  ''))
        body_dec = decode_url(req.get('body', ''))
        full     = url_dec + ' ' + body_dec

        sqli_count = sum(
            1 for p in SQLI_PATTERNS if re.search(p, full, re.IGNORECASE))
        xss_count  = sum(
            1 for p in XSS_PATTERNS  if re.search(p, full, re.IGNORECASE))

        try:
            content_len = int(str(req.get('content_length', '0')).strip())
        except Exception:
            content_len = 0

        # FIX 1: Use expanded METHOD_MAP
        method_encoded = METHOD_MAP.get(
            req.get('method', 'GET').upper(), 0
        )

        # Detect if this is an Apache-format request
        # Apache requests have no body, no content-length header,
        # and very short URLs (just paths like /dashboard)
        is_apache = (
            req.get('content_type', '') == '' and
            content_len == 0 and
            len(body_dec) == 0 and
            not url_dec.startswith('/tienda')  # CSIC-specific prefix
        )

        features = {
            'url_length'             : len(url_dec),
            'body_length'            : len(body_dec),
            'content_length_val'     : content_len,
            'num_params'             : url_dec.count('&') + 1 if '?' in url_dec else 0,
            'num_special_chars_url'  : sum(1 for c in url_dec  if c in SPECIAL_CHARS),
            'num_special_chars_body' : sum(1 for c in body_dec if c in SPECIAL_CHARS),
            'has_body'               : 1 if len(body_dec) > 0 else 0,
            'has_sqli'               : 1 if sqli_count > 0 else 0,
            'sqli_match_count'       : sqli_count,
            'has_xss'                : 1 if xss_count  > 0 else 0,
            'xss_match_count'        : xss_count,
            'has_traversal'          : 1 if _TRAVERSAL_RE.search(full) else 0,
            'has_cmd_injection'      : 1 if _CMD_RE.search(full)       else 0,
            'accesses_sensitive_path': 1 if _PATH_RE.search(url_dec)   else 0,
            'method_encoded'         : method_encoded,
        }

        enriched.append({
            **req, **features,
            'url_decoded' : url_dec,
            'body_decoded': body_dec,
            'is_apache'   : is_apache,   # flag for predictor.py
        })

    df = pd.DataFrame([{k: e[k] for k in FEATURE_COLUMNS} for e in enriched])
    return df, enriched