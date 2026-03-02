import requests
import time

BASE_URL = "http://localhost:8000"

def test_db_persistence():
    print("Checking hospitals...")
    resp = requests.get(f"{BASE_URL}/hospitals")
    hospitals = resp.json().get("hospitals", [])
    print(f"Found {len(hospitals)} hospitals.")
    
    if len(hospitals) == 0:
        print("FAILED: No hospitals found.")
        return

    print("Checking ambulances...")
    resp = requests.get(f"{BASE_URL}/ambulances")
    ambulances = resp.json().get("ambulances", [])
    print(f"Found {len(ambulances)} ambulances.")
    
    print("Testing route request (should creates an EmergencyRequest in DB)...")
    payload = {
        "start_lat": 9.9312,
        "start_lon": 76.3200,
        "case_type": "trauma"
    }
    resp = requests.post(f"{BASE_URL}/route", json=payload)
    data = resp.json()
    request_id = data.get("request_id")
    print(f"Created emergency request ID: {request_id}")
    
    if not request_id:
        print("FAILED: Request ID not returned.")
        return

    print("Success: Database-backed entities are working.")

if __name__ == "__main__":
    # Note: Backend must be running for this test
    try:
        test_db_persistence()
    except Exception as e:
        print(f"Error: {e}. Is the backend running?")
