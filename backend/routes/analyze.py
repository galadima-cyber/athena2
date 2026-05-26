# ============================================================
# routes/analyze.py — FIXED VERSION
# ============================================================
# Uses all_requests for database saving (full set)
# but sends only requests (capped 500) to React frontend.

import os
from flask import Blueprint, request, jsonify
from config import UPLOADS_DIR, ALLOWED_EXTENSIONS
from ml.predictor import run_analysis
from database import save_analysis

analyze_bp = Blueprint('analyze', __name__)


def _allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS


@analyze_bp.route('/api/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400
    if not _allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Use .txt .log or .csv'}), 400

    safe_name = file.filename.replace(' ', '_')
    filepath  = os.path.join(UPLOADS_DIR, safe_name)
    file.save(filepath)

    try:
        results = run_analysis(filepath, safe_name)
        if 'error' in results:
            return jsonify({'error': results['error']}), 422

        # Save ALL requests to database using all_requests key
        results_for_db = {
            'requests': results.get('all_requests', results['requests']),
            'summary' : results['summary'],
        }
        analysis_id = save_analysis(safe_name, results_for_db)

        # Return only the capped list to React (prevents huge response)
        return jsonify({
            'analysis_id': analysis_id,
            'summary'    : results['summary'],
            'requests'   : results['requests'],  # max 500
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)