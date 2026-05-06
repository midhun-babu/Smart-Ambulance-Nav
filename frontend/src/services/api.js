import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE,
});

// Add a request interceptor to include the auth token if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
       
        console.error("Global API Error:", error.response?.data?.detail || error.message);
        
        if (error.response?.status === 401) {
            console.warn("Unauthorized access - possible expired token.");
         
        }
        
        return Promise.reject(error);
    }
);

export default api;
