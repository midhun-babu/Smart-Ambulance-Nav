from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uvicorn
import math
import httpx

from typing import Optional
from contextlib import asynccontextmanager

from database import engine, Base, get_db
from models import Hospital as HospitalModel, TrafficSignal as SignalModel, Ambulance as AmbulanceModel, EmergencyRequest as RequestModel
from graph_loader import load_graph, get_nearest_node
from hospital_data import filter_hospitals, seed_hospitals
from routing import calculate_route_astar, calculate_route_dijkstra
from signal_model import update_signals
from simulation import simulate_step

# traffic utilities for demo
from traffic import randomize_traffic, get_route_traffic, get_overall_traffic

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intelligent Ambulance Routing")

# Global state for Graph only (cached in memory for routing performance)
G = None

class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    case_type: str

class SimulationStepRequest(BaseModel):
    current_lat: float
    current_lon: float
    route: list
    speed_kmh: float

@asynccontextmanager
async def lifespan(app: FastAPI):
    global G
    print("Loading graph data for Kerala (Kochi region)...")
    G, signals_data = load_graph()
    
    # Initialize DB data
    from database import SessionLocal
    db = SessionLocal()
    try:
        print("Seeding initial data...")
        seed_hospitals(db)
        
        # Seed signals if empty
        if db.query(SignalModel).count() == 0:
            for s in signals_data:
                db_s = SignalModel(
                    osm_id=s["id"],
                    lat=s["lat"],
                    lon=s["lon"],
                    name=s.get("name"),
                    state=s.get("state", "RED"),
                    timer=s.get("timer", 30)
                )
                db.add(db_s)
            db.commit()
            print(f"Seeded {len(signals_data)} signals.")
        
        # Seed an initial ambulance if none exist
        if db.query(AmbulanceModel).count() == 0:
            initial_ambulance = AmbulanceModel(
                vehicle_number="AMB-001",
                status="AVAILABLE"
            )
            db.add(initial_ambulance)
            db.commit()
            print("Seeded initial ambulance.")
            
    finally:
        db.close()
        
    print(f"Graph loaded with {len(G.nodes)} nodes.")
    yield

