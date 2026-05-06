from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import math

from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services.graph_loader import load_graph, get_nearest_node
from app.services.hospital_data import filter_hospitals
from app.services.routing import calculate_route_astar, calculate_route_dijkstra
from app.services.signal_model import update_signals
from app.services.simulation import simulate_step

# database & auth
from app.db.session import get_database, ping_database
from app.api.v1 import auth, admin
from datetime import datetime

# traffic utilities for demo
from app.services.traffic import randomize_traffic, get_overall_traffic


        
# Global state
G = None
signals = []
cached_hospitals = []

class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    case_type: Optional[str] = "trauma"
    hospital_id: Optional[str] = None

class SimulationStepRequest(BaseModel):
    current_lat: float
    current_lon: float
    route: list
    speed_kmh: float

@asynccontextmanager
async def lifespan(app: FastAPI):
    global G, signals, cached_hospitals
    print("Loading graph data for Kerala (Kochi region)...")
    G, signals = load_graph()
    
    # Initialize DB connection
    await ping_database()
    
    db = get_database()
    
    # 1. Admin Init
    from app.api.v1.auth import get_password_hash
    admin_exists = await db.users.find_one({"email": "admin@gmail.com"})
    if not admin_exists:
        print("Creating default admin user...")
        await db.users.insert_one({
            "email": "admin@gmail.com",
            "name": "System Admin",
            "role": "admin",
            "password_hash": get_password_hash("1234"),
            "is_approved": True,
            "created_at": datetime.utcnow()
        })
        
    # 2. Hospitals Init
    from app.services.hospital_data import get_hospitals as get_default_hospitals
    hospitals_count = await db.hospitals.count_documents({})
    defaults = get_default_hospitals()
    if hospitals_count == 0:
        print("Initializing hospitals collection...")
        if defaults:
            await db.hospitals.insert_many(defaults)
            
    # 3. Hospital Users Init
    hospital_users_count = await db.users.count_documents({"role": "hospital"})
    if hospital_users_count == 0 and defaults:
        print("Creating default hospital users...")
        hospital_users = []
        for i, h in enumerate(defaults):
            email = f"hospital{i+1}@smartnav.com"
            hospital_users.append({
                "email": email,
                "name": h["name"],
                "role": "hospital",
                "password_hash": get_password_hash("1234"),
                "is_approved": True,
                "created_at": datetime.utcnow()
            })
        if hospital_users:
            await db.users.insert_many(hospital_users)
            
    # Cache hospitals
    cursor = db.hospitals.find({})
    hospitals = await cursor.to_list(length=1000)
    for h in hospitals:
        h["id"] = str(h["_id"])
        h.pop("_id", None)
    cached_hospitals = hospitals
            
    print(f"Loaded {len(cached_hospitals)} hospitals and {len(signals)} signals.")
    yield

app = FastAPI(title="Intelligent Ambulance Routing", lifespan=lifespan)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred on the server.", "details": str(exc)},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:2500", "http://127.0.0.1:2500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Intelligent Ambulance Routing API is running."}

@app.get("/graph/load")
def get_graph_status():
    if G is None:
        return {"status": "error", "message": "Graph not loaded."}
    return {"status": "loaded", "nodes": len(G.nodes), "edges": len(G.edges)}

@app.get("/hospitals")
async def get_all_hospitals():
    """Return all hospitals in Ernakulam for map rendering."""
    return {"hospitals": cached_hospitals}

@app.get("/hospitals/filter")
async def get_filtered_hospitals(case_type: str):
    valid_hospitals = filter_hospitals(cached_hospitals, case_type)
    return {"hospitals": valid_hospitals}

# ── DRIVER LOCATION ENDPOINTS (Nearest Ambulance Feature) ─────────────────────

@app.put("/drivers/location")
async def update_driver_location(location_data: dict, current_user: dict = Depends(auth.get_current_user)):
    """Drivers periodically report their GPS position and availability status."""
    auth.check_role(current_user, ["driver"])
    db = get_database()
    
    lat = location_data.get("lat")
    lon = location_data.get("lon")
    status = location_data.get("status", "available")
    
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "current_lat": lat,
            "current_lon": lon,
            "driver_status": status,
            "last_location_update": datetime.utcnow()
        }}
    )
    return {"message": "Location updated", "status": status}

