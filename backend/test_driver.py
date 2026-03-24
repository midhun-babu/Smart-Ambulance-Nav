import asyncio
from app.db.session import get_database, ping_database
from app.api.v1.auth import get_password_hash
from datetime import datetime

async def main():
    await ping_database()
    db = get_database()
    
    # 1. Provide an approved driver, explicitly "is_approved": True
    user_dict = {
        "email": "driver1@test.com",
        "name": "Test Driver",
        "role": "driver",
        "password_hash": get_password_hash("password"),
        "is_approved": True,
        "created_at": datetime.utcnow()
    }
    await db.users.delete_many({"email": "driver1@test.com"})
    res = await db.users.insert_one(user_dict)
    print("Created approved driver:", res.inserted_id)

asyncio.run(main())
