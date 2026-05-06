from fastapi import APIRouter, Depends, HTTPException, status
from app.db.session import get_database
from app.api.v1.auth import get_current_user, check_role
from app.schemas.base import UserUpdate, HospitalUpdate
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/admin", tags=["admin"])

def parse_id(id_str: str):
    try:
        # If it's already an ObjectId-compatible string, parse it
        return ObjectId(id_str)
    except:
        # If it's a numeric ID (from our initial data), we might need to handle it differently
        # But for consistency, we should be using the stringified ObjectId from the DB.
        # For now, let's just keep it strict but ensure we call it correctly.
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {id_str}")

# --- USER MANAGEMENT ---

@router.get("/users/pending")
async def get_pending_users(current_user: dict = Depends(get_current_user)):
    check_role(current_user, ["admin"])
    db = get_database()
    # Find users where is_approved is explicitly False
    cursor = db.users.find({"is_approved": False})
    users = await cursor.to_list(length=100)
    for u in users:
        u["_id"] = str(u["_id"])
        u.pop("password_hash", None)
    return {"users": users}

@router.put("/users/{user_id}/approve")
async def approve_user(user_id: str, current_user: dict = Depends(get_current_user)):
    check_role(current_user, ["admin"])
    db = get_database()
    result = await db.users.update_one(
        {"_id": parse_id(user_id)},
        {"$set": {"is_approved": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User approved successfully"}

@router.get("/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    check_role(current_user, ["admin"])
    db = get_database()
    cursor = db.users.find({})
    users = await cursor.to_list(length=1000)
    for u in users:
        u["_id"] = str(u["_id"])
        u.pop("password_hash", None)
    return {"users": users}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    check_role(current_user, ["admin"])
    db = get_database()
    # Prevent admin from deleting themselves
    if str(current_user["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    result = await db.users.delete_one({"_id": parse_id(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.put("/users/{user_id}")
async def update_user(user_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    check_role(current_user, ["admin"])
    db = get_database()
    
    # Remove immutable fields
    update_data.pop("_id", None)
    update_data.pop("password_hash", None)
    
    # Manual phone validation
    if "phone" in update_data:
        from app.schemas.base import validate_phone_number
        try:
            update_data["phone"] = validate_phone_number(update_data["phone"])
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    if not update_data:
        return {"message": "No changes provided"}
    
    result = await db.users.update_one(
        {"_id": parse_id(user_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated successfully"}

# --- HOSPITAL MANAGEMENT ---


@router.get("/hospitals")
async def admin_get_hospitals(current_user: dict = Depends(get_current_user)):
    check_role(current_user, ["admin"])
    db = get_database()
    cursor = db.hospitals.find({})
    hospitals = await cursor.to_list(length=1000)
    for h in hospitals:
        h["_id"] = str(h["_id"])
    return {"hospitals": hospitals}

@router.post("/hospitals")
async def create_hospital(h_data: dict, current_user: dict = Depends(get_current_user)):
    check_role(current_user, ["admin"])
    db = get_database()
    # Make sure we don't insert arbitrary IDs unless needed, or just insert the dict directly
    result = await db.hospitals.insert_one(h_data)
    return {"message": "Hospital created", "id": str(result.inserted_id)}

@router.put("/hospitals/{hospital_id}")
async def update_hospital(hospital_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    check_role(current_user, ["admin"])
    db = get_database()
    
    # Remove immutable fields
    update_data.pop("_id", None)
    
    # Manual phone validation
    if "phone" in update_data:
        from app.schemas.base import validate_phone_number
        try:
            update_data["phone"] = validate_phone_number(update_data["phone"])
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
    if not update_data:
        return {"message": "No changes provided"}
    
    result = await db.hospitals.update_one(
        {"_id": parse_id(hospital_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return {"message": "Hospital updated successfully"}

@router.delete("/hospitals/{hospital_id}")
async def delete_hospital(hospital_id: str, current_user: dict = Depends(get_current_user)):
    check_role(current_user, ["admin"])
    db = get_database()
    result = await db.hospitals.delete_one({"_id": parse_id(hospital_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return {"message": "Hospital deleted successfully"}
