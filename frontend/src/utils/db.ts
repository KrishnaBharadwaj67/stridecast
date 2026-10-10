import { openDB, type IDBPDatabase } from 'idb';
import type { RunRecord, SessionManifest } from '../types';

const DB_NAME = 'stridecast';
const DB_VERSION = 1;

async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('runs')) {
        db.createObjectStore('runs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'session_id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
}

export async function saveRun(run: RunRecord): Promise<void> {
  const db = await getDb();
  await db.put('runs', run);
}

export async function getRuns(): Promise<RunRecord[]> {
  const db = await getDb();
  const runs = await db.getAll('runs');
  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function getRun(id: string): Promise<RunRecord | undefined> {
  const db = await getDb();
  return db.get('runs', id);
}

export async function saveSession(manifest: SessionManifest): Promise<void> {
  const db = await getDb();
  await db.put('sessions', manifest);
}

export async function getSession(sessionId: string): Promise<SessionManifest | undefined> {
  const db = await getDb();
  return db.get('sessions', sessionId);
}
