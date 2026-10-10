import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { SetupPage } from './pages/SetupPage';
import { GeneratingPage } from './pages/GeneratingPage';
import { RunPage } from './pages/RunPage';
import { SummaryPage } from './pages/SummaryPage';
import { HistoryPage } from './pages/HistoryPage';

function NavigationBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__navigate = navigate;
    }
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <NavigationBridge />
      <div className="min-h-[100dvh] bg-[#0f1419] text-slate-100 max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/generating" element={<GeneratingPage />} />
          <Route path="/run" element={<RunPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
