import sys
import os
import traceback

# Ensure we can import from the backend directory regardless of where the script is run
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(script_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

try:
    from graph_loader import load_graph, get_nearest_node
    from routing import calculate_route_astar, calculate_route_dijkstra
except ImportError as e:
    print(f"Error importing backend modules: {e}")
    print(f"Python path: {sys.path}")
    sys.exit(1)

def test():
    print("=== Intelligent Ambulance Routing - Test Script ===")
    print("Loading graph (Kochi region)...")
    try:
        G, sigs = load_graph()
    except Exception as e:
        print(f"Critical error loading graph: {e}")
        traceback.print_exc()
        return

    # Coordinates near Marine Drive, Kochi
    start_lat, start_lon = 9.9790, 76.2764
    # Coordinates near Ernakulam General Hospital
    end_lat, end_lon = 9.9806, 76.2798

    print(f"Finding nearest nodes for Start({start_lat}, {start_lon}) and End({end_lat}, {end_lon})...")
    start = get_nearest_node(G, start_lat, start_lon)
    end = get_nearest_node(G, end_lat, end_lon)
    
    print(f"Start node: {start}, End node: {end}")
    
    try:
        print("Calculating A* Route...")
        route, time = calculate_route_astar(G, start, end)
        print("A* Success!")
        print(f"Route nodes: {len(route)}")
        print(f"Estimated Time: {round(time/60, 2)} minutes")
    except Exception as e:
        print(f"A* Routing failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test()
