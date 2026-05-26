# ============================================================
# routes/history.py — History and analysis detail endpoints
# ============================================================

from flask import Blueprint, request, jsonify
from database import (get_all_analyses, get_analysis_by_id,
                      get_requests_by_analysis)
from database import delete_all_analyses

history_bp = Blueprint('history', __name__)


@history_bp.route('/api/history', methods=['GET'])
def get_history():
    """GET /api/history — returns all past analyses."""
    return jsonify({'analyses': get_all_analyses()}), 200


@history_bp.route('/api/analysis/<int:analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    """
    GET /api/analysis/<id>
    Query params: page (int), risk_filter (All|Normal|Suspicious|Malicious)
    Returns summary + paginated requests for one analysis.
    """
    summary = get_analysis_by_id(analysis_id)
    if not summary:
        return jsonify({'error': 'Analysis not found.'}), 404

    page        = request.args.get('page', 1, type=int)
    risk_filter = request.args.get('risk_filter', 'All')

    reqs = get_requests_by_analysis(analysis_id,
                                    page=page,
                                    risk_filter=risk_filter)
    return jsonify({'summary': summary, 'requests': reqs, 'page': page}), 200


@history_bp.route('/api/history/clear', methods=['POST'])
def clear_history():
    """POST /api/history/clear — removes all saved analyses and requests"""
    try:
        delete_all_analyses()
        return jsonify({'ok': True}), 200
    except Exception as e:
        return jsonify({'error': 'Could not clear history.'}), 500
