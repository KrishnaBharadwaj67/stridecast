import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useRunStore } from '../stores/runStore';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useWakeLock } from '../hooks/useWakeLock';
import { formatTime, formatDistance, formatPace } from '../utils/formatters';

export function RunPage() {
  const navigate = useNavigate();
  const manifest = useSessionStore(state => state.manifest);
  const {
    status, elapsed, distance, currentPace,
    startRun, pauseRun, resumeRun, finishRun, updateGps, updateElapsed
  } = useRunStore();
  
  const gps = useGeolocation();
  const audio = useAudioPlayer(manifest, gps.currentPace);
  const wakeLock = useWakeLock();

  // Redirect if no manifest
  useEffect(() => {
    if (!manifest) navigate('/');
  }, [manifest, navigate]);

  // Sync GPS updates to store
  useEffect(() => {
    if (status === 'running') {
      updateGps(gps.distance, gps.currentPace, gps.points);
    }
  }, [gps.distance, gps.currentPace, gps.points, status, updateGps]);

  // Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === 'running') {
      interval = setInterval(() => {
        updateElapsed(useRunStore.getState().elapsed + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, updateElapsed]);

  const handleStart = () => {
    wakeLock.request();
    gps.start();
    startRun();
    // Start audio on user interaction for iOS
    audio.play();
  };

  const handlePause = () => {
    pauseRun();
    audio.pause();
  };

  const handleResume = () => {
    resumeRun();
    audio.resume();
  };

  const handleStop = () => {
    gps.stop();
    audio.stop();
    wakeLock.release();
    finishRun();
    navigate('/summary');
  };

  if (!manifest) return null;

  return (
    <div className="flex flex-col min-h-screen p-6 pb-12 bg-base">
      <div className="text-center pt-4">
        <p className="text-slate-400 text-sm font-medium">Elapsed Time</p>
        <p className="text-2xl font-bold">{formatTime(elapsed)}</p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-12 my-8">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Distance</p>
          <p className="text-7xl font-bold tracking-tight text-amber-500">
            {formatDistance(distance)} <span className="text-3xl text-amber-500/70">km</span>
          </p>
        </div>

        <div className="text-center">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Current Pace</p>
          <p className="text-5xl font-bold text-slate-100">
            {currentPace ? formatPace(currentPace) : '--:--'} <span className="text-xl text-slate-400">/km</span>
          </p>
        </div>

        {/* Audio Progress */}
        {(() => {
          const currentProgress = audio.progress > 0 
            ? audio.progress 
            : (manifest && manifest.total_duration_seconds > 0 ? Math.min(1, elapsed / manifest.total_duration_seconds) : 0);
          const currentSeg = audio.progress > 0
            ? audio.currentSegment + 1
            : Math.min(manifest.segments.length, Math.max(1, Math.floor(currentProgress * manifest.segments.length) + 1));
          return (
            <div className="space-y-2 px-4">
              <div className="h-1.5 bg-card rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min(100, Math.max(0, currentProgress * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-400">
                <span>
                  {audio.isNudgePlaying ? (
                    <span className="text-amber-400 animate-pulse font-bold">🎯 Pace Coach Speaking...</span>
                  ) : (
                    `Segment ${currentSeg} of ${manifest.segments.length}`
                  )}
                </span>
                <span>{Math.round(currentProgress * 100)}%</span>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="mt-auto flex justify-center items-center h-32 gap-6">
        {status === 'idle' ? (
          <button
            onClick={handleStart}
            className="w-32 h-32 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-black text-2xl shadow-lg shadow-amber-500/20 transition-transform active:scale-95 flex items-center justify-center"
            aria-label="Start run"
          >
            START
          </button>
        ) : status === 'running' ? (
          <>
            <button
              onClick={handleStop}
              className="w-16 h-16 rounded-full bg-card hover:bg-surface text-red-400 font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center"
              aria-label="Stop run"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
            <button
              onClick={handlePause}
              className="w-24 h-24 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20 transition-transform active:scale-95 flex items-center justify-center"
              aria-label="Pause run"
            >
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleStop}
              className="w-16 h-16 rounded-full bg-card hover:bg-surface text-red-400 font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center"
              aria-label="Stop run"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
            <button
              onClick={handleResume}
              className="w-24 h-24 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20 transition-transform active:scale-95 flex items-center justify-center pl-2"
              aria-label="Resume run"
            >
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
