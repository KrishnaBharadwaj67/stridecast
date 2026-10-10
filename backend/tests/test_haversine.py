from app.utils import haversine

def test_haversine_same_point():
    assert haversine(40.7128, -74.0060, 40.7128, -74.0060) == 0.0

def test_haversine_nyc_london():
    nyc_lat, nyc_lon = 40.7128, -74.0060
    lon_lat, lon_lon = 51.5074, -0.1278
    
    distance = haversine(nyc_lat, nyc_lon, lon_lat, lon_lon)
    # distance is in meters, should be approx 5570 km
    assert 5500000 < distance < 5600000

def test_haversine_short_distance():
    # Approx 111 meters for 0.001 degree latitude change
    lat1, lon1 = 40.0, -74.0
    lat2, lon2 = 40.001, -74.0
    
    distance = haversine(lat1, lon1, lat2, lon2)
    assert 110 < distance < 112
