import type { GpsPoint } from '../types';
import { haversine } from './haversine';

/** Filter out GPS points with poor accuracy (>30m) or impossibly fast jumps */
export function smoothGpsPoints(points: GpsPoint[]): GpsPoint[] {
  if (points.length < 2) return points;
  const filtered: GpsPoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = points[i];
    // Skip points with very poor accuracy
    if (curr.accuracy > 30) continue;
    // Skip impossibly fast jumps (>12 m/s = ~43 km/h, too fast for running)
    const dist = haversine(prev.lat, prev.lng, curr.lat, curr.lng);
    const dt = (curr.timestamp - prev.timestamp) / 1000;
    if (dt > 0 && dist / dt > 12) continue;
    filtered.push(curr);
  }
  return filtered;
}

/** Calculate total distance from GPS points in meters */
export function calculateDistance(points: GpsPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversine(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
  }
  return total;
}

/** Calculate pace in min/km from speed in m/s. Returns null if speed is too low. */
export function calculatePace(speedMs: number): number | null {
  if (speedMs < 0.3) return null; // basically stationary
  return 1000 / speedMs / 60; // min per km
}
