from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime

def validate_phone_number(v):
    if v is None or (isinstance(v, str) and not v.strip()):
        return None
    # Remove common separators
    clean_v = v.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if not clean_v.startswith('+') and not clean_v.isdigit():
        raise ValueError('Phone number must contain only digits or start with +')
    if clean_v.startswith('+'):
        if not clean_v[1:].isdigit() or len(clean_v) < 11:
            raise ValueError('International phone number invalid')
    else:
        if len(clean_v) != 10:
            raise ValueError('Phone number must be exactly 10 digits')
    return v

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str # admin, hospital, driver
    phone: Optional[str] = None
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        return validate_phone_number(v)

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    id: Optional[str] = None

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
    phone: Optional[str] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        return validate_phone_number(v)

class HospitalUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    name: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    specialization: Optional[str] = None
    icu_beds_available: Optional[int] = None
    capabilities: Optional[List[str]] = None
    phone: Optional[str] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        return validate_phone_number(v)

class DriverProfile(BaseModel):
    name: str
    ambulance_id: str
    current_lat: Optional[float] = None
    current_lon: Optional[float] = None
    status: str = "available" # available, not available, offline
    phone: Optional[str] = None

class DriverLocationUpdate(BaseModel):
    lat: float
    lon: float
    status: str = "available" # available, not available, offline

class UserUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_approved: Optional[bool] = None
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        return validate_phone_number(v)

class UserOut(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
