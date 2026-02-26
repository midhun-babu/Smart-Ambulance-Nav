import osmnx as ox
import networkx as nx
import random
import math

def get_nearest_node(G, lat, lon):
    return ox.distance.nearest_nodes(G, X=lon, Y=lat)

def load_graph(place_name="Kochi, Kerala, India"):
    # Using Kochi by default for performance, otherwise state-level graph is too large for local run on typical laptops
    # "Kerala, India" can be used if requested but typically crashes on 16GB RAM for full road network
    
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
        north, south, east, west = 10.0500, 9.9200, 76.3500, 76.2200
        G = ox.graph_from_bbox(north, south, east, west, network_type='drive')
    
    # Ensure the graph is fully connected (strongly connected) so A* routing doesn't fail
    print("Extracting largest strongly connected component...")
    G_strong = ox.truncate.largest_component(G, strongly=True)
    G_strong.graph.update(G.graph) # preserve CRS
    G = G_strong

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
        lat = G.nodes[n]['y']
        lon = G.nodes[n]['x']
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
