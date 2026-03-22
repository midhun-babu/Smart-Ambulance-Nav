import api from './api';

export const getGraphStatus = () => api.get('/graph/load');
export const getSignalsStatus = () => api.get('/signals/status');
export const getHospitals = () => api.get('/hospitals');
export const getOsmSignals = () => api.get('/overpass/signals');
export const getRoute = (startLat, startLon, caseType) => 
    api.post('/route', { start_lat: startLat, start_lon: startLon, case_type: caseType });
export const postSimulationStep = (currentLat, currentLon, route, speedKmh = 60) =>
    api.post('/simulate/step', { current_lat: currentLat, current_lon: currentLon, route, speed_kmh: speedKmh });
export const triggerPreemption = (signalId) => api.post(`/preemption/trigger/${signalId}`);
