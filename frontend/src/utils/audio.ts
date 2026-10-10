import type { SessionManifest } from '../types';

const AUDIO_CACHE_NAME = 'stridecast-audio-v1';

/** Get the API base URL - defaults to current origin in production, configurable for dev */
export function getApiBaseUrl(): string {
  // In dev, the Vite proxy handles /api routes
  return '';
}

/** Cache all audio segments for offline playback */
export async function cacheSessionAudio(manifest: SessionManifest): Promise<boolean> {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const baseUrl = getApiBaseUrl();
    const urls = manifest.segments.map(s => `${baseUrl}/api/audio/${manifest.session_id}/${s.filename}`);
    
    // Also cache pace nudge audio if available
    if (manifest.pace_nudges) {
      urls.push(`${baseUrl}/api/audio/${manifest.session_id}/${manifest.pace_nudges.ahead}`);
      urls.push(`${baseUrl}/api/audio/${manifest.session_id}/${manifest.pace_nudges.on_pace}`);
      urls.push(`${baseUrl}/api/audio/${manifest.session_id}/${manifest.pace_nudges.behind}`);
    }
    
    await Promise.all(urls.map(url => cache.add(url)));
    return true;
  } catch (err) {
    console.error('Failed to cache audio:', err);
    return false;
  }
}

/** Check if a session's audio is cached */
export async function isSessionCached(manifest: SessionManifest): Promise<boolean> {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const baseUrl = getApiBaseUrl();
    const firstUrl = `${baseUrl}/api/audio/${manifest.session_id}/${manifest.segments[0]?.filename}`;
    const match = await cache.match(firstUrl);
    return !!match;
  } catch {
    return false;
  }
}

/** Get audio URL (works offline via cache) */
export function getSegmentAudioUrl(sessionId: string, filename: string): string {
  return `${getApiBaseUrl()}/api/audio/${sessionId}/${filename}`;
}
