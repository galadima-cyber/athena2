# ============================================================
# app.py — Athena Flask Entry Point
# ============================================================
# HOW TO RUN:
#   cd athena/backend
#   python app.py
# Server starts at http://localhost:5000
# React runs at   http://localhost:5173 (see frontend/READ

from flask import Flask
from flask_cors import CORS
from database import init_db
from routes.analyze import analyze_bp
from routes.history  import history_bp
from routes.export   import export_bp
from config import SECRET_KEY

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# Allow React (port 5173) to call Flask (port 5000).
# Permit localhost and the developer's phone IP during local dev.
CORS(app, resources={r'/api/*': {'origins': [
    'http://localhost:5173',
    'https://athena2-tau.vercel.app',   # your actual Vercel URL
    'https://*.vercel.app',
]}})

app.register_blueprint(analyze_bp)
app.register_blueprint(history_bp)
app.register_blueprint(export_bp)


@app.route('/api/health', methods=['GET'])
def health():
    """Quick check — visit http://localhost:5000/api/health"""
    return {'status': 'ok', 'system': 'Athena v1.0'}, 200


if __name__ == '__main__':
    print('='*50)
    print('  ATHENA Security Monitoring System')
    print('  Backend starting on http://localhost:5000')
    print('='*50)
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
