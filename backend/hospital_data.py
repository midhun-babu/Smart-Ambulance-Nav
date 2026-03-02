from models import Hospital as HospitalModel
from sqlalchemy.orm import Session

def get_hospitals():
    """
    Comprehensive list of hospitals in Ernakulam district, Kerala.
    Coordinates are real OSM-verified locations.
    """
    return [
        # ── South Kochi / Kakkanad ─────────────────────────────────────────
        {
            "id": 1,
            "name": "Lakeshore Hospital",
            "lat": 9.9312, "lon": 76.3200,
            "trauma_capability": True, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 12, "specialization": "Multi-specialty",
            "capabilities": ["Trauma", "Cardiac", "ICU", "General"]
        },
        {
            "id": 2,
            "name": "Aster Medcity",
            "lat": 10.0381, "lon": 76.2736,
            "trauma_capability": True, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 20, "specialization": "Multi-specialty",
            "capabilities": ["Trauma", "Cardiac", "Neuro", "ICU", "Pediatric"]
        },
        {
            "id": 3,
            "name": "Ernakulam Medical Centre",
            "lat": 9.9922, "lon": 76.3150,
            "trauma_capability": False, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 5, "specialization": "General",
            "capabilities": ["Cardiac", "General", "ICU"]
        },
        {
            "id": 4,
            "name": "General Hospital Ernakulam",
            "lat": 9.9806, "lon": 76.2798,
            "trauma_capability": True, "cardiac_capability": False, "general_capability": True,
            "icu_beds_available": 15, "specialization": "Government Hospital",
            "capabilities": ["Trauma", "General", "ICU"]
        },
        {
            "id": 5,
            "name": "Amrita Hospital",
            "lat": 10.0247, "lon": 76.2996,
            "trauma_capability": True, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 45, "specialization": "Advanced Multi-specialty",
            "capabilities": ["Trauma", "Cardiac", "Neuro", "Burns", "ICU", "Pediatric"]
        },
        # ── Fort Kochi / Mattancherry ────────────────────────────────────────
        {
            "id": 6,
            "name": "District Hospital – Fort Kochi",
            "lat": 9.9659, "lon": 76.2426,
            "trauma_capability": True, "cardiac_capability": False, "general_capability": True,
            "icu_beds_available": 8, "specialization": "Government Hospital",
            "capabilities": ["Trauma", "General"]
        },
        {
            "id": 7,
            "name": "Lisie Hospital",
            "lat": 9.9784, "lon": 76.2977,
            "trauma_capability": True, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 18, "specialization": "Multi-specialty",
            "capabilities": ["Trauma", "Cardiac", "ICU", "Maternity"]
        },
        {
            "id": 8,
            "name": "Renai Medicity",
            "lat": 9.9717, "lon": 76.2930,
            "trauma_capability": True, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 10, "specialization": "Multi-specialty",
            "capabilities": ["Trauma", "Cardiac", "ICU", "General"]
        },
        # ── Aluva / North Ernakulam ──────────────────────────────────────────
        {
            "id": 9,
            "name": "Taluk Hospital Aluva",
            "lat": 10.1010, "lon": 76.3530,
            "trauma_capability": True, "cardiac_capability": False, "general_capability": True,
            "icu_beds_available": 6, "specialization": "Government Hospital",
            "capabilities": ["Trauma", "General"]
        },
        {
            "id": 10,
            "name": "Holy Cross Hospital – Aluva",
            "lat": 10.1048, "lon": 76.3524,
            "trauma_capability": False, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 4, "specialization": "General",
            "capabilities": ["Cardiac", "General", "Maternity"]
        },
        # ── Angamaly / Perumbavoor ────────────────────────────────────────────
        {
            "id": 11,
            "name": "St. Joseph's Hospital – Angamaly",
            "lat": 10.1956, "lon": 76.3839,
            "trauma_capability": True, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 9, "specialization": "Multi-specialty",
            "capabilities": ["Trauma", "Cardiac", "ICU", "General"]
        },
        {
            "id": 12,
            "name": "Perumbavoor Taluk Hospital",
            "lat": 10.1103, "lon": 76.4741,
            "trauma_capability": True, "cardiac_capability": False, "general_capability": True,
            "icu_beds_available": 7, "specialization": "Government Hospital",
            "capabilities": ["Trauma", "General"]
        },
        # ── Tripunithura / Thrikkakara ────────────────────────────────────────
        {
            "id": 13,
            "name": "Tripunithura Taluk Hospital",
            "lat": 9.9454, "lon": 76.3491,
            "trauma_capability": True, "cardiac_capability": False, "general_capability": True,
            "icu_beds_available": 5, "specialization": "Government Hospital",
            "capabilities": ["Trauma", "General"]
        },
        {
            "id": 14,
            "name": "KIMS Hospital – Thrikkakara",
            "lat": 10.0289, "lon": 76.3419,
            "trauma_capability": True, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 14, "specialization": "Multi-specialty",
            "capabilities": ["Trauma", "Cardiac", "Neuro", "ICU"]
        },
        # ── Muvattupuzha ──────────────────────────────────────────────────────
        {
            "id": 15,
            "name": "Muvattupuzha District Hospital",
            "lat": 9.9912, "lon": 76.5775,
            "trauma_capability": True, "cardiac_capability": False, "general_capability": True,
            "icu_beds_available": 10, "specialization": "Government Hospital",
            "capabilities": ["Trauma", "General", "ICU"]
        },
        # ── Angamaly / North Ernakulam ──────────────────────────────────────────
        {
            "id": 16,
            "name": "Apollo Adlux Hospital – Angamaly",
            "lat": 10.1956, "lon": 76.4018,
            "trauma_capability": True, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 30, "specialization": "Advanced Multi-specialty",
            "capabilities": ["Trauma", "Cardiac", "Neuro", "Burns", "ICU"]
        },
        {
            "id": 17,
            "name": "Baby Memorial Hospital – Ernakulam",
            "lat": 9.9985, "lon": 76.3033,
            "trauma_capability": False, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 8, "specialization": "General + Pediatric",
            "capabilities": ["Cardiac", "Pediatric", "Maternity", "General"]
        },
        {
            "id": 18,
            "name": "PVS Memorial Hospital",
            "lat": 10.0053, "lon": 76.3178,
            "trauma_capability": True, "cardiac_capability": True, "general_capability": True,
            "icu_beds_available": 11, "specialization": "Multi-specialty",
            "capabilities": ["Trauma", "Cardiac", "ICU", "General"]
        },
    ]

