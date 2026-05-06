import api from './api';

export const getGraphStatus = () => api.get('/graph/load');
export const getSignalsStatus = () => api.get('/signals/status');
export const getHospitals = () => api.get('/hospitals');
export const getRoute = (startLat, startLon, caseType, hospitalId = null) => 
    api.post('/route', { 
        start_lat: startLat, 
        start_lon: startLon, 
        case_type: caseType,
        hospital_id: hospitalId 
    });
export const postSimulationStep = (currentLat, currentLon, route, speedKmh = 60) =>
    api.post('/simulate/step', { current_lat: currentLat, current_lon: currentLon, route, speed_kmh: speedKmh });


// Driver Location (Nearest Ambulance Feature)
export const updateDriverLocation = (lat, lon, status = 'available') =>
    api.put('/drivers/location', { lat, lon, status });
export const getActiveDrivers = () => api.get('/drivers/active');
export const getNearbyDrivers = (lat, lon, radiusKm = 50) =>
    api.get(`/drivers/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`);

