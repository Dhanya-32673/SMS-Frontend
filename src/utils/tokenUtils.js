const ACCESS_TOKEN_KEY = 'sicms_access_token';
const REFRESH_TOKEN_KEY = 'sicms_refresh_token';
const USER_KEY = 'sicms_user';

export const tokenUtils = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY),

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
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
    }
  },

  saveAuth: (authData) => {
    const token = authData?.token || authData?.accessToken;
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    if (authData?.refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    }
    if (authData?.user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(authData.user));
    }
  },

  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
};

export default tokenUtils;
