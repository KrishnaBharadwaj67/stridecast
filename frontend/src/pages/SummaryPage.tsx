import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useRunStore } from '../stores/runStore';
import { useHistoryStore } from '../stores/historyStore';
import { formatTime, formatDistance, formatPace } from '../utils/formatters';
import { RouteCanvas } from '../components/RouteCanvas';
import type { RunRecord } from '../types';

export function SummaryPage() {
  const navigate = useNavigate();
  const manifest = useSessionStore(state => state.manifest);
  const { elapsed, distance, route, startTime } = useRunStore();
  const addRun = useHistoryStore(state => state.addRun);
  const resetSession = useSessionStore(state => state.reset);
  const resetRun = useRunStore(state => state.reset);
  
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!manifest || elapsed === 0) {
      navigate('/');
    }
  }, [manifest, elapsed, navigate]);

  if (!manifest) return null;

  const avgPace = distance > 0 ? (elapsed / 60) / (distance / 1000) : 0;

  const handleSave = async () => {
    const record: RunRecord = {
      id: crypto.randomUUID(),
      sessionId: manifest.session_id,
      title: manifest.title,
      topic: manifest.topic,
      mood: manifest.mood,
      startedAt: new Date(startTime || Date.now()).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: elapsed,
      distanceMeters: distance,
      avgPaceMinKm: avgPace,
      route,
    };
    
    await addRun(record);
    setSaved(true);
  };

  const handleDone = () => {
    resetSession();
    resetRun();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen p-6 space-y-6">
      <div className="text-center pt-8">
        <h1 className="text-3xl font-bold text-amber-500 mb-2">Run Complete! 🎉</h1>
        <p className="text-lg font-medium">{manifest.title}</p>
        <p className="text-slate-400 text-sm">Topic: {manifest.topic}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded-xl text-center">
          <p className="text-slate-400 text-xs uppercase font-bold mb-1">Distance</p>
          <p className="text-2xl font-bold">{formatDistance(distance)} <span className="text-sm text-slate-400">km</span></p>
        </div>
        <div className="bg-surface p-4 rounded-xl text-center">
          <p className="text-slate-400 text-xs uppercase font-bold mb-1">Time</p>
          <p className="text-2xl font-bold">{formatTime(elapsed)}</p>
        </div>
        <div className="bg-surface p-4 rounded-xl text-center">
          <p className="text-slate-400 text-xs uppercase font-bold mb-1">Avg Pace</p>
          <p className="text-2xl font-bold">{formatPace(avgPace)} <span className="text-sm text-slate-400">/km</span></p>
        </div>
        <div className="bg-surface p-4 rounded-xl text-center">
          <p className="text-slate-400 text-xs uppercase font-bold mb-1">Segments</p>
          <p className="text-2xl font-bold">{manifest.segments.length}</p>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl flex items-center justify-center min-h-[220px]">
        <RouteCanvas route={route} width={300} height={180} />
      </div>

      <div className="mt-auto pt-6 space-y-4">
        {saved ? (
          <div className="space-y-4">
            <p className="text-emerald-500 text-center font-bold flex items-center justify-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Run saved!
            </p>
            <button
              onClick={() => navigate('/history')}
              className="w-full h-14 bg-card hover:bg-surface rounded-2xl font-bold text-lg transition-colors text-amber-500"
            >
              View History
            </button>
          </div>
        ) : (
          <button
            onClick={handleSave}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 rounded-2xl font-bold text-lg text-white transition-colors"
          >
            Save Run
          </button>
        )}
        
        <button
          onClick={handleDone}
          className="w-full h-14 bg-transparent hover:bg-card rounded-2xl font-bold text-lg transition-colors text-slate-300"
        >
          {saved ? 'New Run' : 'Discard & Start New'}
        </button>
      </div>
    </div>
  );
}
