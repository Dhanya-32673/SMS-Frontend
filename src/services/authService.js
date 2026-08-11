import api from './api';
import { tokenUtils } from '../utils/tokenUtils';

export const authService = {
  // Step 1: Validate email & password, triggers OTP send
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Step 2: Verify 6-digit OTP code & receive JWT tokens
  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    if (response.data && (response.data.accessToken || response.data.token)) {
      tokenUtils.saveAuth(response.data);
    }
    return response.data;
  },

  // Resend OTP code
  resendOtp: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  sendOtp: async (email, purpose = 'LOGIN') => {
    const response = await api.post('/auth/resend-otp', { email, purpose });
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    if (response.data && (response.data.accessToken || response.data.token)) {
      tokenUtils.saveAuth(response.data);
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword, confirmPassword) => {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  logout: async () => {
    try {
      const refreshToken = tokenUtils.getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore network failure on logout
    } finally {
      tokenUtils.clearAuth();
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
