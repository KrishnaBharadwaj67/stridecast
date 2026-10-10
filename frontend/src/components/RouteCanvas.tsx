import type { GpsPoint } from '../types';

interface Props {
  route: GpsPoint[];
  width?: number;
  height?: number;
}

export function RouteCanvas({ route, width = 340, height = 200 }: Props) {
  if (route.length < 2) {
    return (
      <div className="flex items-center justify-center bg-[#1a2332] rounded-xl" style={{ width, height }}>
        <p className="text-slate-500 text-sm">No route recorded</p>
      </div>
    );
  }

  // Normalize coordinates to fit SVG
  const lats = route.map(p => p.lat);
  const lngs = route.map(p => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const padding = 20;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  
  const points = route.map(p => {
    const x = padding + ((p.lng - minLng) / lngRange) * w;
    const y = padding + ((maxLat - p.lat) / latRange) * h; // flip Y
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="bg-[#1a2332] rounded-xl">
      <polyline
        points={points}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Start marker */}
      <circle cx={points.split(' ')[0].split(',')[0]} cy={points.split(' ')[0].split(',')[1]} r="5" fill="#10b981" />
      {/* End marker */}
      <circle cx={points.split(' ').slice(-1)[0].split(',')[0]} cy={points.split(' ').slice(-1)[0].split(',')[1]} r="5" fill="#ef4444" />
    </svg>
  );
}
