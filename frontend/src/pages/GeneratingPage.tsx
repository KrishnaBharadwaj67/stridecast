import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { cacheSessionAudio } from '../utils/audio';

export function GeneratingPage() {
  const navigate = useNavigate();
  const { isGenerating, progress, manifest, isOfflineReady, setOfflineReady, reset } = useSessionStore();
  const [caching, setCaching] = useState(false);
  const [cacheError, setCacheError] = useState(false);

  useEffect(() => {
    // If not generating and no manifest, we shouldn't be here
    if (!isGenerating && !manifest) {
      navigate('/');
    }
  }, [isGenerating, manifest, navigate]);

  const handleCache = async () => {
    if (!manifest) return;
    setCaching(true);
    setCacheError(false);
    const success = await cacheSessionAudio(manifest);
    setCaching(false);
    if (success) {
      setOfflineReady(true);
    } else {
      setCacheError(true);
    }
  };

  const handleStart = () => {
    navigate('/run');
  };

  const handleCancel = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen p-6 items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-amber-500 mb-12 absolute top-8">StrideCast</h1>

      {isGenerating ? (
        <div className="space-y-8 w-full max-w-sm">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{progress?.progress || 0}%</span>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">Generating Audio...</h2>
            <p className="text-slate-400 min-h-[3rem]">{progress?.message || 'Starting up...'}</p>
          </div>

          <button
            onClick={handleCancel}
            className="mt-8 px-6 py-3 rounded-xl bg-card text-slate-300 font-bold hover:bg-surface transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : manifest ? (
        <div className="space-y-8 w-full max-w-sm fade-in">
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Session Ready!</h2>
            <p className="text-amber-500 font-medium mb-1">{manifest.title}</p>
            <p className="text-slate-400 text-sm">
              {manifest.duration_minutes} min • {manifest.segments.length} segments
            </p>
          </div>

          {!isOfflineReady ? (
            <div className="space-y-4 pt-4">
              <button
                onClick={handleCache}
                disabled={caching}
                className="w-full h-14 bg-card hover:bg-surface rounded-2xl font-bold text-lg transition-colors flex items-center justify-center space-x-2"
              >
                {caching ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Caching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    <span>Cache for Offline</span>
                  </>
                )}
              </button>
              {cacheError && <p className="text-red-500 text-sm">Failed to cache audio. Check your connection.</p>}
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              <p className="text-emerald-500 font-medium flex items-center justify-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Ready for offline playback
              </p>
              <button
                onClick={handleStart}
                className="w-full h-14 bg-amber-500 hover:bg-amber-600 rounded-2xl font-bold text-lg text-white transition-colors"
              >
                Start Your Run →
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
