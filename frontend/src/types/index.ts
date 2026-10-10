export type Mood = 'chill' | 'energetic' | 'focused' | 'storytelling';

export interface GenerateRequest {
  duration_minutes: number;
  target_pace_min_km: number;
  mood: Mood;
  topic: string;
  voice: string;
  enable_music: boolean;
  demo_mode?: boolean;
}

export interface Segment {
  index: number;
  filename: string;
  duration_seconds: number;
  text: string;
}

export interface PaceNudges {
  ahead: string;
  on_pace: string;
  behind: string;
}

export interface SessionManifest {
  session_id: string;
  title: string;
  topic: string;
  mood: string;
  duration_minutes: number;
  target_pace_min_km?: number;
  segments: Segment[];
  pace_nudges: PaceNudges | null;
  total_duration_seconds: number;
  created_at: string;
}

export interface ProgressEvent {
  status: 'generating_script' | 'script_ready' | 'generating_audio' | 'mixing' | 'complete' | 'error';
  progress: number;
  message: string;
  session_id?: string;
  manifest?: SessionManifest;
  segment?: number;
  total?: number;
  title?: string;
}

export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  speed: number | null;
}

export interface RunRecord {
  id: string;
  sessionId: string;
  title: string;
  topic: string;
  mood: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  distanceMeters: number;
  avgPaceMinKm: number;
  route: GpsPoint[];
}
