import math
from typing import List, Dict, Any, Optional

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees).
    Returns distance in meters.
    """
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371000 # Radius of earth in meters
    return c * r

def smooth_gps_points(points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Filter out GPS points with poor accuracy (>30m) or impossibly fast jumps (>12 m/s).
    """
    if len(points) < 2:
        return points
    
    filtered = [points[0]]
    for i in range(1, len(points)):
        prev = filtered[-1]
        curr = points[i]
        
        # Skip points with poor accuracy
        if curr.get("accuracy", 0) > 30:
            continue
            
        # Skip impossibly fast jumps (>12 m/s = ~43 km/h)
        dist = haversine(prev["lat"], prev["lng"], curr["lat"], curr["lng"])
        dt = (curr["timestamp"] - prev["timestamp"]) / 1000.0
        if dt > 0 and (dist / dt) > 12.0:
            continue
            
        filtered.append(curr)
        
    return filtered
