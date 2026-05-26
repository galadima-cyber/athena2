// ============================================================
// pages/LogTable.jsx — Filterable, sortable request table
// ============================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronUp, ChevronDown,
  Shield, X, ChevronDown as Expand
} from 'lucide-react';

const FILTERS = ['All', 'Malicious', 'Suspicious', 'Normal'];

const BADGE = {
  Malicious : 'badge-malicious',
  Suspicious: 'badge-suspicious',
  Normal    : 'badge-normal',
  Anomaly   : 'badge-anomaly',
};

const METHOD_COLOR = {
  GET   : 'text-emerald-400 bg-emerald-400/10',
  POST  : 'text-blue-400 bg-blue-400/10',
  PUT   : 'text-amber-400 bg-amber-400/10',
  DELETE: 'text-red-400 bg-red-400/10',
};

export default function LogTable({ analysisData }) {
  const navigate = useNavigate();
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');
  const [sort,     setSort]     = useState({ field: 'risk_score', dir: 'desc' });
  const [expanded, setExpanded] = useState(null);
  const [page,     setPage]     = useState(1);
  const PAGE = 100;

  const rows = useMemo(() => {
    if (!analysisData?.requests) return [];
    let r = [...analysisData.requests];
    if (filter !== 'All') r = r.filter(x => x.risk_label === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x =>
        x.url?.toLowerCase().includes(q) ||
        x.method?.toLowerCase().includes(q) ||
        x.attack_type?.toLowerCase().includes(q)
      );
    }
    r.sort((a, b) => {
      const av = a[sort.field] ?? '';
      const bv = b[sort.field] ?? '';
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return r;
  }, [analysisData, filter, search, sort]);

  const pages    = Math.ceil(rows.length / PAGE);
  const pageRows = rows.slice((page - 1) * PAGE, page * PAGE);

  const toggleSort = (field) => {
    setSort(s => s.field === field
      ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'desc' }
    );
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sort.field !== field) return (
      <ChevronDown size={11} className="opacity-30 inline ml-0.5" />
    );
    return sort.dir === 'asc'
      ? <ChevronUp   size={11} className="inline ml-0.5 text-[var(--accent)]" />
      : <ChevronDown size={11} className="inline ml-0.5 text-[var(--accent)]" />;
  };

  if (!analysisData) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="text-center">
        <Shield size={36} className="text-[var(--text-muted)] mx-auto mb-3" />
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
          No data loaded
        </p>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Run an analysis first
        </p>
        <button onClick={() => navigate('/upload')} className="btn-primary text-xs">
          Upload log file
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)]
        border-b border-[var(--border)] px-4 md:px-6 h-12
        flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          Log Table
          <span className="ml-2 text-[var(--text-muted)] font-normal">
            {rows.length.toLocaleString()} requests
          </span>
        </span>

        {/* Filter pills */}
        <div className="hidden sm:flex items-center gap-1 ">
          {FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium
                transition-colors ${filter === f
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search + mobile filter */}
      <div className="px-4 md:px-6 py-3 border-b border-[var(--border)]
        bg-[var(--bg-surface)] flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-0" style={{ minWidth: 160 }}>
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2
            text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search URL, method, attack type..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="field pl-8 h-8 text-xs"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2
                text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Mobile filter */}
        <div className="sm:hidden flex items-center gap-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-medium
                transition-colors ${filter === f
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-raised)] text-[var(--text-secondary)]'
                }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 md:px-6 py-3">
        <table className="data-table">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                ['#',           'id',          'w-10'],
                ['Method',      'method',      'w-20'],
                ['URL',         'url',         ''],
                ['Score',       'risk_score',  'w-28'],
                ['Label',       'risk_label',  'w-28'],
                ['Attack',      'attack_type', 'w-36 hidden md:table-cell'],
              ].map(([label, field, cls]) => (
                <th key={field}
                  className={cls}
                  onClick={() => toggleSort(field)}>
                  {label}<SortIcon field={field} />
                </th>
              ))}
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center
                  text-xs text-[var(--text-muted)]">
                  No requests match this filter
                </td>
              </tr>
            ) : pageRows.map(row => (
              <React.Fragment key={row.id}>
                <tr
                  className={`
                    ${row.risk_label === 'Malicious'
                      ? 'bg-red-500/[0.03]'
                      : row.risk_label === 'Suspicious'
                      ? 'bg-amber-500/[0.03]' : ''}
                  `}>

                  {/* # */}
                  <td className="font-mono text-[11px] text-[var(--text-muted)]">
                    {row.id}
                  </td>

                  {/* Method */}
                  <td>
                    <span className={`font-mono text-[11px] font-semibold
                      px-1.5 py-0.5 rounded
                      ${METHOD_COLOR[row.method] || 'text-[var(--text-muted)] bg-[var(--bg-hover)]'}`}>
                      {row.method}
                    </span>
                  </td>

                  {/* URL */}
                  <td className="max-w-xs">
                    <span className="font-mono text-[11px] text-[var(--text-secondary)]
                      truncate block" title={row.url}>
                      {row.url}
                    </span>
                  </td>

                  {/* Score */}
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1 rounded-full bg-[var(--bg-hover)]">
                        <div className="h-1 rounded-full"
                          style={{
                            width: `${row.risk_score * 100}%`,
                            background: row.risk_score >= 0.75
                              ? '#ef4444'
                              : row.risk_score >= 0.40
                              ? '#f59e0b' : '#10b981',
                          }} />
                      </div>
                      <span className="font-mono text-[11px]
                        text-[var(--text-secondary)]">
                        {row.risk_score.toFixed(3)}
                      </span>
                    </div>
                  </td>

                  {/* Label */}
                  <td>
                    <span className={BADGE[row.risk_label] || 'badge-normal'}>
                      {row.risk_label}
                    </span>
                  </td>

                  {/* Attack type */}
                  <td className="hidden md:table-cell">
                    {row.attack_type && row.attack_type !== 'None' ? (
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {row.attack_type}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)]">—</span>
                    )}
                  </td>

                  {/* Expand */}
                  <td>
                    <button
                      onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                      className="text-[var(--text-muted)] hover:text-[var(--accent)]
                        transition-colors p-1 rounded">
                      <Expand size={13}
                        className={`transition-transform ${
                          expanded === row.id ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                </tr>

                {/* Expanded detail */}
                {expanded === row.id && (
                  <tr key={`${row.id}-exp`}>
                    <td colSpan={7}
                      className="bg-[var(--bg-raised)] px-4 py-3
                        border-b border-[var(--border)]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-[11px] text-[var(--text-muted)]
                            mb-1 uppercase tracking-wide font-medium">
                            Full URL
                          </p>
                          <p className="font-mono text-[var(--accent)]
                            break-all leading-relaxed">
                            {row.url || '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[var(--text-muted)]
                            mb-1 uppercase tracking-wide font-medium">
                            Request Body
                          </p>
                          <p className="font-mono text-amber-400 break-all
                            leading-relaxed">
                            {row.body || '(empty)'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {[
                            ['URL length', row.url_length],
                            ['Params',     row.num_params],
                            ['Body len',  row.body_length],
                          ].map(([l, v]) => (
                            <div key={l}>
                              <span className="text-[var(--text-muted)]">{l}: </span>
                              <span className="font-mono text-[var(--text-primary)]
                                font-medium">{v}</span>
                            </div>
                          ))}
                          {[
                            ['SQLi',     row.has_sqli],
                            ['XSS',      row.has_xss],
                            ['Traversal',row.has_traversal],
                          ].map(([l, v]) => (
                            <div key={l}>
                              <span className="text-[var(--text-muted)]">{l}: </span>
                              <span className={`font-mono font-bold ${
                                v ? 'text-red-400' : 'text-emerald-400'}`}>
                                {v ? 'YES' : 'no'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-surface)]
          px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)]">
            Page {page} of {pages} · {rows.length.toLocaleString()} results
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1} className="btn-ghost text-xs py-1 px-2">
              Prev
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages} className="btn-ghost text-xs py-1 px-2">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
