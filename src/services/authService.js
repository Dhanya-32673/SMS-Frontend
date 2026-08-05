import api from './api';
import { tokenUtils } from '../utils/tokenUtils';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data) {
      tokenUtils.saveAuth(response.data);
    }
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    if (response.data) {
      tokenUtils.saveAuth(response.data);
    }
    return response.data;
  },

  sendOtp: async (email, purpose = 'LOGIN') => {
    const response = await api.post('/auth/otp/send', { email, purpose });
    return response.data;
  },

  verifyOtp: async (email, otp, purpose = 'LOGIN') => {
    const response = await api.post('/auth/otp/verify', { email, otp, purpose });
    if (response.data && purpose === 'LOGIN') {
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
    if (response.data) {
      tokenUtils.setUser(response.data);
    }
    return response.data;
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/profile/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return response.data;
  },

  adminResetPassword: async (userId, newPassword) => {
    const response = await api.post(`/auth/admin/users/${userId}/reset-password`, {
      newPassword
    });
    return response.data;
  }
};
