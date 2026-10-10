import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SetupPage } from './pages/SetupPage';
import { GeneratingPage } from './pages/GeneratingPage';
import { RunPage } from './pages/RunPage';
import { SummaryPage } from './pages/SummaryPage';
import { HistoryPage } from './pages/HistoryPage';

export default function App() {
  return (
    <BrowserRouter>
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
