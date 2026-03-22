import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.api.v1.auth import get_password_hash

async def main():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['smart_ambulance']
    
    admin_exists = await db.users.find_one({"email": "admin@gmail.com"})
    if not admin_exists:
        print("Inserting admin@gmail.com...")
        await db.users.insert_one({
            "email": "admin@gmail.com",
            "name": "System Admin",
            "role": "admin",
            "password_hash": get_password_hash("1234"),
            "is_approved": True,
            "created_at": datetime.utcnow()
        })
        print("Done!")
    else:
        print("Admin already exists.")

asyncio.run(main())
