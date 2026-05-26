// ============================================================
// pages/ModelInfo.jsx — ML research results display
// ============================================================

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell
} from 'recharts';
import { Award, Brain, Info, TrendingUp, Layers } from 'lucide-react';

const MODELS = [
  {
    name     : 'Random Forest',
    type     : 'Supervised',
    accuracy : 0.8700, precision: 0.6926,
    recall   : 0.8929, f1: 0.7801, auc: 0.9594,
    color    : '#00b4d8',
    caught   : 4476, missed: 537,
    note     : 'Active model — best across all 5 metrics',
    active   : true,
  },
  {
    name     : 'LSTM',
    type     : 'Supervised',
    accuracy : 0.7820, precision: 0.5698,
    recall   : 0.6357, f1: 0.6010, auc: 0.8385,
    color    : '#7c3aed',
    caught   : 3187, missed: 1826,
    note     : 'Neural network — better for raw sequential logs',
    active   : false,
  },
  {
    name     : 'Isolation Forest',
    type     : 'Unsupervised',
    accuracy : 0.7671, precision: 0.5492,
    recall   : 0.5464, f1: 0.5478, auc: 0.8134,
    color    : '#f59e0b',
    caught   : 2739, missed: 2274,
    note     : 'No labels needed — detects zero-day attacks',
    active   : false,
  },
];

const METRICS = ['accuracy','precision','recall','f1','auc'];
const M_LABELS = {
  accuracy:'Accuracy', precision:'Precision',
  recall:'Recall', f1:'F1', auc:'AUC'
};

const radarData = METRICS.map(m => ({
  m: M_LABELS[m],
  RF : MODELS[0][m],
  LSTM: MODELS[1][m],
  ISO : MODELS[2][m],
}));

const barData = MODELS.map(m => ({
  name: m.name === 'Isolation Forest' ? 'ISO Forest' : m.name,
  Accuracy : m.accuracy,
  Recall   : m.recall,
  'F1'     : m.f1,
  AUC      : m.auc,
  color    : m.color,
}));

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface px-3 py-2 text-xs shadow-lg">
      {label && <p className="text-[var(--text-muted)] mb-1">{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || p.fill }}
          className="font-medium">
          {p.name}: {(p.value * 100).toFixed(1)}%
        </p>
      ))}
    </div>
  );
};

const FEATURES = [
  { group:'Statistical', color:'#00b4d8', items:[
    'url_length — longer URLs signal attacks',
    'body_length — large bodies carry payloads',
    'num_params — more params = more surface',
    'num_special_chars_url',
    'content_length_val',
  ]},
  { group:'Attack Flags', color:'#ef4444', items:[
    'has_sqli — SQL injection detected',
    'sqli_match_count',
    'has_xss — XSS pattern detected',
    'xss_match_count',
    'has_traversal — path manipulation',
  ]},
  { group:'Request Props', color:'#10b981', items:[
    'has_body',
    'has_cmd_injection',
    'accesses_sensitive_path',
    'method_encoded (GET/POST/PUT…)',
    '2.9:1 imbalance → class weighting',
  ]},
];

