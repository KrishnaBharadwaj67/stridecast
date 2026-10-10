import { useCallback, useRef, useState } from 'react';
import type { GpsPoint } from '../types';
import { smoothGpsPoints, calculateDistance, calculatePace } from '../utils/gps';

export function useGeolocation() {
  const [points, setPoints] = useState<GpsPoint[]>([]);
  const [currentPace, setCurrentPace] = useState<number | null>(null);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const rawPointsRef = useRef<GpsPoint[]>([]);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    rawPointsRef.current = [];
    setPoints([]);
    setDistance(0);
    setCurrentPace(null);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point: GpsPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
        };
        rawPointsRef.current.push(point);
        const smoothed = smoothGpsPoints(rawPointsRef.current);
        setPoints(smoothed);
        setDistance(calculateDistance(smoothed));
        if (pos.coords.speed !== null && pos.coords.speed > 0) {
          setCurrentPace(calculatePace(pos.coords.speed));
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return { points, currentPace, distance, error, start, stop };
}
