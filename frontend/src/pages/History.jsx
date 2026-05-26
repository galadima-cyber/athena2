// ============================================================
// pages/History.jsx — Past analyses with load-back support
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, FileText, ChevronRight, Loader2,
  ShieldAlert, ShieldCheck, AlertTriangle, Database
} from 'lucide-react';
import { getHistory, getAnalysis, clearHistory } from '../api/client';

export default function History({ onLoadAnalysis }) {
  const navigate  = useNavigate();
  const [analyses,  setAnalyses]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [error,     setError]     = useState('');

  useEffect(() => {
    getHistory()
      .then(d => setAnalyses(d.analyses || []))
      .catch(() => setError('Could not reach backend. Is Flask running on port 5000?'))
      .finally(() => setLoading(false));
  }, []);

  const handleLoad = async (id) => {
    setLoadingId(id);
    try {
      const data = await getAnalysis(id, 1, 'All');
      let summaryJson = {};
      try { summaryJson = JSON.parse(data.summary.summary_json || '{}'); } catch {}

      // Prefer stored summary_json values (contains accurate malicious/suspicious counts)
      const s = summaryJson || {};
      const malicious = s.malicious ?? data.summary.total_attacks;
      const suspicious = s.suspicious ?? (data.summary.total_attacks - (s.malicious ?? 0)) ?? 0;
      const normal = s.normal ?? data.summary.total_normal;
      const attack_rate = (s.attack_rate !== undefined)
        ? s.attack_rate
        : (data.summary.attack_rate * 100);

      onLoadAnalysis({
        analysis_id: id,
        summary: {
          filename     : s.filename || data.summary.filename,
          total        : s.total || data.summary.total_requests,
          malicious    : malicious,
          suspicious   : suspicious,
          normal       : normal,
          attack_rate  : attack_rate,
          attack_counts: s.attack_counts || {},
          top_ips      : s.top_ips || [],
        },
        requests: data.requests,
      });
      navigate('/dashboard');
    } catch {
      setError(`Could not load analysis #${id}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all saved analyses? This cannot be undone.')) return;
    try {
      await clearHistory();
      setAnalyses([]);
    } catch {
      setError('Could not clear history.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Loader2 size={16} className="animate-spin" />
        Loading history...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)]
        border-b border-[var(--border)] px-4 md:px-6 h-12
        flex items-center gap-2 justify-between">
        <Database size={14} style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          History
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">
          · {analyses.length} saved analyses
        </span>
        <div className="ml-3 flex items-center gap-2">
          <button onClick={handleClear}
            className="btn-ghost text-xs py-1 px-2.5">
            Clear
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 py-5 max-w-3xl mx-auto">

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10
            px-3.5 py-2.5 mb-4 text-red-400 text-xs">
            {error}
          </div>
        )}

        {analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center
            py-24 text-center">
            <Clock size={36} className="text-[var(--text-muted)] mb-3" />
            <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
              No analyses yet
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Upload a log file to get started
            </p>
            <button onClick={() => navigate('/upload')}
              className="btn-primary text-xs">
              Upload log file
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {analyses.map(a => {
              const rate    = (a.attack_rate * 100).toFixed(1);
              const isHigh  = a.attack_rate > 0.3;
              const isMed   = a.attack_rate > 0.1;
              const color   = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';
              const Icon    = isHigh || isMed ? ShieldAlert : ShieldCheck;

              return (
                <div key={a.id} className="glass-card p-4">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center
                        justify-center shrink-0"
                        style={{ background: `${color}15`,
                                 border: `1px solid ${color}30` }}>
                        <Icon size={15} style={{ color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold
                          text-[var(--text-primary)] truncate">
                          {a.filename}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]
                          flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {a.upload_time}
                          <span className="opacity-50">·</span>
                          ID #{a.id}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLoad(a.id)}
                      disabled={loadingId === a.id}
                      className="btn-ghost text-xs py-1 px-2.5 shrink-0
                        disabled:opacity-50">
                      {loadingId === a.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <ChevronRight size={12} />
                      }
                      {loadingId === a.id ? 'Loading' : 'View'}
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { label: 'Total',   value: a.total_requests.toLocaleString(),
                        c: 'text-[var(--text-primary)]' },
                      { label: 'Attacks', value: a.total_attacks.toLocaleString(),
                        c: 'text-red-400' },
                      { label: 'Normal',  value: a.total_normal.toLocaleString(),
                        c: 'text-emerald-400' },
                      { label: 'Rate',    value: `${rate}%`,
                        c: `${isHigh ? 'text-red-400' : isMed ? 'text-amber-400' : 'text-emerald-400'}` },
                    ].map(s => (
                      <div key={s.label} className="text-center
                        bg-[var(--bg-raised)] rounded-lg px-2 py-2">
                        <p className={`text-sm font-bold font-mono ${s.c}`}>
                          {s.value}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Attack rate bar */}
                  <div>
                    <div className="w-full bg-[var(--bg-raised)] rounded-full h-1">
                      <div className="h-1 rounded-full transition-all"
                        style={{
                          width: `${Math.min(parseFloat(rate), 100)}%`,
                          background: color,
                        }} />
                    </div>
                    <div className="flex justify-between text-[10px]
                      text-[var(--text-muted)] mt-1">
                      <span>{a.model_used}</span>
                      <span>Top: {a.top_attack_type || 'None'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
