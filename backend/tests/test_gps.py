from app.utils import smooth_gps_points

def test_smooth_gps_accuracy_filtering():
    points = [
        {"lat": 40.0, "lng": -74.0, "accuracy": 5, "timestamp": 1000},
        {"lat": 40.0001, "lng": -74.0, "accuracy": 55, "timestamp": 2000}, # Poor accuracy > 30m
        {"lat": 40.0002, "lng": -74.0, "accuracy": 8, "timestamp": 3000},
    ]
    cleaned = smooth_gps_points(points)
    assert len(cleaned) == 2
    assert cleaned[0]["timestamp"] == 1000
    assert cleaned[1]["timestamp"] == 3000

def test_smooth_gps_speed_jump_filtering():
    points = [
        {"lat": 40.0, "lng": -74.0, "accuracy": 5, "timestamp": 1000},
        # Jump 10 km in 1 second -> impossibly fast for running
        {"lat": 40.1, "lng": -74.0, "accuracy": 5, "timestamp": 2000},
        # Normal running step
        {"lat": 40.00005, "lng": -74.0, "accuracy": 5, "timestamp": 3000},
    ]
    cleaned = smooth_gps_points(points)
    assert len(cleaned) == 2
    assert cleaned[0]["timestamp"] == 1000
    assert cleaned[1]["timestamp"] == 3000

def test_smooth_gps_empty_or_single():
    assert smooth_gps_points([]) == []
    single = [{"lat": 40.0, "lng": -74.0, "accuracy": 5, "timestamp": 1000}]
    assert smooth_gps_points(single) == single
