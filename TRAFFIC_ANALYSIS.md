# Real-Time Traffic Analysis – Demo Feature

## Overview

This feature adds **dynamic traffic-aware routing** to the ambulance system. Instead of using static speeds from OpenStreetMap, the system now:

- **Randomly varies speeds** on every edge to simulate real-world traffic fluctuations
- **Uses OpenStreetMap maxspeed tags** as baseline (`base_speed_kph`) when available
- **Re-computes travel times** dynamically as speeds change
- **Routes based on current conditions** rather than free-flow times
- **Provides traffic endpoints** for querying and visualizing congestion

---

## Architecture Changes

### 1. **graph_loader.py** – Enhanced with Traffic Attributes

When loading the graph, each edge now gets:

```python
data['base_speed_kph']      # baseline from OSM maxspeed or assigned speed
data['current_speed_kph']   # current speed (varies over time)
data['current_travel_time'] # computed as: length / current_speed_kph * 3600
```

The `base_speed_kph` is extracted from OSM's `maxspeed` tag if available; otherwise, it uses OSMnx's assigned speed.

### 2. **traffic.py** – New Module (Demo Traffic Logic)

Three main functions:

- **`randomize_traffic(G, variation=0.3)`**  
  Applies ±30% random variation to each edge's current speed, simulating traffic waves.  
  Speeds are clamped to a minimum of 5 km/h to avoid zero division.

- **`get_route_traffic(G, route_nodes)`**  
  Returns per-segment traffic info: node IDs, current speed, and travel time for a computed route.

- **`get_overall_traffic(G)`**  
  Returns global statistics: min/max/avg speeds across the entire network.

### 3. **routing.py** – Dynamic Weight Function

The `_edge_weight()` function now:

```python
def _edge_weight(u, v, data):
    return data.get('current_travel_time', data.get('travel_time', 0))
```

Both A\* and Dijkstra use this weight, so routes adapt to the **current** traffic state rather than static baseline.

### 4. **main.py** – New Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/traffic/status` | GET | Returns global traffic summary (min/avg/max speed) |
| `/traffic/randomize` | POST | Manually trigger a traffic update cycle |
| `/traffic/route` | POST | Fetch per-segment traffic data for a hospital route |
| `/simulate/step` | POST | (Enhanced) Now includes `traffic_summary` in response |

### 5. **simulation.py** – Unchanged

The geofencing logic remains the same; traffic variation happens independently.

### 6. **signal_model.py** – Unchanged

Traffic and signal preemption are decoupled; signals still cycle normally or preempt on proximity.

---

## Example Usage

### Get Overall Traffic Status

```bash
curl http://localhost:8000/traffic/status
```

Response:
```json
{
  "traffic": {
    "min_speed": 7.12,
    "max_speed": 109.44,
    "avg_speed": 29.85,
    "count": 32799
  }
}
```

### Trigger Manual Traffic Update

```bash
curl -X POST http://localhost:8000/traffic/randomize
```

Response:
```json
{"status": "ok"}
```

### Get Traffic-Aware Route to Hospital

```bash
curl -X POST http://localhost:8000/traffic/route \
  -H "Content-Type: application/json" \
  -d '{
    "start_lat": 9.9790,
    "start_lon": 76.2764,
    "case_type": "Trauma"
  }'
```

Response includes per-edge speeds and travel times:
```json
{
  "segments": [
    {
      "u": 1907420175,
      "v": 1907420182,
      "speed_kph": 40.28,
      "travel_time": 1538.48
    },
    ...
  ],
  "estimated_time": 142787.67
}
```

### Simulate an Ambulance Step (With Traffic)

Every `/simulate/step` call randomizes traffic:

```bash
curl -X POST http://localhost:8000/simulate/step \
  -H "Content-Type: application/json" \
  -d '{
    "current_lat": 9.9790,
    "current_lon": 76.2764,
    "route": [[...], ...],
    "speed_kmh": 60
  }'
```

Response now includes traffic summary:
```json
{
  "preemption_active": false,
  "signals": [...],
  "traffic_summary": {
    "min_speed": 7.12,
    "max_speed": 109.44,
    "avg_speed": 29.85,
    "count": 32799
  }
}
```

---

## Features

✅ **Dynamic Routing**  
Routes adapt every time traffic changes without explicit re-routing calls.

✅ **OSM Speed Limits**  
`base_speed_kph` respects OpenStreetMap `maxspeed` tags.

✅ **Per-Edge Visibility**  
Query current speed and travel time for any route segment.

✅ **Global Metrics**  
Monitor network-wide congestion via the status endpoint.

✅ **Configurable Variation**  
Default ±30% variation; easily adjustable in `randomize_traffic()`.

✅ **Decoupled from Signals**  
Traffic and preemption logic are independent; can evolve separately.

---

## Future Extensions

### Real Data Integration

When a real traffic API is available (Google Maps, TomTom, HERE, etc.), replace `randomize_traffic()` with:

```python
async def poll_live_traffic():
    while True:
        resp = await httpx.get("https://api.traffic-provider.com/flows")
        for edge_update in resp.json():
            u, v = edge_update['edge_id'].split(':')
            speed = edge_update['speed_kph']
            G.edges[u, v, 0]['current_speed_kph'] = speed
            # recalc travel time
        await asyncio.sleep(30)
```

Then register in `main.py`'s lifespan:

```python
async def lifespan(app):
    ...
    asyncio.create_task(poll_live_traffic())
    yield
```

### Historical Traffic Patterns

Use OSMnx's time-dependent travel times to incorporate rush-hour patterns:

```python
G = ox.add_edge_travel_times(G, speed_kph=..., traffic_model='all')
```

### Congestion-Triggered Re-routing

After `/simulate/step`, check if estimated time on current route has grown significantly, and offer `/route/recalculate` to the frontend.

### Visualization

Frontend can fetch `/traffic/route` at each step and colour-code the polyline:
- 🟢 Green: `speed ≥ 70` km/h (free flow)
- 🟡 Yellow: `30–70` km/h (moderate)
- 🔴 Red: `< 30` km/h (congested)

---

## Testing

Run the included test suite to verify:

```bash
py test_route.py      # Tests routing with dynamic weights
py test_api.py        # Tests all endpoints including traffic
```

Both scripts exercise the randomization and verify that traffic speeds vary correctly.

---

## Implementation Notes

- **Multigraph Handling**: The weight function detects edge data dicts and picks the minimum travel time among parallel edges.
- **Minimum Speed**: Speeds are clamped to 5 km/h to avoid infinite travel times.
- **Stateless Updates**: Each `randomize_traffic()` call is independent; there is no "congestion memory" (no waves propagate). This can be enhanced later with state machines.
- **Demo Mode**: Currently, variation is uniform random. Real systems would use historical patterns, real-time sensor data, or crowd-sourced reports.

---

## Files Modified

- ✏️ [graph_loader.py](backend/graph_loader.py) – Add `base_speed_kph` and `current_speed_kph` to edges
- ✏️ [routing.py](backend/routing.py) – Switch to dynamic weight function
- ✨ [traffic.py](backend/traffic.py) – New module with randomization and query functions
- ✏️ [main.py](backend/main.py) – Add `/traffic/*` endpoints and integrate traffic into `/simulate/step`
- ✏️ [test_api.py](test_api.py) – Extended with traffic endpoint tests
- ✏️ [test_route.py](test_route.py) – Call `randomize_traffic()` to verify initialization

