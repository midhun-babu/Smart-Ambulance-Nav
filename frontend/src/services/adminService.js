import api from './api';

export const getPendingUsers = () => api.get('/admin/users/pending');
export const approveUser = (userId) => api.put(`/admin/users/${userId}/approve`);
export const getAllUsers = () => api.get('/admin/users');
export const updateUser = (userId, userData) => api.put(`/admin/users/${userId}`, userData);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

export const getAllHospitals = () => api.get('/admin/hospitals');
export const createHospital = (hospitalData) => api.post('/admin/hospitals', hospitalData);
export const updateHospital = (hospitalId, hospitalData) => api.put(`/admin/hospitals/${hospitalId}`, hospitalData);
export const deleteHospital = (hospitalId) => api.delete(`/admin/hospitals/${hospitalId}`);
