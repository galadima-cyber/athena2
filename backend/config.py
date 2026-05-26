# ============================================================
# config.py — Central settings for the Athena backend
# ============================================================
# All file paths and settings in one place.
# Every other file imports from here — never hardcode paths.

import os

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR  = os.path.join(BASE_DIR, 'models')
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
DB_PATH     = os.path.join(BASE_DIR, 'athena.db')

# Model file paths
RF_MODEL_PATH      = os.path.join(MODELS_DIR, 'random_forest.pkl')
SCALER_PATH        = os.path.join(MODELS_DIR, 'scaler.pkl')
CLASS_WEIGHTS_PATH = os.path.join(MODELS_DIR, 'class_weights.pkl')
FEATURE_COLS_PATH  = os.path.join(MODELS_DIR, 'feature_columns.txt')

# Flask
SECRET_KEY         = 'athena-secret-key-2026'
MAX_UPLOAD_MB      = 100
ALLOWED_EXTENSIONS = {'.txt', '.log', '.csv'}

# Risk thresholds (tune these to adjust sensitivity)
RISK_HIGH   = 0.75   # >= this -> Malicious (red)
RISK_MEDIUM = 0.40   # >= this -> Suspicious (yellow), else Normal (green)

PAGE_SIZE   = 100    # requests per page in log table

os.makedirs(UPLOADS_DIR, exist_ok=True)
