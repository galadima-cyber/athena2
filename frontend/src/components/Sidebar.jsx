// ============================================================
// components/Sidebar.jsx
// Desktop: Fixed left sidebar (220px expanded, 56px icon-only on md)
// Mobile:  Fixed bottom navigation bar
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield, Upload, LayoutDashboard, Table2, History,
  Brain, Sun, Moon, ChevronRight, Menu, X
} from 'lucide-react';

const NAV = [
  { to: '/',          label: 'Home',      icon: Shield         },
  { to: '/upload',    label: 'Upload',    icon: Upload         },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
  { to: '/logs',      label: 'Log Table', icon: Table2         },
  { to: '/history',   label: 'History',   icon: History        },
  { to: '/model',     label: 'ML Model',  icon: Brain          },
];

export default function Sidebar({ theme, toggleTheme }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Keep a CSS variable updated so page content can shift
  useEffect(() => {
    const val = expanded ? 'var(--sidebar-w)' : 'var(--sidebar-icon)';
    document.documentElement.style.setProperty('--sidebar-current-width', val);
    return () => {
      /* leave value in place */
    };
  }, [expanded]);

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────── */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          width: expanded ? 'var(--sidebar-w)' : 'var(--sidebar-icon)',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
        className="
          hidden md:flex flex-col fixed left-0 top-0 h-screen z-40
          bg-[var(--bg-surface)] border-r border-[var(--border)]
          overflow-hidden
        "
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-3.5 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg
            bg-[var(--accent)] shrink-0">
            {/* <Shield size={16} className="text-white" /> */}
            <img src="../../public/athena-logo.png" alt="Athena Logo rounded-lg w-8 h-8" />
          </div>
          {expanded && (
            <span className="ml-2.5 font-semibold text-sm text-[var(--text-primary)]
              whitespace-nowrap animate-fade-in">
              Athena
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-1.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`
                  flex items-center gap-2.5 rounded-lg px-2.5 py-2
                  text-xs font-medium transition-all duration-150
                  whitespace-nowrap relative
                  ${active
                    ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2
                    w-0.5 h-4 rounded-r bg-[var(--accent)]" />
                )}
                <Icon size={16} className="shrink-0" />
                {expanded && (
                  <span className="animate-fade-in">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: theme toggle */}
        <div className="p-1.5 border-t border-[var(--border)] shrink-0">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2
              text-xs font-medium text-[var(--text-secondary)]
              hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]
              transition-all whitespace-nowrap"
          >
            {theme === 'dark'
              ? <Sun size={16} className="shrink-0" />
              : <Moon size={16} className="shrink-0" />
            }
            {expanded && (
              <span className="animate-fade-in">
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────── */}
      <nav className="
        md:hidden fixed bottom-0 left-0 right-0 z-40
        bg-[var(--bg-surface)] border-t border-[var(--border)]
        flex items-center justify-around px-1 h-16
      ">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`
                flex flex-col items-center gap-0.5 px-2 py-1.5
                rounded-lg flex-1 max-w-16 transition-colors
                ${active
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-muted)]'
                }
              `}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label}</span>
              {active && (
                <span className="absolute bottom-1 w-4 h-0.5 rounded-full
                  bg-[var(--accent)]" />
              )}
            </Link>
          );
        })}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5
            rounded-lg flex-1 max-w-16 text-[var(--text-muted)]
            transition-colors hover:text-[var(--text-primary)]"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span className="text-[10px] font-medium">Theme</span>
        </button>
      </nav>
    </>
  );
}
