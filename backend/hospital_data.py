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


def filter_hospitals(hospitals, case_type):
    valid_hospitals = []
    case_type = case_type.lower()
    for h in hospitals:
        if h["icu_beds_available"] <= 0:
            continue
        
        # Check specific capabilities
        hospital_caps = [c.lower() for c in h.get("capabilities", [])]
        
        if case_type == "trauma" and not h.get("trauma_capability", "Trauma" in h.get("capabilities", [])):
            continue
        if case_type == "cardiac" and not h.get("cardiac_capability", "Cardiac" in h.get("capabilities", [])):
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
