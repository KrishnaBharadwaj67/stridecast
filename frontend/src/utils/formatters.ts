/** Format seconds to MM:SS or H:MM:SS */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format pace as M:SS min/km */
export function formatPace(minPerKm: number): string {
  if (!isFinite(minPerKm) || minPerKm <= 0) return '--:--';
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Format distance in meters to km with 2 decimal places */
export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(2);
}

/** Format date to short readable string */
export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
