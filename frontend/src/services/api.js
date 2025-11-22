import axios from 'axios';
import API_BASE_URL from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        const currentPath = window.location.pathname;
        const publicPaths = ['/welcome', '/phone', '/verify-otp', '/admin/login'];
        const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
        
        if (!isPublicPath) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (currentPath !== '/welcome' && currentPath !== '/phone' && currentPath !== '/verify-otp') {
            window.location.href = '/welcome';
          }
        }
      }
      
      return Promise.reject({
        message: data?.message || 'An error occurred',
        status: status,
        data: data
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: 0
      });
    }
  }
);

export default api;

