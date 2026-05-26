// ============================================================
// pages/Landing.jsx — Futuristic cybersecurity landing page
// ============================================================

import { useNavigate } from 'react-router-dom';
import {
  Shield, Zap, BarChart3, FileSearch, ChevronRight,
  Lock, Activity, CheckCircle2, ArrowRight
} from 'lucide-react';

const STATS = [
  { value: '97K',    label: 'HTTP requests analysed in training' },
  { value: '95.9%',  label: 'ROC-AUC on benchmark dataset'      },
  { value: '89.3%',  label: 'Attack detection rate (Recall)'    },
  { value: '15',     label: 'Engineered security features'      },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'ML-Powered Detection',
    desc: 'Random Forest classifier trained on 97,000 HTTP requests detects attacks rule-based systems miss — catching patterns, not just signatures.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Dashboard',
    desc: 'Instant visualisation of attack types, risk scores, and suspicious IP addresses. Filter, sort, and drill into every request.',
  },
  {
    icon: FileSearch,
    title: 'Multi-Format Support',
    desc: 'Parses HTTP CSIC block format and Apache Combined Log Format automatically. Upload .txt, .log, or .csv files up to 100 MB.',
  },
  {
    icon: Lock,
    title: 'Hybrid Detection',
    desc: 'Rule-based detection (SQLi, XSS, traversal) runs first. ML then catches the 93.3% of attacks that bypass all signature rules.',
  },
  {
    icon: Activity,
    title: 'Risk Scoring',
    desc: 'Every request gets a probability score from 0 to 1. Malicious (≥0.75), Suspicious (≥0.40), Normal. Fully tunable thresholds.',
  },
  {
    icon: CheckCircle2,
    title: 'Export & Report',
    desc: 'Download analysis results as CSV for spreadsheets or PDF for formal reporting. Full history saved to local database.',
  },
];