export default function ModelInfo() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)]
        border-b border-[var(--border)] px-4 md:px-6 h-12
        flex items-center gap-2">
        <Brain size={14} style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          ML Model Performance
        </span>
      </div>

      <div className="px-4 md:px-6 py-5 max-w-5xl mx-auto">

        {/* Key finding */}
        <div className="rounded-lg border border-[var(--border)]
          bg-[var(--bg-surface)] px-4 py-3.5 mb-5 flex items-start gap-3">
          <Info size={15} style={{ color: 'var(--accent)' }}
            className="mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">
              Key Research Finding
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Rule-based detection caught only{' '}
              <span className="text-[var(--accent)] font-semibold">6.7%</span>{' '}
              of attacks (1,670 / 25,065). The remaining{' '}
              <span className="font-semibold" style={{ color: '#ef4444' }}>93.3%</span>{' '}
              were missed by all signature rules — proving that ML
              is required to detect statistically anomalous patterns.
            </p>
          </div>
        </div>

        {/* Model cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {MODELS.map(m => (
            <div key={m.name}
              className={`glass-card p-4 ${m.active
                ? 'ring-1 ring-[var(--accent)] ring-offset-0' : ''}`}>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {m.name}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded mt-0.5
                    inline-block font-medium ${
                    m.type === 'Supervised'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'}`}>
                    {m.type}
                  </span>
                </div>
                {m.active && (
                  <span className="flex items-center gap-1 text-[10px]
                    font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${m.color}20`, color: m.color }}>
                    <Award size={10} /> Active
                  </span>
                )}
              </div>

              {/* Metric bars */}
              <div className="space-y-1.5 mb-3">
                {METRICS.map(met => (
                  <div key={met} className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)] w-14 shrink-0">
                      {M_LABELS[met]}
                    </span>
                    <div className="flex-1 bg-[var(--bg-raised)] rounded-full h-1">
                      <div className="h-1 rounded-full"
                        style={{ width:`${m[met]*100}%`, background: m.color }} />
                    </div>
                    <span className="text-[10px] font-mono font-medium w-8 text-right"
                      style={{ color: m.color }}>
                      {(m[met]*100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Caught / missed */}
              <div className="border-t border-[var(--border)] pt-2.5
                flex gap-3 text-center">
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-400 font-mono">
                    {m.caught.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">caught</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-400 font-mono">
                    {m.missed.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">missed</p>
                </div>
              </div>

              <p className="text-[10px] text-[var(--text-muted)] mt-2 italic
                leading-relaxed">
                {m.note}
              </p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

          {/* Radar */}
          <div className="surface p-4">
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-4">
              Radar comparison
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="m"
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <PolarRadiusAxis domain={[0,1]} tick={false} />
                {MODELS.map(m => (
                  <Radar key={m.name}
                    name={m.name}
                    dataKey={m.name === 'Random Forest' ? 'RF'
                           : m.name === 'LSTM' ? 'LSTM' : 'ISO'}
                    stroke={m.color} fill={m.color} fillOpacity={0.1}
                    strokeWidth={1.5} />
                ))}
                <Tooltip content={<ChartTip />} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {MODELS.map(m => (
                <div key={m.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full"
                    style={{ background: m.color }} />
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="surface p-4">
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-4">
              Metric comparison
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}
                margin={{ top: 5, right: 5, bottom: 5 }}>
                <XAxis dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  axisLine={false} tickLine={false} />
                <YAxis domain={[0,1]}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                <Tooltip content={<ChartTip />}
                  cursor={{ fill: 'var(--bg-hover)' }} />
                {['Accuracy','Recall','F1','AUC'].map((key, i) => (
                  <Bar key={key} dataKey={key} radius={[3,3,0,0]}
                    fill={['#00b4d8','#10b981','#f59e0b','#8b5cf6'][i]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dataset info + features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

          {/* Dataset */}
          <div className="surface p-4">
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-3
              flex items-center gap-1.5">
              <TrendingUp size={13} style={{ color:'var(--accent)' }} />
              Training Dataset — HTTP CSIC 2010
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label:'Total requests', value:'97,065',  c:'text-[var(--accent)]' },
                { label:'Normal (0)',     value:'72,000',  c:'text-emerald-400' },
                { label:'Attack (1)',     value:'25,065',  c:'text-red-400' },
                { label:'Features',      value:'15',       c:'text-purple-400' },
              ].map(s => (
                <div key={s.label}
                  className="bg-[var(--bg-raised)] rounded-lg px-3 py-2.5 text-center">
                  <p className={`text-base font-bold font-mono ${s.c}`}>
                    {s.value}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Train / Test split</span>
                <span className="font-mono">80% / 20% stratified</span>
              </div>
              <div className="flex justify-between">
                <span>Class imbalance</span>
                <span className="font-mono">2.9:1 → class weighting</span>
              </div>
              <div className="flex justify-between">
                <span>Attack weight</span>
                <span className="font-mono">1.94 (vs 0.67 normal)</span>
              </div>
              <div className="flex justify-between">
                <span>URL decode</span>
                <span className="font-mono">Double-pass (%27 → ')</span>
              </div>
            </div>
          </div>

          {/* Why RF wins */}
          <div className="surface p-4">
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-3
              flex items-center gap-1.5">
              <Award size={13} style={{ color:'var(--accent)' }} />
              Why Random Forest is best here
            </p>
            <div className="space-y-2.5 text-xs text-[var(--text-secondary)]
              leading-relaxed">
              <p>
                <span className="text-[var(--text-primary)] font-medium">
                  vs LSTM:
                </span>{' '}
                Random Forest outperforms LSTM on structured tabular data with
                engineered features. LSTM excels with raw sequential text, not
                pre-extracted feature vectors.
              </p>
              <p>
                <span className="text-[var(--text-primary)] font-medium">
                  vs Isolation Forest:
                </span>{' '}
                Isolation Forest uses no labels and detected 54.6% of attacks.
                Its value is in zero-label deployments and zero-day detection,
                not raw accuracy.
              </p>
              <p>
                <span className="text-[var(--text-primary)] font-medium">
                  No scaling needed:
                </span>{' '}
                RF uses decision tree splits — scale-invariant. Applying
                StandardScaler caused all requests to be classified as attacks.
                RF receives raw feature values directly.
              </p>
            </div>
          </div>
        </div>

        {/* Feature groups */}
        <div className="surface p-4">
          <p className="text-xs font-semibold text-[var(--text-primary)] mb-3
            flex items-center gap-1.5">
            <Layers size={13} style={{ color: 'var(--accent)' }} />
            15 Engineered Features
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FEATURES.map(g => (
              <div key={g.group}>
                <p className="text-[11px] font-semibold mb-2"
                  style={{ color: g.color }}>
                  {g.group}
                </p>
                <ul className="space-y-1">
                  {g.items.map(f => (
                    <li key={f}
                      className="text-[11px] text-[var(--text-secondary)]
                        flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full shrink-0"
                        style={{ background: g.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
