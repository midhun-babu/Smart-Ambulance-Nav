def get_hospitals():
    return [
        {
            "id": 1,
            "name": "Lakeshore Hospital",
            "lat": 9.9312,
            "lon": 76.3200,
            "trauma_capability": True,
            "cardiac_capability": True,
            "general_capability": True,
            "icu_beds_available": 12,
            "specialization": "Multi-specialty"
        },
        {
            "id": 2,
            "name": "Aster Medcity",
            "lat": 10.0381,
            "lon": 76.2736,
            "trauma_capability": True,
            "cardiac_capability": True,
            "general_capability": True,
            "icu_beds_available": 20,
            "specialization": "Multi-specialty"
        },
        {
            "id": 3,
            "name": "Ernakulam Medical Centre",
            "lat": 9.9922,
            "lon": 76.3150,
            "trauma_capability": False,
            "cardiac_capability": True,
            "general_capability": True,
            "icu_beds_available": 5,
            "specialization": "General"
        },
        {
            "id": 4,
            "name": "General Hospital Ernakulam",
            "lat": 9.9806,
            "lon": 76.2798,
            "trauma_capability": True,
            "cardiac_capability": False,
            "general_capability": True,
            "icu_beds_available": 15,
            "specialization": "Government Hospital"
        },
        {
            "id": 5,
            "name": "Amrita Hospital",
            "lat": 10.0247,
            "lon": 76.2996,
            "trauma_capability": True,
            "cardiac_capability": True,
            "general_capability": True,
            "icu_beds_available": 45,
            "specialization": "Advanced Multi-specialty"
        }
    ]

def filter_hospitals(hospitals, case_type):
    valid_hospitals = []
    case_type = case_type.lower()
    for h in hospitals:
        if h["icu_beds_available"] <= 0:
            continue
        if case_type == "trauma" and not h["trauma_capability"]:
            continue
        if case_type == "cardiac" and not h["cardiac_capability"]:
            continue
        valid_hospitals.append(h)
    return valid_hospitals
