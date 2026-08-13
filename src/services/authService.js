import api from './api';
import { tokenUtils } from '../utils/tokenUtils';

export const authService = {
  adminLogin: async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    return response.data;
  },

  verifyAdminOtp: async (email, otp) => {
    const response = await api.post('/auth/admin/verify-otp', { email, otp });
    if (response.data && (response.data.accessToken || response.data.token)) {
      tokenUtils.saveAuth(response.data);
    }
    return response.data;
  },

  facultyLogin: async (email, password) => {
    const response = await api.post('/auth/faculty/login', { email, password });
    if (response.data && (response.data.accessToken || response.data.token)) {
      tokenUtils.saveAuth(response.data);
    }
    return response.data;
  },

  // Step 1: Validate email & password, triggers OTP send
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Step 2: Verify OTP code & receive JWT tokens
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
    console.log('[authService] Calling forgot-password endpoint for:', email);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      console.log('[authService] forgot-password response:', response.data);
      return response.data;
    } catch (err) {
      console.error('[authService] forgot-password error:', err?.response?.data || err.message);
      throw err;
    }
  },

  verifyResetOtp: async (email, otp) => {
    console.log('[authService] Calling verify-reset-otp for:', email);
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, otp });
      console.log('[authService] verify-reset-otp response:', response.data);
      return response.data;
    } catch (err) {
      console.error('[authService] verify-reset-otp error:', err?.response?.data || err.message);
      throw err;
    }
  },

  resetPassword: async (email, otp, newPassword, confirmPassword) => {
    console.log('[authService] Calling reset-password for:', email);
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      console.log('[authService] reset-password response:', response.data);
      return response.data;
    } catch (err) {
      console.error('[authService] reset-password error:', err?.response?.data || err.message);
      throw err;
    }
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
