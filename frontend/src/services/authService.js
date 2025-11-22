import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  // Send OTP to phone number
  sendOTP: async (phone, countryCode) => {
    const response = await api.post(API_ENDPOINTS.AUTH.SEND_OTP, {
      phone,
      countryCode
    });
    return response;
  },

  // Verify OTP and get token
  verifyOTP: async (phone, countryCode, otp) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      phone,
      countryCode,
      otp
    });
    
    // Store token if received
    if (response.token) {
      localStorage.setItem('token', response.token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    
    return response;
  },

  // Resend OTP
  resendOTP: async (phone, countryCode) => {
    const response = await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, {
      phone,
      countryCode
    });
    return response;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

