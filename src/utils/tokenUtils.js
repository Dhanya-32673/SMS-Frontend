// SessionStorage Keys (Session-based browser storage clears when tab/browser closes)
const ACCESS_TOKEN_KEY = 'sicms_access_token';
const REFRESH_TOKEN_KEY = 'sicms_refresh_token';
const USER_KEY = 'sicms_user';

export const tokenUtils = {
  getAccessToken: () => sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY),

  setAccessToken: (token) => {
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  getRefreshToken: () => sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY),

  setRefreshToken: (token) => {
    if (token) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  getUser: () => {
    const userStr = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setUser: (user) => {
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  saveAuth: (authData) => {
    if (authData?.accessToken) sessionStorage.setItem(ACCESS_TOKEN_KEY, authData.accessToken);
    if (authData?.refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    if (authData?.user) sessionStorage.setItem(USER_KEY, JSON.stringify(authData.user));
  },

  clearAuth: () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    // Also purge legacy localStorage keys to prevent stale authentication
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export default tokenUtils;
