import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.hospital_data import get_hospitals

async def main():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['smart_ambulance']

    count = await db.hospitals.count_documents({})
    if count > 0:
        print(f"Hospitals collection already has {count} documents. Skipping.")
        return

    hospitals = get_hospitals()
    result = await db.hospitals.insert_many(hospitals)
    print(f"Inserted {len(result.inserted_ids)} hospitals into MongoDB.")

asyncio.run(main())
