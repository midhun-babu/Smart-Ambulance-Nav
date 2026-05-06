import asyncio
import random
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

# Reconfigure stdout for UTF-8 to avoid Windows encoding issues
sys.stdout.reconfigure(encoding='utf-8')

async def simulate_movements():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["smart_ambulance"]
    
    print("🚀 Starting Ambulance Movement Simulator...")
    print("📍 Updating locations of available drivers every 3 seconds.")
    print("Press Ctrl+C to stop.\n")

    while True:
        try:
            # Find all available drivers who have a location
            cursor = db.users.find({
                "role": "driver",
                "driver_status": "available",
                "current_lat": {"$ne": None},
                "current_lon": {"$ne": None}
            })
            drivers = await cursor.to_list(length=100)
            
            if not drivers:
                print("⚠️ No available drivers found to simulate. Run seed_drivers.py first.")
                await asyncio.sleep(5)
                continue

            for driver in drivers:
                # Add a small random delta to create "movement"
                # ~0.0001 degrees is ~11 meters
                lat_delta = random.uniform(-0.0002, 0.0002)
                lon_delta = random.uniform(-0.0002, 0.0002)
                
                new_lat = driver["current_lat"] + lat_delta
                new_lon = driver["current_lon"] + lon_delta
                
                await db.users.update_one(
                    {"_id": driver["_id"]},
                    {"$set": {
                        "current_lat": new_lat,
                        "current_lon": new_lon,
                        "last_location_update": datetime.now(timezone.utc)
                    }}
                )
                
            print(f"🔄 Updated {len(drivers)} ambulances at {datetime.now().strftime('%H:%M:%S')}")
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(simulate_movements())
    except KeyboardInterrupt:
        print("\n🛑 Simulator stopped.")
