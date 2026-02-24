import math
from signal_model import trigger_preemption

def get_distance(lat1, lon1, lat2, lon2):
    """Distance in meters between two lat/lon points using Haversine."""
    R = 6371e3
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi/2) * math.sin(delta_phi/2) + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda/2) * math.sin(delta_lambda/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def simulate_step(current_lat, current_lon, signals):
    """Geofencing check: trigger preemption if signal < 300m away."""
    preempted_trigger = False
    for s in signals:
        dist = get_distance(current_lat, current_lon, s["lat"], s["lon"])
        if dist < 300: # 300m radius geofence
            # Trigger preemption only if normal state
            if s["state"] != "PREEMPTED_GREEN":
                if trigger_preemption(s):
                    preempted_trigger = True
    return preempted_trigger
