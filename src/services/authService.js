import api from './api';
import { tokenUtils } from '../utils/tokenUtils';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.accessToken) {
      tokenUtils.saveAuth(response.data);
    }
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    if (response.data && response.data.accessToken) {
      tokenUtils.saveAuth(response.data);
    }
    return response.data;
  },

  sendOtp: async (email, purpose = 'LOGIN') => {
    const response = await api.post('/auth/resend-otp', { email, purpose });
    return response.data;
  },

  resendOtp: async (email, purpose = 'LOGIN') => {
    const response = await api.post('/auth/resend-otp', { email, purpose });
    return response.data;
  },

  verifyOtp: async (email, otp, purpose = 'LOGIN') => {
    const response = await api.post('/auth/verify-otp', { email, otp, purpose });
    if (response.data && response.data.accessToken) {
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

  changePassword: async (param1, param2, param3) => {
    let payload = {};
    if (typeof param1 === 'object' && param1 !== null) {
      payload = {
        currentPassword: param1.currentPassword,
        newPassword: param1.newPassword,
        confirmPassword: param1.confirmPassword || param1.newPassword,
      };
    } else {
      payload = {
        currentPassword: param1,
        newPassword: param2,
        confirmPassword: param3 || param2,
      };
    }
    const response = await api.put('/profile/change-password', payload);
    return response.data;
  },

  adminResetPassword: async (userId, newPassword) => {
    const response = await api.post(`/auth/admin/users/${userId}/reset-password`, {
      newPassword
    });
    return response.data;
  }
};
