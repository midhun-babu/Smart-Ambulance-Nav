import asyncio
from app.db.session import get_database, ping_database

async def main():
    await ping_database()
    db = get_database()
    cursor = db.users.find({})
    users = await cursor.to_list(length=100)
    for u in users:
        print({k: v for k, v in u.items() if k != 'password_hash'})

asyncio.run(main())
