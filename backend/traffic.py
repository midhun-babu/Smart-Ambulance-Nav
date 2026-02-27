import random


def randomize_traffic(G, variation=0.3):
    """Apply a random variation to every edge's current speed.

    variation is fraction of base speed (e.g. 0.3 -> +/-30%).
    Speeds are clamped to a reasonable minimum (5 km/h) to avoid zero.
    After adjusting, update the edge's current_travel_time accordingly.
    """
    for u, v, k, data in G.edges(keys=True, data=True):
        base = data.get('base_speed_kph', data.get('speed_kph', 50.0))
        # randomly vary around base
        factor = 1 + random.uniform(-variation, variation)
        new_speed = max(5.0, base * factor)
        data['current_speed_kph'] = new_speed
        length = data.get('length', 0.0)
        if new_speed > 0:
            data['current_travel_time'] = length / new_speed * 3600
        else:
            data['current_travel_time'] = data.get('travel_time', 0)


def get_route_traffic(G, route_nodes):
    """Return a list of traffic info for each segment in a node route.

    Each entry contains the two node IDs, current speed, and travel time.
    """
    segments = []
    for i in range(len(route_nodes) - 1):
        u = route_nodes[i]
        v = route_nodes[i + 1]
        edge_data = G.get_edge_data(u, v)
        if isinstance(edge_data, dict):
            # pick the edge with minimal current_travel_time
            best = min(edge_data.values(), key=lambda d: d.get('current_travel_time', float('inf')))
            data = best
        else:
            data = edge_data
        segments.append({
            'u': u,
            'v': v,
            'speed_kph': data.get('current_speed_kph'),
            'travel_time': data.get('current_travel_time'),
        })
    return segments


def get_overall_traffic(G):
    """Return summary statistics (min/avg/max speed) over all edges."""
    speeds = []
    for _, _, _, data in G.edges(keys=True, data=True):
        sp = data.get('current_speed_kph')
        if sp is not None:
            speeds.append(sp)
    if not speeds:
        return {}
    return {
        'min_speed': min(speeds),
        'max_speed': max(speeds),
        'avg_speed': sum(speeds) / len(speeds),
        'count': len(speeds),
    }
