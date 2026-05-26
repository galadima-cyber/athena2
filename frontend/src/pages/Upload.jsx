// ============================================================
// pages/Upload.jsx — Full-page upload experience
// ============================================================

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload as UploadIcon, FileText, AlertCircle,
  Loader2, Shield, CheckCircle, X
} from 'lucide-react';
import { analyzeLogFile } from '../api/client';

const STEPS = ['Uploading', 'Parsing requests', 'Engineering features', 'Running ML', 'Saving results'];

export default function Upload({ onAnalysisComplete }) {
  const navigate = useNavigate();
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [step,     setStep]     = useState(-1);
  const [error,    setError]    = useState('');

  const validate = (f) => {
    setError('');
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!['.txt','.log','.csv'].includes(ext))
      return setError('Invalid file type. Use .txt, .log, or .csv');
    if (f.size > 100 * 1024 * 1024)
      return setError('File too large. Maximum 100 MB.');
    setFile(f);
  };

  const onDragOver  = useCallback(e => { e.preventDefault(); setDragging(true);  }, []);
  const onDragLeave = useCallback(()  => setDragging(false), []);
  const onDrop      = useCallback(e   => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files[0]) validate(e.dataTransfer.files[0]);
  }, []);

  const runAnalysis = async () => {
    if (!file || loading) return;
    setLoading(true); setError('');

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    try {
      for (let i = 0; i < STEPS.length - 1; i++) {
        setStep(i);
        await delay(i === 3 ? 800 : 400);
      }
      const results = await analyzeLogFile(file);
      setStep(STEPS.length - 1);
      await delay(300);
      onAnalysisComplete(results);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Is the backend running on port 5000?');
      setLoading(false); setStep(-1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center
      px-4 py-12 bg-[var(--bg-base)] bg-dots">

      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2
        w-80 h-80 bg-[var(--accent)] opacity-[0.04] blur-3xl
        rounded-full pointer-events-none" />

      <div className="relative w-full max-w-lg animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8 ">
          <div className="inline-flex items-center justify-center w-12 h-12
            rounded-xl bg-[var(--accent)] mb-4 shadow-cyber">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">
            Analyse a Log File
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Upload an HTTP server log to detect attacks with ML
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !loading && document.getElementById('fi').click()}
          className={`
            relative rounded-xl border-2 border-dashed p-10
            flex flex-col items-center justify-center text-center
            cursor-pointer transition-all duration-200 mb-4
            ${dragging
              ? 'border-[var(--accent)] bg-[var(--accent-glow)] scale-[1.01]'
              : file
              ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
              : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
            }
            ${loading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input id="fi" type="file" accept=".txt,.log,.csv"
            className="hidden" onChange={e => e.target.files[0] && validate(e.target.files[0])} />

          {file ? (
            <>
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] border
                border-[var(--accent)] flex items-center justify-center mb-3">
                <FileText size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={e => { e.stopPropagation(); setFile(null); setError(''); }}
                className="mt-3 flex items-center gap-1 text-[11px]
                  text-[var(--text-muted)] hover:text-red-400 transition-colors"
              >
                <X size={12} /> Remove
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg border border-[var(--border)]
                bg-[var(--bg-raised)] flex items-center justify-center mb-3">
                <UploadIcon size={20} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-0.5">
                Drop your log file here
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                or click to browse · .txt .log .csv · max 100 MB
              </p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30
            bg-red-500/10 px-3.5 py-2.5 mb-4 text-red-400 text-xs animate-fade-in">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Progress steps */}
        {loading && (
          <div className="surface mb-4 p-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center
                    justify-center shrink-0 transition-all ${
                    i < step
                      ? 'bg-[var(--accent)]'
                      : i === step
                      ? 'border border-[var(--accent)] bg-[var(--accent-glow)]'
                      : 'border border-[var(--border)] bg-[var(--bg-raised)]'
                  }`}>
                    {i < step && <CheckCircle size={10} className="text-white" />}
                    {i === step && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]
                        animate-pulse" />
                    )}
                  </div>
                  <span className={`text-xs ${
                    i <= step
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)]'
                  }`}>
                    {s}
                    {i === step && '...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyse button */}
        <button
          onClick={runAnalysis}
          disabled={!file || loading}
          className="btn-primary w-full justify-center py-2.5 text-sm"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" />Analysing...</>
            : <><Shield size={16} />Run ML Analysis</>
          }
        </button>

        {/* Format info */}
        <div className="mt-5 surface-raised px-4 py-3">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]
            uppercase tracking-wide mb-2">
            Supported formats
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              'HTTP CSIC 2010 block format',
              'Apache Combined Log Format',
              'Nginx access logs',
              'Custom .log / .txt files',
            ].map(f => (
              <div key={f} className="flex items-center gap-1.5
                text-xs text-[var(--text-secondary)]">
                <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
