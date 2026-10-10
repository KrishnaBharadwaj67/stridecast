import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useSessionStore } from './stores/sessionStore';
import { useRunStore } from './stores/runStore';
import { useHistoryStore } from './stores/historyStore';
import { saveRun, getRuns } from './utils/db';

if (typeof window !== 'undefined') {
  (window as any).__stores = {
    useSessionStore,
    useRunStore,
    useHistoryStore,
    saveRun,
    getRuns,
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
