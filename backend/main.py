from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import math

from graph_loader import load_graph, get_nearest_node
from hospital_data import filter_hospitals
from routing import calculate_route_astar, calculate_route_dijkstra
from signal_model import get_signals, trigger_preemption, update_signals
from simulation import simulate_step

app = FastAPI(title="Intelligent Ambulance Routing")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
G = None
signals = []
hospitals = []

class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    case_type: str

class SimulationStepRequest(BaseModel):
    current_lat: float
    current_lon: float
    route: list
    speed_kmh: float

@app.on_event("startup")
def startup_event():
    global G, signals, hospitals
    print("Loading graph data for Kerala (Kochi region)...")
    G, signals = load_graph()
    
    from hospital_data import get_hospitals
    hospitals = get_hospitals()
    print(f"Loaded {len(hospitals)} hospitals and {len(signals)} signals.")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Intelligent Ambulance Routing API is running."}

@app.get("/graph/load")
def get_graph_status():
    if G is None:
        return {"status": "error", "message": "Graph not loaded."}
    return {"status": "loaded", "nodes": len(G.nodes), "edges": len(G.edges)}

@app.get("/hospital/filter")
def get_filtered_hospitals(case_type: str):
    valid_hospitals = filter_hospitals(hospitals, case_type)
    return {"hospitals": valid_hospitals}

@app.post("/route")
def get_route(req: RouteRequest):
    global G
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not loaded")
    
    # 1. Select Hospital based on capability
    valid_hospitals = filter_hospitals(hospitals, req.case_type)
    if not valid_hospitals:
        # Failsafe Mode: If no capable hospital available, just return nearest general hospital
        valid_hospitals = hospitals
    
    # Simple straight-line distance to find the nearest valid hospital roughly
    best_hospital = None
    min_dist = float('inf')
    for h in valid_hospitals:
        dist = math.hypot(h["lat"] - req.start_lat, h["lon"] - req.start_lon)
        if dist < min_dist:
            min_dist = dist
            best_hospital = h
            
    if not best_hospital:
        raise HTTPException(status_code=404, detail="No suitable hospital found.")

    # 2. Get nearest nodes
    start_node = get_nearest_node(G, req.start_lat, req.start_lon)
    end_node = get_nearest_node(G, best_hospital["lat"], best_hospital["lon"])
    
    # 3. Calculate route
    try:
        route_nodes, travel_time = calculate_route_astar(G, start_node, end_node)
    except Exception as e:
        # Failsafe Mode fallback to Dijkstra
        print(f"A* failed: {e}. Falling back to Dijkstra.")
        try:
            route_nodes, travel_time = calculate_route_dijkstra(G, start_node, end_node)
        except Exception as e2:
            raise HTTPException(status_code=500, detail="Routing failed completely.")

    # Convert node IDs to coordinates
    route_coords = [[G.nodes[n]['y'], G.nodes[n]['x']] for n in route_nodes]

    return {
        "hospital": best_hospital,
        "route": route_coords,
        "estimated_time_minutes": round(travel_time / 60, 2)
    }

@app.post("/simulate/step")
def process_simulation_step(req: SimulationStepRequest):
    global signals
    update_signals(signals) # tick the state machine
    
    preemption_triggered = simulate_step(req.current_lat, req.current_lon, signals)
    
    return {
        "preemption_active": preemption_triggered,
        "signals": [{"id": s["id"], "lat": s["lat"], "lon": s["lon"], "state": s["state"]} for s in signals]
    }

@app.get("/signals/status")
def get_signals_status():
    global signals
    return {"signals": [{"id": s["id"], "lat": s["lat"], "lon": s["lon"], "state": s["state"]} for s in signals]}

@app.post("/preemption/trigger")
def manual_override(signal_id: int):
    global signals
    for s in signals:
        if s["id"] == signal_id:
            s["state"] = "PREEMPTED_GREEN"
            s["timer"] = 25
            return {"status": "success", "message": f"Signal {signal_id} preempted"}
    raise HTTPException(status_code=404, detail="Signal not found")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
