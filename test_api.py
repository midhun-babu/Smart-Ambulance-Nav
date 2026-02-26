import requests

BASE_URL = "http://127.0.0.1:8000"

print("Testing /route...")
try:
    res = requests.post(f"{BASE_URL}/route", json={
        "start_lat": 9.9790, 
        "start_lon": 76.2764, 
        "case_type": "Trauma"
    })
    print(res.status_code, res.json())
    
    route = res.json().get('route')
    
    print("\nTesting /simulate/step...")
    res2 = requests.post(f"{BASE_URL}/simulate/step", json={
        "current_lat": 9.9790,
        "current_lon": 76.2764,
        "route": route,
        "speed_kmh": 60
    })
    print(res2.status_code, str(res2.json())[:500])
except Exception as e:
    print(f"Error: {e}")
