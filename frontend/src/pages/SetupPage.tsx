import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import type { Mood, GenerateRequest } from '../types';

export function SetupPage() {
  const navigate = useNavigate();
  const startGeneration = useSessionStore(state => state.startGeneration);
  
  const [duration, setDuration] = useState(30);
  const [paceMin, setPaceMin] = useState('5');
  const [paceSec, setPaceSec] = useState('30');
  const [mood, setMood] = useState<Mood>('energetic');
  const [topic, setTopic] = useState('');
  const [voice, setVoice] = useState('af_heart');
  const [demoMode, setDemoMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(res => setIsConnected(res.ok))
      .catch(() => setIsConnected(false));
  }, []);

  const handleGenerate = () => {
    const paceMinNum = parseInt(paceMin) || 5;
    const paceSecNum = parseInt(paceSec) || 0;
    const targetPace = Math.max(3, Math.min(10, paceMinNum + paceSecNum / 60));
    
    const request: GenerateRequest = {
      duration_minutes: duration,
      target_pace_min_km: targetPace,
      mood,
      topic: topic.trim() || 'Running motivation and flow state',
      voice,
      enable_music: false,
      demo_mode: demoMode,
    };
    
    startGeneration(request);
    navigate('/generating');
  };

  return (
    <div className="flex flex-col min-h-screen p-4 pb-8 space-y-6">
      {/* Brand Header */}
      <div className="text-center pt-6 pb-2">
        <div className="inline-flex items-center space-x-2 justify-center mb-1">
          <span className="text-3xl">🏃</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-amber-500">StrideCast</h1>
        </div>
        <p className="text-slate-400 text-sm font-medium">Your run, your story, no signal needed.</p>
      </div>

      <div className="bg-[#1a2332] rounded-2xl p-5 space-y-6 shadow-xl border border-slate-800">
        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-200">Duration (minutes)</label>
          <div className="flex gap-2">
            {[15, 20, 30, 45, 60].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`flex-1 h-12 rounded-xl font-bold transition-all text-sm active:scale-95 ${
                  duration === d 
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                    : 'bg-[#243447] text-slate-300 hover:text-white'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Target Pace */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-200">Target Pace (min/km)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="3" max="10"
              value={paceMin}
              onChange={e => setPaceMin(e.target.value)}
              className="w-20 h-12 bg-[#243447] rounded-xl px-4 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-100"
            />
            <span className="text-2xl font-bold text-slate-400">:</span>
            <input
              type="number"
              min="0" max="59"
              value={paceSec}
              onChange={e => setPaceSec(e.target.value.padStart(2, '0'))}
              className="w-20 h-12 bg-[#243447] rounded-xl px-4 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-100"
            />
            <span className="text-xs text-slate-400 pl-2">per kilometer</span>
          </div>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-200">Mood & Tone</label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'chill', emoji: '🧘', label: 'Chill', desc: 'Calm cadence' },
              { id: 'energetic', emoji: '⚡', label: 'Energetic', desc: 'High drive' },
              { id: 'focused', emoji: '🎯', label: 'Focused', desc: 'Deep concentration' },
              { id: 'storytelling', emoji: '📖', label: 'Storytelling', desc: 'Immersive arc' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id as Mood)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95 ${
                  mood === m.id 
                    ? 'border-amber-500 bg-[#243447] text-white shadow-sm' 
                    : 'border-transparent bg-[#243447]/60 text-slate-300 hover:text-white'
                }`}
              >
                <span className="text-2xl mb-1">{m.emoji}</span>
                <span className="font-bold text-sm">{m.label}</span>
                <span className="text-[11px] text-slate-400">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Podcast Topic */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-200">Podcast Topic</label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Origins of Marathon Running..."
            className="w-full h-12 bg-[#243447] rounded-xl px-4 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['History of Coffee', 'Space Exploration', 'Running Science', 'Mindfulness & Trails'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className="px-2.5 py-1 bg-[#243447]/80 rounded-lg text-xs text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-colors"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-200">Narrator Voice</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'af_heart', name: 'Heart', desc: 'Warm & Steady' },
              { id: 'af_bella', name: 'Bella', desc: 'Bright & Crisp' },
              { id: 'am_adam', name: 'Adam', desc: 'Calm & Grounded' },
              { id: 'am_michael', name: 'Michael', desc: 'Deep & Resonant' },
            ].map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVoice(v.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  voice === v.id
                    ? 'border-amber-500 bg-[#243447] text-white'
                    : 'border-transparent bg-[#243447]/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-100">{v.name}</div>
                <div className="text-[10px] text-slate-400">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Mode Toggle */}
        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-300">🎮 Demo Mode</span>
            <p className="text-[11px] text-slate-400">Instant sample audio for video recordings</p>
          </div>
          <button
            type="button"
            onClick={() => setDemoMode(!demoMode)}
            className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
              demoMode ? 'bg-amber-500' : 'bg-[#243447]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                demoMode ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Action */}
      <div className="mt-auto space-y-4">
        <button
          onClick={handleGenerate}
          className="w-full h-14 bg-amber-500 hover:bg-amber-600 rounded-2xl font-bold text-lg text-black transition-transform active:scale-[0.98] shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2"
        >
          <span>Generate My Run</span>
          <span>→</span>
        </button>
        
        <div className="flex justify-between items-center px-2">
          <button 
            onClick={() => navigate('/history')} 
            className="text-slate-400 hover:text-slate-200 text-sm font-medium flex items-center space-x-1"
          >
            <span>📜</span>
            <span>View Past Runs</span>
          </button>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-amber-500'}`}></span>
            <span>{isConnected ? 'Backend connected' : 'Local / Demo'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
