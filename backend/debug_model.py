# ============================================================
# debug_model.py — Diagnostic script
# ============================================================
# Run this from athena/backend/ with:
#   python debug_model.py
#
# It will tell us EXACTLY where the prediction is going wrong.

import sys
import os
import pickle
import pandas as pd
import numpy as np

# Add backend folder to path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("="*60)
print("  ATHENA MODEL DIAGNOSTIC")
print("="*60)

# ── Step 1: Load model and scaler ─────────────────────────────
print("\n[1] Loading model files...")
with open('models/random_forest.pkl', 'rb') as f:
    rf_model = pickle.load(f)

with open('models/scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

with open('models/feature_columns.txt', 'r') as f:
    feature_cols = [line.strip() for line in f.readlines()]

print(f"    Model type   : {type(rf_model).__name__}")
print(f"    Feature cols : {feature_cols}")
print(f"    Scaler mean  : {scaler.mean_[:5].round(3)} ... (first 5)")

# ── Step 2: Check if model has feature_names_in_ ─────────────
print("\n[2] Checking model feature names...")
if hasattr(rf_model, 'feature_names_in_'):
    print(f"    Model trained with feature names: {list(rf_model.feature_names_in_)}")
    names_match = list(rf_model.feature_names_in_) == feature_cols
    print(f"    Names match feature_columns.txt: {names_match}")
else:
    print("    Model has NO feature_names_in_ (trained on numpy array)")

# ── Step 3: Test model on known good data from Notebook 02 ───
print("\n[3] Testing model on Notebook 02 training data...")
# Look for the notebook's CSV files
notebook_data_paths = [
    r'..\..\log_analysis_research\data\02_X_test.csv',
    r'..\log_analysis_research\data\02_X_test.csv',
    r'..\..\data\02_X_test.csv',
    r'..\data\02_X_test.csv',
]

X_test_path = None
y_test_path = None
for p in notebook_data_paths:
    if os.path.exists(p):
        X_test_path = p
        y_test_path = p.replace('02_X_test', '02_y_test')
        break

if X_test_path and os.path.exists(X_test_path):
    X_test = pd.read_csv(X_test_path)
    y_test = pd.read_csv(y_test_path).squeeze()
    
    # Predict directly on notebook data (unscaled — same as training)
    probs_direct = rf_model.predict_proba(X_test[feature_cols])[:, 1]
    preds_direct = (probs_direct >= 0.5).astype(int)
    acc_direct   = (preds_direct == y_test.values).mean()
    print(f"    Direct prediction accuracy on test set: {acc_direct:.4f}")
    print(f"    Sample probs (normal rows): {probs_direct[y_test==0][:5].round(4)}")
    print(f"    Sample probs (attack rows): {probs_direct[y_test==1][:5].round(4)}")
    
    # Now test scaler on notebook data
    X_scaled_array = scaler.transform(X_test[feature_cols])
    X_scaled_df    = pd.DataFrame(X_scaled_array, columns=feature_cols)
    probs_scaled   = rf_model.predict_proba(X_scaled_df)[:, 1]
    preds_scaled   = (probs_scaled >= 0.5).astype(int)
    acc_scaled     = (preds_scaled == y_test.values).mean()
    print(f"    Scaled prediction accuracy on test set : {acc_scaled:.4f}")
    print(f"    Sample probs scaled (normal rows): {probs_scaled[y_test==0][:5].round(4)}")
    print(f"    Sample probs scaled (attack rows): {probs_scaled[y_test==1][:5].round(4)}")
else:
    print("    Could not find notebook CSV files.")
    print("    Skipping this test.")
    print("    (Try setting the correct path manually above)")

# ── Step 4: Test feature engineering on a sample request ─────
print("\n[4] Testing feature engineering on sample data...")
from ml.preprocessor import engineer_features

sample_requests = [
    {
        'method'         : 'GET',
        'url'            : '/tienda1/publico/anadir.jsp?idProducto=2&cantidad=14',
        'http_version'   : 'HTTP/1.1',
        'host'           : 'localhost',
        'user_agent'     : 'Mozilla/5.0',
        'content_type'   : '',
        'content_length' : '0',
        'accept'         : 'text/html',
        'accept_language': 'es-es',
        'body'           : '',
    },
    {
        'method'         : 'POST',
        'url'            : '/tienda1/publico/autenticar.jsp',
        'http_version'   : 'HTTP/1.1',
        'host'           : 'localhost',
        'user_agent'     : 'Mozilla/5.0',
        'content_type'   : 'application/x-www-form-urlencoded',
        'content_length' : '27',
        'accept'         : 'text/html',
        'accept_language': 'es-es',
        'body'           : 'login=user&password=password',
    },
]

feat_df, enriched = engineer_features(sample_requests)
print(f"    Computed features for 2 sample NORMAL requests:")
print(feat_df.to_string())

# Scale these sample features
X_sample_scaled_array = scaler.transform(feat_df[feature_cols])
X_sample_scaled       = pd.DataFrame(X_sample_scaled_array, columns=feature_cols)
sample_probs          = rf_model.predict_proba(X_sample_scaled)[:, 1]

print(f"\n    Attack probability for sample normal request 1: {sample_probs[0]:.4f}")
print(f"    Attack probability for sample normal request 2: {sample_probs[1]:.4f}")

if sample_probs[0] > 0.5:
    print("    *** BUG: Normal request classified as attack!")
    print("    *** The scaler or features are wrong.")
else:
    print("    ✓ Normal requests correctly classified.")

# ── Step 5: Compare scaler mean to feature values ────────────
print("\n[5] Scaler statistics (mean values it learned during training):")
for col, mean, std in zip(feature_cols, scaler.mean_, scaler.scale_):
    sample_val = feat_df[col].iloc[0]
    scaled_val = (sample_val - mean) / std
    print(f"    {col:<30} mean={mean:7.3f}  std={std:7.3f}  "
          f"sample={sample_val:7.3f}  scaled={scaled_val:7.3f}")

print("\n[6] Model class probabilities for zero-feature input:")
zero_input = pd.DataFrame([[0]*len(feature_cols)], columns=feature_cols)
zero_scaled_arr = scaler.transform(zero_input)
zero_scaled = pd.DataFrame(zero_scaled_arr, columns=feature_cols)
zero_prob = rf_model.predict_proba(zero_scaled)[0]

print(f"    All-zero input -> Normal prob: {zero_prob[0]:.4f}  Attack prob: {zero_prob[1]:.4f}")
print("\n" + "="*60)
print("  Copy and paste ALL output above back to Claude.")
print("="*60)