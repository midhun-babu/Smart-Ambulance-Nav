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
    s = str(res2.json())
    print(res2.status_code, s[0:500] if len(s) > 500 else s)

    print("\nTesting /traffic/status...")
    res3 = requests.get(f"{BASE_URL}/traffic/status")
    print(res3.status_code, res3.json())

    print("\nTriggering /traffic/randomize...")
    res4 = requests.post(f"{BASE_URL}/traffic/randomize")
    print(res4.status_code, res4.json())

    print("\nTesting /traffic/route...")
    res5 = requests.post(f"{BASE_URL}/traffic/route", json={
        "start_lat": 9.9790,
        "start_lon": 76.2764,
        "case_type": "Trauma"
    })
    print(res5.status_code, res5.json())
except Exception as e:
    print(f"Error: {e}")
