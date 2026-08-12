import axios from 'axios';
import { tokenUtils } from '../utils/tokenUtils';
import apiCache from '../utils/apiCache';
import dataSync from '../utils/dataSync';
import toast from '../utils/toastService';

const rawEnvUrl = import.meta.env.VITE_API_BASE_URL;
const isProduction = import.meta.env.PROD || (typeof window !== 'undefined' && !window.location.hostname.includes('localhost'));

const API_BASE_URL = isProduction
  ? (rawEnvUrl && !rawEnvUrl.includes('localhost') ? rawEnvUrl : 'https://sicms-backend.onrender.com/api')
  : (rawEnvUrl || 'http://localhost:8080/api');

const pendingRequests = new Map();

const getRequestCacheKey = (method, url, config = {}) => {
  const params = config?.params ? JSON.stringify(config.params) : '';
  return `${method.toUpperCase()}:${url}:${params}`;
};

const getRequestCacheTtl = (config = {}) => {
  if (typeof config?.cacheTTL === 'number') return config.cacheTTL;
  if (typeof config?.ttl === 'number') return config.ttl;
  return 30000;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Fast 15-second timeout to prevent button getting stuck
});

export const warmupServer = () => {
  api.get('/health', { timeout: 8000, cache: false })
    .then(() => console.log('>>> [WARMUP] Backend server is active.'))
    .catch(() => console.log('>>> [WARMUP] Backend warming up...'));
};

api.get = function getWithCaching(url, config = {}) {
  const requestKey = getRequestCacheKey('get', url, config);
  const shouldCache = config?.cache !== false;
  const cached = shouldCache ? apiCache.get(requestKey) : null;

  if (cached) {
    return Promise.resolve({
      data: cached,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { ...config, url, method: 'get' },
      request: {},
    });
  }

  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  const requestPromise = api.request({ ...config, method: 'get', url })
    .then((response) => {
      if (shouldCache) {
        apiCache.set(requestKey, response.data, getRequestCacheTtl(config));
      }
      pendingRequests.delete(requestKey);
      return response;
    })
    .catch((error) => {
      pendingRequests.delete(requestKey);
      throw error;
    });

  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
};

