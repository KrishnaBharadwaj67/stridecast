import { create } from 'zustand';
import type { RunRecord } from '../types';
import { saveRun, getRuns } from '../utils/db';

interface HistoryState {
  runs: RunRecord[];
  loading: boolean;
  loadRuns: () => Promise<void>;
  addRun: (run: RunRecord) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  runs: [],
  loading: false,
  
  loadRuns: async () => {
    set({ loading: true });
    try {
      const runs = await getRuns();
      set({ runs, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  
  addRun: async (run: RunRecord) => {
    await saveRun(run);
    set((state) => ({ runs: [run, ...state.runs] }));
  },
}));
