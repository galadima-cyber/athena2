// ============================================================
// pages/Dashboard.jsx — Full-page analysis dashboard
// ============================================================

import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ShieldAlert, ShieldCheck, Activity, AlertTriangle,
  Download, Table2, Shield, ArrowUpRight
} from 'lucide-react';
import { getCsvUrl, getPdfUrl } from '../api/client';

const ATTACK_COLORS = {
  'SQL Injection'       : '#ef4444',
  'XSS'                 : '#f97316',
  'Directory Traversal' : '#8b5cf6',
  'Command Injection'   : '#06b6d4',
  'Unauthorized Access' : '#f59e0b',
  'Anomaly'             : '#6366f1',
  'None'                : '#10b981',
};

const RISK_COLORS = {
  Normal    : '#10b981',
  Suspicious: '#f59e0b',
  Malicious : '#ef4444',
};

// Custom tooltip for charts
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface px-3 py-2 text-xs shadow-lg">
      {label && <p className="text-[var(--text-secondary)] mb-1">{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || p.fill }}
          className="font-medium">
          {p.name}: {typeof p.value === 'number'
            ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ analysisData }) {
  // console.log(analysisData)
  const navigate = useNavigate();

  if (!analysisData) return (
    <div className="min-h-screen flex items-center justify-center
      bg-[var(--bg-base)] px-4">
      <div className="text-center max-w-xs">
        <Shield size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
          No analysis loaded
        </p>
        <p className="text-xs text-[var(--text-secondary)] mb-5">
          Upload a log file to see results here
        </p>
        <button onClick={() => navigate('/upload')} className="btn-primary text-xs">
          Go to Upload
        </button>
      </div>
    </div>
  );

  const { summary, analysis_id } = analysisData;
  const total = summary.total || 1;

  const pieData = Object.entries(summary.attack_counts || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
    // console.log(pieData)

  const barData = [
    { name: 'Normal',     value: summary.normal     || 0 },
    { name: 'Suspicious', value: summary.suspicious || 0 },
    { name: 'Malicious',  value: summary.malicious  || 0 },
  ];

  const attackRate = typeof summary.attack_rate === 'number'
    ? summary.attack_rate
    : (summary.malicious + summary.suspicious) / total * 100;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] animate-fade-in">

      {/* ── Top bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)]
        border-b border-[var(--border)] px-4 md:px-6 h-12
        flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Activity size={14} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-medium text-[var(--text-primary)] truncate">
            {summary.filename}
          </span>
          <span className="hidden sm:inline text-[11px] text-[var(--text-muted)]">
            · {summary.total?.toLocaleString()} requests
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a href={getCsvUrl(analysis_id)}
            className="btn-ghost text-xs py-1 px-2.5 hidden sm:inline-flex">
            <Download size={12} /> CSV
          </a>
          <a href={getPdfUrl(analysis_id)}
            className="btn-ghost text-xs py-1 px-2.5 hidden sm:inline-flex">
            <Download size={12} /> PDF
          </a>
          <button onClick={() => navigate('/logs')}
            className="btn-primary text-xs py-1 px-2.5">
            <Table2 size={12} /> Logs
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="px-4 md:px-6 py-5 max-w-7xl mx-auto">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Total</span>
              <Activity size={14} className="text-[var(--text-muted)]" />
            </div>
            <span className="stat-value">{summary.total?.toLocaleString()}</span>
            <span className="stat-sub">HTTP requests</span>
          </div>

          <div className="stat-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <div className="flex items-center justify-between">
              <span className="stat-label" style={{ color: '#ef4444' }}>Malicious</span>
              <ShieldAlert size={14} style={{ color: '#ef4444', opacity: 0.6 }} />
            </div>
            <span className="stat-value" style={{ color: '#ef4444' }}>
              {summary.malicious?.toLocaleString()}
            </span>
            <span className="stat-sub">
              {((summary.malicious / total) * 100).toFixed(1)}% of total
            </span>
          </div>

          <div className="stat-card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
            <div className="flex items-center justify-between">
              <span className="stat-label" style={{ color: '#f59e0b' }}>Suspicious</span>
              <AlertTriangle size={14} style={{ color: '#f59e0b', opacity: 0.6 }} />
            </div>
            <span className="stat-value" style={{ color: '#f59e0b' }}>
              {summary.suspicious?.toLocaleString()}
            </span>
            <span className="stat-sub">
              {((summary.suspicious / total) * 100).toFixed(1)}% of total
            </span>
          </div>

          <div className="stat-card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
            <div className="flex items-center justify-between">
              <span className="stat-label" style={{ color: '#10b981' }}>Normal</span>
              <ShieldCheck size={14} style={{ color: '#10b981', opacity: 0.6 }} />
            </div>
            <span className="stat-value" style={{ color: '#10b981' }}>
              {summary.normal?.toLocaleString()}
            </span>
            <span className="stat-sub">
              {((summary.normal / total) * 100).toFixed(1)}% of total
            </span>
          </div>
        </div>

        {/* Attack rate bar */}
        <div className="surface mb-5 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Overall attack rate
            </span>
            <span className="text-xs font-bold font-mono"
              style={{ color: attackRate > 30 ? '#ef4444'
                             : attackRate > 10 ? '#f59e0b' : '#10b981' }}>
              {attackRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-[var(--bg-raised)] rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(attackRate, 100)}%`,
                background: attackRate > 30
                  ? '#ef4444' : attackRate > 10 ? '#f59e0b' : '#10b981',
              }}
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
            Model: Random Forest · AUC 95.94% · Threshold: ≥0.75 Malicious, ≥0.40 Suspicious
          </p>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

          {/* Pie chart */}
          <div className="surface p-4">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-4">
              Attack type breakdown
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    dataKey="value" paddingAngle={2}>
                    {pieData.map(e => (
                      <Cell key={e.name}
                        fill={ATTACK_COLORS[e.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center
                text-[var(--text-muted)]">
                <ShieldCheck size={32} style={{ color: '#10b981', opacity: 0.5 }}
                  className="mb-2" />
                <p className="text-xs">No attacks detected</p>
              </div>
            )}
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {pieData.map(e => (
                <div key={e.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: ATTACK_COLORS[e.name] || '#6366f1' }} />
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {e.name} ({e.value.toLocaleString()})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="surface p-4">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-4">
              Risk distribution
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11,
                  fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => v > 999 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {barData.map(e => (
                    <Cell key={e.name} fill={RISK_COLORS[e.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top IPs table */}
        <div className="surface overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]
            flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[var(--text-primary)]">
              Top suspicious IPs
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              Ranked by suspicious request count
            </span>
          </div>

          {summary.top_ips?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>IP Address</th>
                    <th>Requests</th>
                    <th>Attack Types</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {summary.top_ips.map((ip, i) => (
                    <tr key={ip.ip}>
                      <td className="text-[var(--text-muted)] font-mono text-[11px]">
                        {i + 1}
                      </td>
                      <td>
                        <span className="font-mono text-xs
                          text-[var(--text-primary)]">
                          {ip.ip}
                        </span>
                      </td>
                      <td>
                        <span className="badge-malicious">
                          {ip.count.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {ip.attack_types.map(t => (
                            <span key={t} className="text-[11px] px-1.5 py-0.5
                              rounded bg-[var(--bg-hover)]
                              text-[var(--text-secondary)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <ArrowUpRight size={13}
                          className="text-[var(--text-muted)]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-[var(--text-muted)] text-xs">
              No suspicious IPs detected
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
