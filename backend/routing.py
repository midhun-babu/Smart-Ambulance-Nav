import networkx as nx
import math

def heuristic(u, v, G):
    """
    Straight-line distance for A* heuristic.
    Coordinates are in degrees, so we convert roughly to meters or time.
    1 degree ~ 111km.
    """
    try:
        u_y, u_x = G.nodes[u]['y'], G.nodes[u]['x']
        v_y, v_x = G.nodes[v]['y'], G.nodes[v]['x']
        # Distance in km roughly
        dist = math.hypot(v_y - u_y, v_x - u_x) * 111
        # Assuming max speed 80 km/h, min time in seconds:
        return (dist / 80) * 3600
    except:
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
