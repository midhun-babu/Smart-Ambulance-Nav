import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['smart_ambulance']
    admin = await db.users.find_one({'email': 'admin@gmail.com'})
    print(admin)

asyncio.run(main())
