import { useCallback, useEffect, useRef, useState } from 'react';
import type { SessionManifest } from '../types';
import { getSegmentAudioUrl } from '../utils/audio';

export function useAudioPlayer(manifest: SessionManifest | null, currentPace?: number | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [progress, setProgress] = useState(0); // 0-1 overall progress
  const [isNudgePlaying, setIsNudgePlaying] = useState(false);

  const paceRef = useRef<number | null>(null);
  useEffect(() => {
    paceRef.current = currentPace ?? null;
  }, [currentPace]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Set up Media Session API for lock screen controls
  useEffect(() => {
    if (!manifest || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: manifest.title,
      artist: 'StrideCast',
      album: manifest.topic,
    });
    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNextSegment());
  }, [manifest]);

  const playSegment = useCallback((segmentIndex: number) => {
    if (!manifest || !audioRef.current || segmentIndex >= manifest.segments.length) return;
    setIsNudgePlaying(false);
    const segment = manifest.segments[segmentIndex];
    const url = getSegmentAudioUrl(manifest.session_id, segment.filename);
    
    audioRef.current.src = url;
    audioRef.current.onended = () => {
      const next = segmentIndex + 1;
      if (next < manifest.segments.length) {
        // Check if we should trigger a pace nudge between segments
        const pace = paceRef.current;
        const target = manifest.target_pace_min_km || 5.5;
        const nudges = manifest.pace_nudges;

        if (nudges && pace && pace > 0) {
          let nudgeFile: string | null = null;
          if (pace < target - 0.4) {
            nudgeFile = nudges.ahead;
          } else if (pace > target + 0.4) {
            nudgeFile = nudges.behind;
          } else {
            nudgeFile = nudges.on_pace;
          }

          if (nudgeFile && audioRef.current) {
            setIsNudgePlaying(true);
            const nudgeUrl = getSegmentAudioUrl(manifest.session_id, nudgeFile);
            audioRef.current.src = nudgeUrl;
            audioRef.current.onended = () => {
              setCurrentSegment(next);
              playSegment(next);
            };
            audioRef.current.play().catch(err => {
              console.warn('Nudge play error, advancing to next segment:', err);
              setCurrentSegment(next);
              playSegment(next);
            });
            return;
          }
        }

        setCurrentSegment(next);
        playSegment(next);
      } else {
        setIsPlaying(false);
      }
    };

    audioRef.current.ontimeupdate = () => {
      if (!manifest || !audioRef.current) return;
      const playedSegmentsDuration = manifest.segments
        .slice(0, segmentIndex)
        .reduce((sum, s) => sum + s.duration_seconds, 0);
      const currentTime = audioRef.current.currentTime;
      const totalDuration = manifest.total_duration_seconds;
      if (totalDuration > 0) {
        setProgress(Math.min(1, (playedSegmentsDuration + currentTime) / totalDuration));
      }
    };
    
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.error('Audio play failed:', err));
  }, [manifest]);

  const play = useCallback(() => {
    setCurrentSegment(0);
    playSegment(0);
  }, [playSegment]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentSegment(0);
    setProgress(0);
    setIsNudgePlaying(false);
  }, []);

  const playNextSegment = useCallback(() => {
    if (!manifest) return;
    const next = currentSegment + 1;
    if (next < manifest.segments.length) {
      setCurrentSegment(next);
      playSegment(next);
    }
  }, [manifest, currentSegment, playSegment]);

  return { isPlaying, currentSegment, progress, isNudgePlaying, play, pause, resume, stop, audioRef };
}
