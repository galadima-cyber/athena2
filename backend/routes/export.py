# ============================================================
# routes/export.py — CSV and PDF export endpoints
# ============================================================

import io
import csv
from flask import Blueprint, jsonify, make_response
from database import get_analysis_by_id, get_requests_by_analysis

export_bp = Blueprint('export', __name__)


@export_bp.route('/api/export/csv/<int:analysis_id>', methods=['GET'])
def export_csv(analysis_id):
    """GET /api/export/csv/<id> — downloadable CSV of all requests."""
    summary = get_analysis_by_id(analysis_id)
    if not summary:
        return jsonify({'error': 'Analysis not found.'}), 404

    requests = get_requests_by_analysis(analysis_id, page=1)

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        'id','method','url','body','url_length','body_length',
        'num_params','has_sqli','has_xss','has_traversal',
        'risk_score','risk_label','attack_type'
    ])
    writer.writeheader()
    writer.writerows(requests)

    response = make_response(output.getvalue())
    response.headers['Content-Type']        = 'text/csv'
    response.headers['Content-Disposition'] = \
        f'attachment; filename=athena_analysis_{analysis_id}.csv'
    return response


@export_bp.route('/api/export/pdf/<int:analysis_id>', methods=['GET'])
def export_pdf(analysis_id):
    """GET /api/export/pdf/<id> — downloadable PDF report."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (SimpleDocTemplate, Paragraph,
                                    Spacer, Table, TableStyle)
    from reportlab.lib.units import cm

    summary = get_analysis_by_id(analysis_id)
    if not summary:
        return jsonify({'error': 'Analysis not found.'}), 404

    requests = get_requests_by_analysis(analysis_id, page=1)

    buffer = io.BytesIO()
    doc    = SimpleDocTemplate(buffer, pagesize=A4,
                               topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    elems  = []

    # Title
    elems.append(Paragraph('Athena — Security Analysis Report',
                            styles['Title']))
    elems.append(Spacer(1, 0.5*cm))

    # Summary table
    elems.append(Paragraph('Summary', styles['Heading2']))
    s_data = [
        ['File',         summary['filename']],
        ['Time',         summary['upload_time']],
        ['Total',        str(summary['total_requests'])],
        ['Malicious',    str(summary['total_attacks'])],
        ['Normal',       str(summary['total_normal'])],
        ['Attack Rate',  f"{summary['attack_rate']*100:.1f}%"],
        ['Top Attack',   summary['top_attack_type'] or 'N/A'],
    ]
    st = Table(s_data, colWidths=[5*cm, 11*cm])
    st.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(0,-1), colors.HexColor('#2c3e50')),
        ('TEXTCOLOR',  (0,0),(0,-1), colors.white),
        ('FONTSIZE',   (0,0),(-1,-1), 10),
        ('GRID',       (0,0),(-1,-1), 0.5, colors.grey),
        ('PADDING',    (0,0),(-1,-1), 6),
        ('ROWBACKGROUNDS',(1,0),(-1,-1),
         [colors.HexColor('#ecf0f1'), colors.white]),
    ]))
    elems.append(st)
    elems.append(Spacer(1, 0.5*cm))

    # Requests table (first 50)
    elems.append(Paragraph('Request Details (first 50)', styles['Heading2']))
    r_data = [['#','Method','URL','Score','Label','Attack']]
    for r in requests[:50]:
        url_short = (r['url'] or '')[:45]
        if len(r.get('url','')) > 45:
            url_short += '...'
        r_data.append([str(r['id']), r['method'], url_short,
                        f"{r['risk_score']:.3f}", r['risk_label'],
                        r['attack_type'] or 'None'])

    rt = Table(r_data, colWidths=[1*cm,2*cm,7*cm,2*cm,2.5*cm,3.5*cm])
    rt.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(-1,0), colors.HexColor('#2980b9')),
        ('TEXTCOLOR',  (0,0),(-1,0), colors.white),
        ('FONTSIZE',   (0,0),(-1,-1), 8),
        ('GRID',       (0,0),(-1,-1), 0.3, colors.grey),
        ('PADDING',    (0,0),(-1,-1), 4),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),
         [colors.HexColor('#ecf0f1'), colors.white]),
    ]))
    elems.append(rt)
    doc.build(elems)

    buffer.seek(0)
    response = make_response(buffer.getvalue())
    response.headers['Content-Type']        = 'application/pdf'
    response.headers['Content-Disposition'] = \
        f'attachment; filename=athena_report_{analysis_id}.pdf'
    return response
