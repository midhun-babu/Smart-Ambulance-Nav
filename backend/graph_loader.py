import osmnx as ox
import networkx as nx
import random
import math

def get_nearest_node(G, lat, lon):
    return ox.distance.nearest_nodes(G, X=lon, Y=lat)

def load_graph(place_name="Kochi, Kerala, India"):
    # Using Kochi by default for performance
    
    # Configure OSMnx to use local cache and be quiet
    ox.settings.log_console = False
    ox.settings.use_cache = True
    
    # Download drive network
    print(f"Downloading road network for {place_name}...")
    try:
        G = ox.graph_from_place(place_name, network_type='drive', simplify=True)
    except Exception as e:
        print(f"Failed to load {place_name}. Falling back to a smaller bbox (Ernakulam center). Error: {e}")
        # Bounding box roughly around Kochi center as fallback
        # OSMnx 2.0+ requires bbox=(north, south, east, west)
        north, south, east, west = 10.0500, 9.9200, 76.3500, 76.2200
        G = ox.graph_from_bbox(bbox=(north, south, east, west), network_type='drive')
    
    if G is None or len(G.nodes) == 0:
        raise RuntimeError("Failed to load graph data.")

    # Ensure the graph is fully connected (strongly connected) so A* routing doesn't fail
    print("Extracting largest strongly connected component...")
    # OSMnx 2.0+ uses ox.utils_graph.get_largest_component
    try:
        G = ox.utils_graph.get_largest_component(G, strongly=True)
    except AttributeError:
        # Fallback for older versions if needed
        G = ox.truncate.largest_component(G, strongly=True)

    # Add edge speeds and calculate travel times
    G = ox.add_edge_speeds(G)
    G = ox.add_edge_travel_times(G)

    # Convert node attributes to ensure they are accessible
    # Also randomly assign ~20 intersections as traffic signals
    nodes = list(G.nodes)
    signal_nodes = random.sample(nodes, min(20, len(nodes)))
    
    nx.set_node_attributes(G, False, 'is_signal')
    for n in signal_nodes:
        G.nodes[n]['is_signal'] = True

    # Identify signals list to process in simulation
    signals = []
    signal_id = 1
    for n in signal_nodes:
        # Accessing node attributes safely
        node_attr = G.nodes[n]
        lat = node_attr.get('y', node_attr.get('lat'))
        lon = node_attr.get('x', node_attr.get('lon'))
        
        if lat is None or lon is None:
            continue

        signals.append({
            "id": signal_id,
            "node_id": n,
            "lat": lat,
            "lon": lon,
            "state": "RED",
            "timer": random.randint(10, 30),
            "cycle": ["RED", "GREEN", "YELLOW"]
        })
        signal_id += 1
        
    print(f"Graph loaded with {len(G.nodes)} nodes and {len(G.edges)} edges.")
    return G, signals
