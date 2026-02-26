import sys
import os
import traceback
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from graph_loader import load_graph, get_nearest_node
from routing import calculate_route_astar, calculate_route_dijkstra

def test():
    print("Loading graph...")
    G, sigs = load_graph()
    start_lat, start_lon = 9.9790, 76.2764
    end_lat, end_lon = 9.9806, 76.2798
    start = get_nearest_node(G, start_lat, start_lon)
    end = get_nearest_node(G, end_lat, end_lon)
    print(f"Start node: {start}, End node: {end}")
    try:
        route, time = calculate_route_astar(G, start, end)
        print("A* OK. Route length:", len(route))
    except Exception as e:
        print("A* failed:", e)
        traceback.print_exc()

if __name__ == "__main__":
    test()
