import { create } from 'zustand';
import type { GenerateRequest, SessionManifest, ProgressEvent } from '../types';

interface SessionState {
  // Generation
  isGenerating: boolean;
  progress: ProgressEvent | null;
  manifest: SessionManifest | null;
  isOfflineReady: boolean;
  error: string | null;
  
  // Actions
  startGeneration: (request: GenerateRequest) => Promise<void>;
  setManifest: (manifest: SessionManifest) => void;
  setOfflineReady: (ready: boolean) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isGenerating: false,
  progress: null,
  manifest: null,
  isOfflineReady: false,
  error: null,

  startGeneration: async (request: GenerateRequest) => {
    set({ isGenerating: true, progress: null, error: null, manifest: null, isOfflineReady: false });
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: ProgressEvent = JSON.parse(line.slice(6));
              set({ progress: event });
              
              if (event.status === 'complete' && event.manifest) {
                set({ manifest: event.manifest, isGenerating: false });
              }
              if (event.status === 'error') {
                set({ error: event.message, isGenerating: false });
              }
            } catch (e) {
              // Skip malformed events
            }
          }
        }
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Generation failed', isGenerating: false });
    }
  },

  setManifest: (manifest) => set({ manifest }),
  setOfflineReady: (ready) => set({ isOfflineReady: ready }),
  reset: () => set({ isGenerating: false, progress: null, manifest: null, isOfflineReady: false, error: null }),
}));