def seed_hospitals(db: Session):
    """Seed the database with initial hospital data if empty."""
    if db.query(HospitalModel).count() == 0:
        hospitals_data = get_hospitals()
        for h in hospitals_data:
            db_h = HospitalModel(
                name=h["name"],
                lat=h["lat"],
                lon=h["lon"],
                trauma_capability=h["trauma_capability"],
                cardiac_capability=h["cardiac_capability"],
                general_capability=h["general_capability"],
                icu_beds_available=h["icu_beds_available"],
                specialization=h["specialization"],
                capabilities=h["capabilities"]
            )
            db.add(db_h)
        db.commit()
        print(f"Seeded {len(hospitals_data)} hospitals into the database.")

def filter_hospitals(hospitals_list, case_type):
    # hospitals_list can be a list of dicts or Hospital model instances
    valid_hospitals = []
    case_type = case_type.lower()
    for h in hospitals_list:
        # Normalize access (dict vs object)
        if hasattr(h, 'icu_beds_available'):
             icu = h.icu_beds_available
             caps = h.capabilities
             trauma = h.trauma_capability
             cardiac = h.cardiac_capability
        else:
             icu = h.get("icu_beds_available", 0)
             caps = h.get("capabilities", [])
             trauma = h.get("trauma_capability", False)
             cardiac = h.get("cardiac_capability", False)

        if icu <= 0:
            continue
        
        # Check specific capabilities
        hospital_caps = [c.lower() for c in (caps or [])]
        
        if case_type == "trauma" and not (trauma or "trauma" in hospital_caps):
            continue
        if case_type == "cardiac" and not (cardiac or "cardiac" in hospital_caps):
            continue
            
        # Handle stroke, burns, etc. via capabilities list
        if case_type in ["stroke", "neuro"] and "neuro" not in hospital_caps:
            continue
        if case_type == "burns" and "burns" not in hospital_caps:
            continue
        if case_type == "pediatric" and "pediatric" not in hospital_caps:
            continue
            
        valid_hospitals.append(h)
    return valid_hospitals
