import osmnx as ox
import networkx as nx
import random
import math

def get_nearest_node(G, lat, lon):
    return ox.distance.nearest_nodes(G, X=lon, Y=lat)

def load_graph(place_name="Kochi, Kerala, India"):
    


    ox.settings.log_console = False
    ox.settings.use_cache = True
    
    # Download drive network
    print(f"Downloading road network for {place_name}...")
    try:
        G = ox.graph_from_place(place_name, network_type='drive', simplify=True)
    except Exception as e:
        print(f"Failed to load {place_name}. Falling back to a smaller bbox (Ernakulam center). Error: {e}")
        
        north, south, east, west = 10.0500, 9.9200, 76.3500, 76.2200
        G = ox.graph_from_bbox(bbox=(north, south, east, west), network_type='drive')
    
    if G is None or len(G.nodes) == 0:
        raise RuntimeError("Failed to load graph data.")

    
    print("Extracting largest strongly connected component...")
   
    try:
        G = ox.utils_graph.get_largest_component(G, strongly=True)
    except AttributeError:

        G = ox.truncate.largest_component(G, strongly=True)

    # Add edge speeds and calculate travel times (static values from OSM)
    G = ox.add_edge_speeds(G)
    G = ox.add_edge_travel_times(G)

   
    for u, v, k, data in G.edges(keys=True, data=True):
        
        base = None
        maxspeed = data.get('maxspeed')
        if isinstance(maxspeed, (list, tuple)) and maxspeed:
            maxspeed = maxspeed[0]
        if isinstance(maxspeed, str):
            try:
                base = float(maxspeed.split()[0])
            except Exception:
                base = None
        elif isinstance(maxspeed, (int, float)):
            base = float(maxspeed)
        if base is None:
            base = data.get('speed_kph', 50.0)
        # set both base and current speeds initially to the same value
        data['base_speed_kph'] = base
        data['current_speed_kph'] = base
        # compute a matching travel time based on current speed
        length = data.get('length', 0.0)  # meters
        if base > 0:
            data['current_travel_time'] = length / base * 3600
        else:
            data['current_travel_time'] = data.get('travel_time', 0)
    # === end traffic initialization ===

   
    # randomly assign 200 intersections as traffic signals 
    nodes = list(G.nodes)
    signal_nodes = random.sample(nodes, min(200, len(nodes)))
    
    nx.set_node_attributes(G, False, 'is_signal')
    for n in signal_nodes:
        G.nodes[n]['is_signal'] = True

   
    signals = []
    signal_id = 1
    for n in signal_nodes:
       
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
