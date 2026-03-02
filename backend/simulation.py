from geofencing import check_geofence

def simulate_step(current_lat, current_lon, signals):
    """Geofencing check: trigger preemption if signal is within range."""
    return check_geofence(current_lat, current_lon, signals)