app = FastAPI(title="Intelligent Ambulance Routing", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Intelligent Ambulance Routing API is running."}

@app.get("/hospitals")
def get_all_hospitals(db: Session = Depends(get_db)):
    """Return all hospitals in Ernakulam for map rendering."""
    hospitals = db.query(HospitalModel).all()
    return {"hospitals": hospitals}

@app.get("/hospital/filter")
def get_filtered_hospitals(case_type: str, db: Session = Depends(get_db)):
    all_hospitals = db.query(HospitalModel).all()
    valid_hospitals = filter_hospitals(all_hospitals, case_type)
    return {"hospitals": valid_hospitals}

@app.post("/route")
def get_route(req: RouteRequest, db: Session = Depends(get_db)):
    global G
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not loaded")
    
    # 1. Select Hospital based on capability
    all_hospitals = db.query(HospitalModel).all()
    valid_hospitals = filter_hospitals(all_hospitals, req.case_type)
    if not valid_hospitals:
        valid_hospitals = all_hospitals
    
    best_hospital = None
    min_dist = float('inf')
    for h in valid_hospitals:
        dist = math.hypot(h.lat - req.start_lat, h.lon - req.start_lon)
        if dist < min_dist:
            min_dist = dist
            best_hospital = h
            
    if best_hospital is None:
        raise HTTPException(status_code=404, detail="No suitable hospital found.")

    # 2. Find available ambulance
    ambulance = db.query(AmbulanceModel).filter(AmbulanceModel.status == "AVAILABLE").first()
    if ambulance:
        ambulance.status = "BUSY"

    # 3. Get nearest nodes
    start_node = get_nearest_node(G, req.start_lat, req.start_lon)
    end_node = get_nearest_node(G, best_hospital.lat, best_hospital.lon)
    
    # 4. Calculate route
    try:
        route_nodes, travel_time = calculate_route_astar(G, start_node, end_node)
    except Exception as e:
        print(f"A* failed: {e}. Falling back to Dijkstra.")
        try:
            route_nodes, travel_time = calculate_route_dijkstra(G, start_node, end_node)
        except Exception:
            raise HTTPException(status_code=500, detail="Routing failed completely.")

    # Convert node IDs to coordinates
    route_coords = [[G.nodes[n]['y'], G.nodes[n]['x']] for n in route_nodes]

    # Create an emergency request record
    new_request = RequestModel(
        start_lat=req.start_lat,
        start_lon=req.start_lon,
        case_type=req.case_type,
        hospital_id=best_hospital.id,
        assigned_ambulance_id=ambulance.id if ambulance else None,
        status="ASSIGNED" if ambulance else "PENDING"
    )
    db.add(new_request)
    db.commit()

    return {
        "request_id": new_request.id,
        "ambulance": ambulance,
        "hospital": best_hospital,
        "route": route_coords,
        "estimated_time_minutes": round(travel_time / 60, 2)
    }

@app.post("/simulate/step")
def process_simulation_step(req: SimulationStepRequest, db: Session = Depends(get_db)):
    # Adjust traffic speeds in graph
    if G is not None:
        randomize_traffic(G)

    # Fetch signals from DB
    signals = db.query(SignalModel).all()
    
    # Update logic (tick the state machine)
    # Convert models to dict for simulation logic compatibility if needed or adapt update_signals
    # For now, let's assume we can pass models if we adapt update_signals
    
    # To keep it simple, we convert to dict list for existing logic, then save back
    signal_dicts = []
    for s in signals:
        signal_dicts.append({
            "id": s.osm_id, "lat": s.lat, "lon": s.lon, "state": s.state, "timer": s.timer, "_model": s
        })
    
    update_signals(signal_dicts) # tick the state machine
    
    preemption_triggered = simulate_step(req.current_lat, req.current_lon, signal_dicts)
    
    # Save states back to DB
    for s_dict in signal_dicts:
        model = s_dict["_model"]
        model.state = s_dict["state"]
        model.timer = s_dict["timer"]
    db.commit()
    
    result = {
        "preemption_active": preemption_triggered,
        "signals": [{"id": s.osm_id, "lat": s.lat, "lon": s.lon, "state": s.state} for s in signals]
    }
    if G is not None:
        result["traffic_summary"] = get_overall_traffic(G)
    return result

@app.get("/signals/status")
def get_signals_status(db: Session = Depends(get_db)):
    signals = db.query(SignalModel).all()
    return {"signals": [{"id": s.osm_id, "lat": s.lat, "lon": s.lon, "state": s.state} for s in signals]}

@app.post("/preemption/trigger/{signal_id}")
def manual_override(signal_id: int, db: Session = Depends(get_db)):
    signal = db.query(SignalModel).filter(SignalModel.osm_id == signal_id).first()
    if signal:
        signal.state = "PREEMPTED_GREEN"
        signal.timer = 25
        db.commit()
        return {"status": "success", "message": f"Signal {signal_id} preempted"}
    raise HTTPException(status_code=404, detail="Signal not found")

@app.get("/requests")
def get_requests(db: Session = Depends(get_db)):
    return {"requests": db.query(RequestModel).all()}

@app.post("/request/update/{request_id}")
def update_request_status(request_id: int, status: str, db: Session = Depends(get_db)):
    req = db.query(RequestModel).filter(RequestModel.id == request_id).first()
    if req:
        req.status = status
        db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Request not found")

@app.get("/ambulances")
def get_ambulances(db: Session = Depends(get_db)):
    return {"ambulances": db.query(AmbulanceModel).all()}

@app.post("/ambulance/update")
def update_ambulance_info(vehicle_number: str, lat: float, lon: float, status: Optional[str] = None, db: Session = Depends(get_db)):
    amb = db.query(AmbulanceModel).filter(AmbulanceModel.vehicle_number == vehicle_number).first()
    if amb:
        amb.current_lat = lat
        amb.current_lon = lon
        if status:
            amb.status = status
        db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Ambulance not found")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
