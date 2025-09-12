import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api';

console.log('🌐 API Base URL:', API_BASE_URL);

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🔄 Making API request:', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Added Authorization header');
    } else {
      console.log('❌ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('🚨 API Error:', error.response?.status, error.config?.url);
    console.error('🚨 Error Details:', error.response?.data);
    return Promise.reject(error);
  }
);