const STEPS = [
  { n: '01', title: 'Upload your log file', desc: 'Drag and drop any Apache or CSIC-format web server log. Supports files up to 100 MB.' },
  { n: '02', title: 'ML analysis runs',     desc: 'Parser extracts 15 features per request. Random Forest scores each one in seconds.' },
  { n: '03', title: 'Review the results',   desc: 'Dashboard shows attack breakdown, suspicious IPs, risk distribution, and exportable reports.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center
        bg-dots px-4 py-20">

        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full
          bg-[var(--accent)] opacity-[0.04] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full
          bg-purple-600 opacity-[0.04] blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            border border-[var(--border)] bg-[var(--bg-surface)]
            text-xs text-[var(--text-secondary)] mb-8">
            <span className="neon-dot" style={{width:6,height:6}} />
            Undergraduate FYP — Web Security Research 2026
          </div>

          {/* Logo mark */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-26 h-26 rounded-2xl bg-[var(--accent)] flex
                items-center justify-center shadow-cyber-lg shadow-[var(--accent)]">
                {/* <Shield size={32} className="text-white" /> */}
                <img src="../../public/athena-logo.png" alt="Athena Logo rounded-lg w-26 h-26" />
              </div>
              <div className="absolute inset-0 rounded-2xl
                opacity-20 blur-xl animate-pulse-slow" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight
            text-[var(--text-primary)] mb-4 leading-tight">
            Athena{' '}
            <span className="gradient-text">Log Analyser</span>
            <br />for Web Security
          </h1>

          <p className="text-sm md:text-base text-[var(--text-secondary)]
            max-w-xl mx-auto mb-10 leading-relaxed">
            Athena detects SQL injection, XSS, directory traversal, and
            unauthorized access using machine learning — catching the{' '}
            <span className="text-[var(--accent)] font-semibold">93.3%</span>{' '}
            of attacks that rule-based systems miss.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary text-sm px-6 py-2.5"
            >
              <Zap size={15} />
              Analyse a log file
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => navigate('/model')}
              className="btn-ghost text-sm px-6 py-2.5"
            >
              <BarChart3 size={15} />
              View model performance
            </button>
          </div>

          {/* Scroll hint */}
          <div className="mt-16 flex flex-col items-center gap-2
            text-[var(--text-muted)] text-xs">
            <div className="w-px h-8 bg-gradient-to-b from-[var(--accent)] to-transparent" />
            Scroll to learn more
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.value} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-[var(--accent)]">
                  {s.value}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest
              text-[var(--accent)] mb-2">
              Capabilities
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              Everything you need to detect web attacks
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="glass-card p-5">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg
                  bg-[var(--accent-glow)] border border-[var(--border)] mb-3">
                  <f.icon size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest
              text-[var(--accent)] mb-2">
              Workflow
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              Three steps from log to insight
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-start gap-4">
                {/* Step number + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-9 h-9 rounded-full border border-[var(--accent)]
                    flex items-center justify-center text-xs font-bold
                    text-[var(--accent)] bg-[var(--accent-glow)]">
                    {s.n}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px flex-1 min-h-8 mt-1
                      bg-gradient-to-b from-[var(--accent)] to-transparent opacity-30" />
                  )}
                </div>

                {/* Content */}
                <div className="glass-card flex-1 p-4 mb-4">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ML MODEL PREVIEW ─────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest
                  text-[var(--accent)] mb-2">
                  Research Results
                </p>
                <h2 className="text-lg md:text-xl font-bold
                  text-[var(--text-primary)] mb-3">
                  Random Forest outperforms LSTM and Isolation Forest
                </h2>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  Three ML models were trained and compared on the HTTP CSIC 2010
                  dataset. Random Forest achieved 95.9% ROC-AUC and 89.3% recall,
                  winning across all five evaluation metrics.
                </p>
                <button
                  onClick={() => navigate('/model')}
                  className="btn-ghost text-xs"
                >
                  See full comparison
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Mini results table */}
              <div className="surface-raised overflow-hidden rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="px-3 py-2.5 text-left text-[var(--text-muted)]
                        font-semibold text-[11px] uppercase tracking-wide">
                        Model
                      </th>
                      <th className="px-3 py-2.5 text-right text-[var(--text-muted)]
                        font-semibold text-[11px] uppercase tracking-wide">
                        F1
                      </th>
                      <th className="px-3 py-2.5 text-right text-[var(--text-muted)]
                        font-semibold text-[11px] uppercase tracking-wide">
                        AUC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Random Forest', f1: '78.0%', auc: '95.9%', best: true  },
                      { name: 'LSTM',           f1: '60.1%', auc: '83.9%', best: false },
                      { name: 'Isolation Forest',f1: '54.8%', auc: '81.3%', best: false},
                    ].map(r => (
                      <tr key={r.name}
                        className={`border-b border-[var(--border)] last:border-0
                          ${r.best ? 'bg-[var(--accent-glow)]' : ''}`}>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {r.best && (
                              <span className="w-1.5 h-1.5 rounded-full
                                bg-[var(--accent)] shrink-0" />
                            )}
                            <span className={`font-medium ${
                              r.best
                                ? 'text-[var(--accent)]'
                                : 'text-[var(--text-secondary)]'
                            }`}>
                              {r.name}
                            </span>
                            {r.best && (
                              <span className="text-[10px] text-[var(--accent)]
                                opacity-70 font-normal">
                                in use
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-3 py-2.5 text-right font-mono font-medium
                          ${r.best ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                          {r.f1}
                        </td>
                        <td className={`px-3 py-2.5 text-right font-mono font-medium
                          ${r.best ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                          {r.auc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[var(--bg-surface)]
        border-t border-[var(--border)]">
        <div className="max-w-xl mx-auto text-center">
          <div className="neon-dot mx-auto mb-4" />
          <h2 className="text-lg md:text-xl font-bold
            text-[var(--text-primary)] mb-3">
            Ready to analyse your logs?
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mb-6">
            Upload a log file and get ML-powered attack detection in seconds.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary text-sm px-8 py-2.5"
          >
            <Upload size={15} />
            Get started
          </button>

          {/* Footer note */}
          <p className="mt-12 text-[11px] text-[var(--text-muted)]">
            Athena · Undergraduate FYP · Built with Random Forest, Flask & React
          </p>
        </div>
      </section>

    </div>
  );
}

// Need Upload icon
function Upload({ size, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
