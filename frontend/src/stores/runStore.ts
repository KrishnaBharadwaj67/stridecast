import { create } from 'zustand';
import type { GpsPoint } from '../types';

type RunStatus = 'idle' | 'running' | 'paused' | 'finished';

interface RunState {
  status: RunStatus;
  startTime: number | null;
  elapsed: number; // seconds
  distance: number; // meters
  currentPace: number | null; // min/km
  route: GpsPoint[];
  
  // Actions
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  finishRun: () => void;
  updateGps: (distance: number, pace: number | null, points: GpsPoint[]) => void;
  updateElapsed: (elapsed: number) => void;
  reset: () => void;
}

export const useRunStore = create<RunState>((set) => ({
  status: 'idle',
  startTime: null,
  elapsed: 0,
  distance: 0,
  currentPace: null,
  route: [],

  startRun: () => set({ status: 'running', startTime: Date.now(), elapsed: 0, distance: 0, route: [] }),
  pauseRun: () => set({ status: 'paused' }),
  resumeRun: () => set({ status: 'running' }),
  finishRun: () => set({ status: 'finished' }),
  updateGps: (distance, pace, points) => set({ distance, currentPace: pace, route: points }),
  updateElapsed: (elapsed) => set({ elapsed }),
  reset: () => set({ status: 'idle', startTime: null, elapsed: 0, distance: 0, currentPace: null, route: [] }),
}));
