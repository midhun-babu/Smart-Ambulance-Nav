"""
Seed script: Create simulated active ambulance drivers
scattered across Ernakulam district for demo purposes.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

SIMULATED_DRIVERS = [
    {
        "name": "Arun Kumar",
        "email": "arun.driver@demo.local",
        "phone": "+91 94950 11001",
        "current_lat": 9.9720,
        "current_lon": 76.2850,
        "area": "MG Road",
    },
    {
        "name": "Deepak S",
        "email": "deepak.driver@demo.local",
        "phone": "+91 94950 11002",
        "current_lat": 10.0275,
        "current_lon": 76.3085,
        "area": "Edappally",
    },
    {
        "name": "Rahul Menon",
        "email": "rahul.driver@demo.local",
        "phone": "+91 94950 11003",
        "current_lat": 9.9455,
        "current_lon": 76.3200,
        "area": "Lakeshore / Nettoor",
    },
    {
        "name": "Suresh P",
        "email": "suresh.driver@demo.local",
        "phone": "+91 94950 11004",
        "current_lat": 10.0100,
        "current_lon": 76.3610,
        "area": "Kakkanad / Infopark",
    },
    {
        "name": "Vishnu R",
        "email": "vishnu.driver@demo.local",
        "phone": "+91 94950 11005",
        "current_lat": 9.9680,
        "current_lon": 76.3180,
        "area": "Vytila Junction",
    },
    {
        "name": "Akhil Thomas",
        "email": "akhil.driver@demo.local",
        "phone": "+91 94950 11006",
        "current_lat": 10.1050,
        "current_lon": 76.3520,
        "area": "Aluva",
    },
    {
        "name": "Sajan George",
        "email": "sajan.driver@demo.local",
        "phone": "+91 94950 11007",
        "current_lat": 9.9660,
        "current_lon": 76.2430,
        "area": "Fort Kochi",
    },
    {
        "name": "Manoj V",
        "email": "manoj.driver@demo.local",
        "phone": "+91 94950 11008",
        "current_lat": 9.9940,
        "current_lon": 76.2990,
        "area": "Kaloor",
    },
    {
        "name": "Nikhil Das",
        "email": "nikhil.driver@demo.local",
        "phone": "+91 94950 11009",
        "current_lat": 10.0540,
        "current_lon": 76.3580,
        "area": "Kalamassery",
    },
    {
        "name": "Jithin M",
        "email": "jithin.driver@demo.local",
        "phone": "+91 94950 11010",
        "current_lat": 9.9500,
        "current_lon": 76.3490,
        "area": "Tripunithura",
    },
]


async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["smart_ambulance"]

    # Import password hasher
    import sys, os
    sys.path.insert(0, os.path.dirname(__file__))
    from app.api.v1.auth import get_password_hash

    inserted = 0
    skipped = 0

    for driver in SIMULATED_DRIVERS:
        existing = await db.users.find_one({"email": driver["email"]})
        if existing:
            # Update location in case it already exists
            await db.users.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "current_lat": driver["current_lat"],
                    "current_lon": driver["current_lon"],
                    "driver_status": "available",
                    "last_location_update": datetime.now(timezone.utc),
                    "phone": driver["phone"],
                }}
            )
            skipped += 1
            continue

        user_doc = {
            "email": driver["email"],
            "name": driver["name"],
            "phone": driver["phone"],
            "role": "driver",
            "password_hash": get_password_hash("demo1234"),
            "is_approved": True,
            "current_lat": driver["current_lat"],
            "current_lon": driver["current_lon"],
            "driver_status": "available",
            "last_location_update": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user_doc)
        inserted += 1
        print(f"  [OK] {driver['name']} @ {driver['area']} ({driver['current_lat']}, {driver['current_lon']})")

    print(f"\nDone! Inserted: {inserted}, Updated: {skipped}")


if __name__ == "__main__":
    asyncio.run(main())