@app.get("/drivers/active")
async def get_active_drivers():
    """Return all currently active (non-offline) drivers with their positions."""
    db = get_database()
    cursor = db.users.find({
        "role": "driver",
        "is_approved": True,
        "driver_status": {"$nin": ["offline", None]},
        "current_lat": {"$ne": None},
        "current_lon": {"$ne": None}
    })
    drivers = await cursor.to_list(length=500)
    result = []
    for d in drivers:
        result.append({
            "id": str(d["_id"]),
            "name": d.get("name", "Unknown"),
            "phone": d.get("phone"),
            "lat": d["current_lat"],
            "lon": d["current_lon"],
            "status": d.get("driver_status", "available"),
            "last_update": d.get("last_location_update", "").isoformat() if d.get("last_location_update") else None
        })
    return {"drivers": result}

@app.get("/drivers/nearby")
async def get_nearby_drivers(lat: float, lon: float, radius_km: float = 50.0):
    """Return active drivers sorted by distance from given coordinates."""
    db = get_database()
    cursor = db.users.find({
        "role": "driver",
        "is_approved": True,
        "driver_status": {"$nin": ["offline", None]},
        "current_lat": {"$ne": None},
        "current_lon": {"$ne": None}
    })
    drivers = await cursor.to_list(length=500)
    
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c
    
    result = []
    for d in drivers:
        dist = haversine(lat, lon, d["current_lat"], d["current_lon"])
        if dist <= radius_km:
            result.append({
                "id": str(d["_id"]),
                "name": d.get("name", "Unknown"),
                "phone": d.get("phone"),
                "lat": d["current_lat"],
                "lon": d["current_lon"],
                "status": d.get("driver_status", "available"),
                "distance_km": round(dist, 2),
                "last_update": d.get("last_location_update", "").isoformat() if d.get("last_location_update") else None
            })
    
    result.sort(key=lambda x: x["distance_km"])
    return {"drivers": result}



@app.post("/route")
async def get_route(req: RouteRequest):
    global G, cached_hospitals
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not loaded")
    
    # 1. Select Hospital
    best_hospital = None
    
    if req.hospital_id:
        # User selected a specific hospital
        for h in cached_hospitals:
            if str(h.get("_id")) == req.hospital_id or h.get("id") == req.hospital_id:
                best_hospital = h
                break
        if not best_hospital:
            raise HTTPException(status_code=404, detail="Selected hospital not found")
    else:
        # Automatic selection based on capability
        valid_hospitals = filter_hospitals(cached_hospitals, req.case_type)
        if not valid_hospitals:
            # Failsafe Mode: If no capable hospital available, just return nearest general hospital
            valid_hospitals = cached_hospitals
        
        # Simple straight-line distance to find the nearest valid hospital roughly
        min_dist = float('inf')
        for h in valid_hospitals:
            dist = math.hypot(h["lat"] - req.start_lat, h["lon"] - req.start_lon)
            if dist < min_dist:
                min_dist = dist
                best_hospital = h
                
    if best_hospital is None:
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
    # before each simulation tick, adjust traffic speeds to simulate variability
    if G is not None:
        randomize_traffic(G)

    update_signals(signals) # tick the state machine
    
    preemption_triggered = simulate_step(req.current_lat, req.current_lon, signals)
    
    result = {
        "preemption_active": preemption_triggered,
        "signals": [{"id": s["id"], "lat": s["lat"], "lon": s["lon"], "state": s["state"]} for s in signals]
    }
    # optionally include global traffic summary for debugging/demo
    if G is not None:
        result["traffic_summary"] = get_overall_traffic(G)
    return result

@app.get("/signals/status")
def get_signals_status():
    global signals
    return {"signals": [{"id": s["id"], "lat": s["lat"], "lon": s["lon"], "state": s["state"]} for s in signals]}




if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
