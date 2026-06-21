import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api/v1' 
    : 'https://fullstack-w6hb.onrender.com/api/v1');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use((response) => {
  if (response.data) {
    let strData = JSON.stringify(response.data);
    strData = strData.replace(/http:\/\/res\.cloudinary\.com/g, 'https://res.cloudinary.com');
    response.data = JSON.parse(strData);
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;