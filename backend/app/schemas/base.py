from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str # admin, hospital, driver

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class HospitalProfile(BaseModel):
    name: str
    lat: float
    lon: float
    specialization: str
    icu_beds_available: int
    capabilities: List[str]

class DriverProfile(BaseModel):
    name: str
    ambulance_id: str
    current_lat: Optional[float] = None
    current_lon: Optional[float] = None
    status: str = "available" # available, on-mission, offline

class UserOut(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
