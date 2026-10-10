import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../stores/historyStore';
import { formatTime, formatDistance, formatPace, formatDate } from '../utils/formatters';

export function HistoryPage() {
  const navigate = useNavigate();
  const { runs, loading, loadRuns } = useHistoryStore();

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  return (
    <div className="flex flex-col min-h-screen p-4 pb-8">
      <div className="flex items-center mb-6 pt-4">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          aria-label="Back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold ml-4">Run History</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-8 h-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 space-y-4 text-slate-400">
          <span className="text-5xl">🏃</span>
          <p>No runs yet. Go touch some grass!</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-amber-500 font-bold hover:underline"
          >
            Start your first run
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map(run => (
            <div key={run.id} className="bg-surface rounded-xl p-4 flex flex-col space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg leading-tight">{run.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{formatDate(run.startedAt)}</p>
                </div>
                <div className="bg-card px-2 py-1 rounded-lg text-xs font-bold capitalize text-amber-500">
                  {run.mood}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-card">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase">Distance</p>
                  <p className="font-medium">{formatDistance(run.distanceMeters)} km</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase">Time</p>
                  <p className="font-medium">{formatTime(run.durationSeconds)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase">Pace</p>
                  <p className="font-medium">{formatPace(run.avgPaceMinKm)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
