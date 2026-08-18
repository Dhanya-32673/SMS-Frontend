const ACCESS_TOKEN_KEY = 'sicms_access_token';
const REFRESH_TOKEN_KEY = 'sicms_refresh_token';
const USER_KEY = 'sicms_user';
const ROLE_KEY = 'sicms_role';

export const normalizeRole = (role) => {
  if (!role) return '';
  if (typeof role === 'string') return role.replace(/^ROLE_/i, '').trim().toUpperCase();
  if (role.roleName) return String(role.roleName).replace(/^ROLE_/i, '').trim().toUpperCase();
  if (role.name) return String(role.name).replace(/^ROLE_/i, '').trim().toUpperCase();
  return '';
};

export const tokenUtils = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('token'),

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem('token', token);
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY),

  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  getRole: () => {
    const directRole = localStorage.getItem(ROLE_KEY) || localStorage.getItem('role');
    if (directRole) return normalizeRole(directRole);
    const user = tokenUtils.getUser();
    return user ? normalizeRole(user.role) : '';
  },

  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
      }
      if (user.role) {
        const norm = normalizeRole(user.role);
        localStorage.setItem(ROLE_KEY, norm);
        localStorage.setItem('role', norm);
      }
    }
  },

  saveAuth: (authData) => {
    const token = authData?.token || authData?.accessToken;
    const user = authData?.user;
    const refreshToken = authData?.refreshToken;
    const directRole = authData?.role;

    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem('token', token);
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
      }
      if (user.role) {
        const norm = normalizeRole(user.role);
        localStorage.setItem(ROLE_KEY, norm);
        localStorage.setItem('role', norm);
      }
    } else if (directRole) {
      const norm = normalizeRole(directRole);
      localStorage.setItem(ROLE_KEY, norm);
      localStorage.setItem('role', norm);
    }
    localStorage.removeItem("pendingEmail");
  },

  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("pendingEmail");
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ROLE_KEY);
  }
};

export default tokenUtils;