// Request Interceptor: Attach Bearer Access Token & Timing Logs
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    console.log(`>>> [API START] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.url && config.url.startsWith('/') && config.baseURL && config.baseURL.endsWith('/api')) {
      config.url = config.url.replace(/^\//, '');
    }
    const token = tokenUtils.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Silent Refresh Token Rotation
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const getMutationScopes = (url = '') => {
  const scopes = new Set(['dashboard']);
  if (url.includes('/students')) scopes.add('students');
  if (url.includes('/documents') || url.includes('/document-types')) scopes.add('certificates');
  if (url.includes('/faculty')) scopes.add('faculty');
  if (url.includes('/academic/sections')) {
    scopes.add('sections');
    scopes.add('students');
    scopes.add('faculty');
  }
  if (url.includes('/academic/groups')) {
    scopes.add('groups');
    scopes.add('sections');
  }
  if (url.includes('/users') || url.includes('/roles')) scopes.add('users');
  return [...scopes];
};

const getOperationMessage = (url = '', method = 'post', failed = false) => {
  const action = method.toLowerCase();
  const prefix = failed ? 'Failed to ' : '';
  if (url.includes('/auth/login') || url.includes('/auth/google') || url.includes('/auth/otp/verify')) return failed ? 'Login failed. Please check your credentials.' : 'Login successful.';
  if (url.includes('/auth/logout')) return failed ? 'Logout failed.' : 'Logout successful.';
  if (url.includes('/auth/otp/send')) return failed ? 'Failed to send verification code.' : 'Verification code sent successfully.';
  if (url.includes('/profile/change-password') || url.includes('/reset-password')) return failed ? 'Failed to change password.' : 'Password changed successfully.';
  if (url.includes('/students')) {
    if (url.includes('/photo')) return failed ? 'Failed to update student.' : 'Profile updated successfully.';
    if (action === 'post') return failed ? 'Failed to add student.' : 'Student added successfully.';
    if (action === 'delete') return failed ? 'Failed to delete student.' : 'Student deleted successfully.';
    return failed ? 'Failed to update student.' : 'Student updated successfully.';
  }
  if (url.includes('/documents')) {
    if (url.includes('/verify')) return failed ? 'Failed to verify certificate.' : 'Certificate verified successfully.';
    if (url.includes('/reject')) return failed ? 'Failed to reject certificate.' : 'Certificate rejected successfully.';
    if (url.includes('/replace')) return failed ? 'Failed to update certificate.' : 'Certificate updated successfully.';
    if (action === 'delete') return failed ? 'Failed to delete certificate.' : 'Certificate deleted successfully.';
    return failed ? 'Failed to upload certificate.' : 'Certificate uploaded successfully.';
  }
  if (url.includes('/faculty')) {
    if (url.includes('/assignments')) return failed ? 'Failed to assign faculty.' : 'Faculty assigned successfully.';
    if (action === 'post') return failed ? 'Failed to add faculty.' : 'Faculty added successfully.';
    if (action === 'delete') return failed ? 'Failed to delete faculty.' : 'Faculty deleted successfully.';
    return failed ? 'Failed to update faculty.' : 'Faculty updated successfully.';
  }
  if (url.includes('/academic/sections')) {
    if (url.includes('/assign')) return failed ? 'Failed to assign student.' : 'Student assigned successfully.';
    if (url.includes('/members') || url.includes('/remove-students')) return failed ? 'Failed to unassign student.' : 'Student unassigned successfully.';
    if (action === 'post') return failed ? 'Failed to create section.' : 'Section created successfully.';
    if (action === 'delete') return failed ? 'Failed to delete section.' : 'Section deleted successfully.';
    return failed ? 'Failed to update section.' : 'Section updated successfully.';
  }
  if (url.includes('/academic/groups')) {
    if (action === 'post') return failed ? 'Failed to create group.' : 'Group created successfully.';
    if (action === 'delete') return failed ? 'Failed to delete group.' : 'Group deleted successfully.';
    return failed ? 'Failed to update group.' : 'Group updated successfully.';
  }
  return failed ? 'Database operation failed.' : 'Data saved successfully.';
};

api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config?.metadata?.startTime || Date.now());
    console.log(`>>> [API END] ${response.config?.method?.toUpperCase()} ${response.config?.url} (${duration}ms)`);
    const method = response.config?.method?.toLowerCase();
    const url = response.config?.url || '';
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      toast.success(getOperationMessage(url, method), { operation: `${method}:${url}` });
    }
    if (['post', 'put', 'patch', 'delete'].includes(method) && !url.startsWith('/auth/')) {
      // Cached GET payloads are never allowed to outlive a successful write.
      apiCache.clear();
      dataSync.invalidate(getMutationScopes(url));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const duration = Date.now() - (originalRequest?.metadata?.startTime || Date.now());
    console.warn(`>>> [API ERROR] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${duration}ms):`, error.message);
    const method = originalRequest?.method?.toLowerCase();
    const url = originalRequest?.url || '';

    // Handle 401 Unauthorized with Refresh Token rotation
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (url.includes('/auth/login') || url.includes('/auth/google') || url.includes('/auth/verify-otp') || url.includes('/auth/refresh')) {
        if (!url.includes('/auth/refresh')) {
          toast.error(getOperationMessage(url, method, true), { operation: `error:${method}:${url}` });
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenUtils.getRefreshToken();

      if (!refreshToken) {
        tokenUtils.clearAuth();
        toast.error('Session expired. Please login again.', { operation: `error:${method}:${url}` });
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken, user } = response.data;

        tokenUtils.saveAuth({ accessToken, refreshToken: newRefreshToken, user });

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenUtils.clearAuth();
        toast.error('Session expired. Please login again.', { operation: `error:${method}:${url}` });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Other non-401 errors
    if (!url.includes('/auth/refresh')) {
      if (error.response?.status === 403) {
        toast.error('Unauthorized access.', { operation: `error:${method}:${url}` });
      } else if (['post', 'put', 'patch', 'delete'].includes(method)) {
        toast.error(getOperationMessage(url, method, true), { operation: `error:${method}:${url}` });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
