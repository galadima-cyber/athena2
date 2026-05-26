# ============================================================
# ml/parser.py — HTTP log file parser
# ============================================================
# Reads raw HTTP request log files and returns a list of
# structured dictionaries. Supports two formats:
#   1. HTTP CSIC block format (requests separated by blank lines)
#   2. Apache/Nginx Combined Log Format (one request per line)

import re
import urllib.parse


def parse_log_file(filepath):
    """
    Parses an HTTP log file into a list of request dictionaries.
    Auto-detects the format from the first line.
    """
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    first_line = content.strip().split('\n')[0]
    if _is_apache_format(first_line):
        return _parse_apache_format(content)
    else:
        return _parse_csic_format(content)


def _is_apache_format(line):
    """Checks if line matches Apache Combined Log Format."""
    return bool(re.match(r'^\S+ \S+ \S+ \[.+\] ".+" \d+ \d+', line))


def _parse_apache_format(content):
    """Parses Apache/Nginx Combined Log Format. One request per line."""
    records = []
    pattern = (
        r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] '
        r'"(?P<method>\S+) (?P<url>\S+) (?P<version>[^"]+)" '
        r'(?P<status>\d+) (?P<bytes>\S+)'
        r'(?: "(?P<referer>[^"]*)" "(?P<agent>[^"]*)")?'
    )
    for line in content.strip().split('\n'):
        m = re.match(pattern, line.strip())
        if m:
            records.append({
                'method'         : m.group('method').upper(),
                'url'            : m.group('url'),
                'http_version'   : m.group('version'),
                'host'           : m.group('ip'),
                'user_agent'     : m.group('agent') or '',
                'content_type'   : '',
                'content_length' : '0',
                'accept'         : '',
                'accept_language': '',
                'body'           : '',
                'status_code'    : int(m.group('status')),
            })
    return records


def _parse_csic_format(content):
    """Parses HTTP CSIC block format. Requests separated by blank lines."""
    records = []
    blocks  = content.strip().split('\n\n')
    for block in blocks:
        lines  = [l.strip() for l in block.strip().split('\n') if l.strip()]
        record = _parse_single_block(lines)
        if record:
            records.append(record)
    return records


def _parse_single_block(lines):
    """Parses one HTTP request block into a dictionary."""
    if not lines:
        return None
    parts = lines[0].split(' ')
    if len(parts) < 2:
        return None

    method       = parts[0].upper()
    url          = parts[1] if len(parts) > 1 else '/'
    http_version = parts[2] if len(parts) > 2 else 'HTTP/1.1'

    headers = {}
    body    = ''
    in_body = False

    for line in lines[1:]:
        if in_body:
            body += line + ' '
        elif ':' in line:
            key, _, val = line.partition(':')
            headers[key.strip().lower()] = val.strip()
        else:
            in_body = True
            body   += line + ' '

    return {
        'method'         : method,
        'url'            : url,
        'http_version'   : http_version,
        'host'           : headers.get('host', ''),
        'user_agent'     : headers.get('user-agent', ''),
        'content_type'   : headers.get('content-type', ''),
        'content_length' : headers.get('content-length', '0'),
        'accept'         : headers.get('accept', ''),
        'accept_language': headers.get('accept-language', ''),
        'body'           : body.strip(),
    }


def decode_url(text):
    """URL-decodes a string twice to handle double-encoding."""
    try:
        decoded = urllib.parse.unquote(str(text))
        decoded = urllib.parse.unquote(decoded)
        return decoded.lower()
    except Exception:
        return str(text).lower()
