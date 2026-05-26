// ============================================================
// App.jsx — Root with theme management + routing
// ============================================================

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar    from './components/Sidebar';
import Landing    from './pages/Landing';
import Upload     from './pages/Upload';
import Dashboard  from './pages/Dashboard';
import LogTable   from './pages/LogTable';
import History    from './pages/History';
import ModelInfo  from './pages/ModelInfo';

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);

  // ── Theme ─────────────────────────────────────────────────
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('athena-theme') || 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('athena-theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <BrowserRouter>
      <div className="page-shell">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <main className="page-content">
          <Routes>
            <Route path="/"          element={<Landing />} />
            <Route path="/upload"    element={
              <Upload onAnalysisComplete={setAnalysisData} />
            } />
            <Route path="/dashboard" element={
              <Dashboard analysisData={analysisData} />
            } />
            <Route path="/logs"      element={
              <LogTable analysisData={analysisData} />
            } />
            <Route path="/history"   element={
              <History onLoadAnalysis={setAnalysisData} />
            } />
            <Route path="/model"     element={<ModelInfo />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
