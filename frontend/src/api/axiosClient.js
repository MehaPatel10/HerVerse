import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// attach the JWT (if we have one) to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('herverse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
