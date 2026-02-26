import networkx as nx
import math

def heuristic(u, v, G):
    """
    Straight-line distance for A* heuristic.
    Coordinates are in degrees, so we convert roughly to meters or time.
    1 degree ~ 111km.
    """
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

def calculate_route_astar(G, start_node, end_node):
    """Calculate shortest path using A* based on travel_time."""
    route = nx.astar_path(G, source=start_node, target=end_node, 
                          heuristic=lambda u, v: heuristic(u, v, G),
                          weight='travel_time')
    
    # Calculate total travel time
    travel_time = sum(G.get_edge_data(route[i], route[i+1])[0].get('travel_time', 0) for i in range(len(route)-1))
    return route, travel_time

def calculate_route_dijkstra(G, start_node, end_node):
    """Fallback shortest path using Dijkstra."""
    route = nx.shortest_path(G, source=start_node, target=end_node, weight='travel_time')
    travel_time = nx.shortest_path_length(G, source=start_node, target=end_node, weight='travel_time')
    return route, travel_time
