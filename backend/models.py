from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float)
    lon = Column(Float)
    trauma_capability = Column(Boolean, default=False)
    cardiac_capability = Column(Boolean, default=False)
    general_capability = Column(Boolean, default=True)
    icu_beds_available = Column(Integer, default=0)
    specialization = Column(String)
    capabilities = Column(JSON) # Store list of capability strings

class TrafficSignal(Base):
    __tablename__ = "traffic_signals"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(Integer, unique=True, index=True)
    lat = Column(Float)
    lon = Column(Float)
    name = Column(String, nullable=True)
    state = Column(String, default="RED")
    timer = Column(Integer, default=30)

class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String, unique=True, index=True)
    status = Column(String, default="AVAILABLE") # AVAILABLE, BUSY, OFFLINE
    current_lat = Column(Float, nullable=True)
    current_lon = Column(Float, nullable=True)

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(Integer, primary_key=True, index=True)
    start_lat = Column(Float)
    start_lon = Column(Float)
    case_type = Column(String)
    status = Column(String, default="PENDING") # PENDING, ASSIGNED, COMPLETED
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    assigned_ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)

    ambulance = relationship("Ambulance")
    hospital = relationship("Hospital")
