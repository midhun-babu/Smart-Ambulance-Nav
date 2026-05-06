import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from dotenv import load_dotenv

from fastapi import Depends, HTTPException, status, APIRouter

# Load environment variables from .env file
load_dotenv()

from fastapi.security import OAuth2PasswordBearer
from app.db.session import get_database
from app.schemas.base import TokenData, UserCreate, UserLogin, Token

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-it-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

import bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
router = APIRouter(prefix="/auth", tags=["auth"])

def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email, role=role)
    except JWTError:
        raise credentials_exception
    
    db = get_database()
    user = await db.users.find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
    return user

def check_role(user: dict, allowed_roles: list):
    if user.get("role") not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted for your role"
        )
    return True

@router.post("/register")
async def register(user_data: UserCreate):
    db = get_database()
    email = user_data.email
    password = user_data.password
    name = user_data.name
    role = user_data.role
    phone = user_data.phone
    
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if role != "driver":
        raise HTTPException(status_code=400, detail="Only driver registration is allowed.")
    
    hashed_pass = get_password_hash(password)
    is_approved = False
    user_dict = {
        "email": email,
        "name": name,
        "role": "driver",
        "phone": phone,
        "password_hash": hashed_pass,
        "is_approved": is_approved,
        "created_at": datetime.utcnow()
    }
    
    user_id = await db.users.insert_one(user_dict)
    
    return {"message": "Registration successful. Pending admin approval.", "id": str(user_id.inserted_id)}

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.get("role") != "admin" and not user.get("is_approved", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration pending approval from an admin.",
        )
    
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"], "id": str(user["_id"])}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "phone": current_user.get("phone")
    }
