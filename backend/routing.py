import networkx as nx
import math

def heuristic(u, v, G):
    """Heuristic function for A* - straight-line distance converted to time."""
    try:
        node_u = G.nodes[u]
        node_v = G.nodes[v]
        u_y, u_x = node_u.get('y', node_u.get('lat')), node_u.get('x', node_u.get('lon'))
        v_y, v_x = node_v.get('y', node_v.get('lat')), node_v.get('x', node_v.get('lon'))
        
        if None in (u_y, u_x, v_y, v_x):
            return 0
            
        # Distance in km roughly
        dist = math.hypot(v_y - u_y, v_x - u_x) * 111
        # Assuming max speed 80 km/h, min time in seconds:
        return (dist / 80) * 3600
    except Exception:
        return 0

def edge_weight(u, v, k, data):
    return data.get('current_travel_time', data.get('travel_time', 0))

def _edge_weight(u, v, data):
    # weight function used by NetworkX. `data` may be a dict (simple graph)
    # or a dict-of-dicts (multigraph). When it's nested, pick the minimum
    # current_travel_time among all parallel edges.
    if isinstance(data, dict) and any(isinstance(val, dict) for val in data.values()):
        # multigraph style: {key: edge_attr}
        times = []
        for attr in data.values():
            times.append(attr.get('current_travel_time', attr.get('travel_time', 0)))
        return min(times) if times else 0
    else:
        return data.get('current_travel_time', data.get('travel_time', 0))


def calculate_route_astar(G, start_node, end_node):
    """Calculate shortest path using A* based on current travel_time.

    The heuristic remains straight-line but the edge cost uses the latest
    `current_travel_time` value which our traffic module updates.
    """
    route = nx.astar_path(
        G,
        source=start_node,
        target=end_node,
        heuristic=lambda u, v: heuristic(u, v, G),
        weight=_edge_weight, # type: ignore
    )

    # Calculate total travel time safely for multigraphs
    travel_time = 0
    for i in range(len(route) - 1):
        u, v = route[i], route[i + 1]
        edge_data = G.get_edge_data(u, v)
        if isinstance(edge_data, dict):
            # Pick min travel time if there are multiple edges
            times = [d.get('current_travel_time', d.get('travel_time', 0)) for d in edge_data.values()]
            travel_time += min(times) if times else 0
        else:
            travel_time += edge_data.get('current_travel_time', edge_data.get('travel_time', 0))
    return route, travel_time

def calculate_route_dijkstra(G, start_node, end_node):
    """Fallback shortest path using Dijkstra with dynamic weights."""
    route = nx.shortest_path(G, source=start_node, target=end_node, weight=_edge_weight)
    travel_time = nx.shortest_path_length(G, source=start_node, target=end_node, weight=_edge_weight)
    return route, travel_time
