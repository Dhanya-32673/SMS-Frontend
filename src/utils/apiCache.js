/**
 * High-performance In-Memory API Response Cache for Static and Frequently Read Endpoints
 */
const memoryCache = new Map();

export const apiCache = {
  get: (key) => {
    const cached = memoryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return cached.data;
  },

  set: (key, data, ttlMs = 30000) => { // default 30s TTL
    memoryCache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  },

  clear: (keyPrefix = null) => {
    if (!keyPrefix) {
      memoryCache.clear();
      return;
    }
    const cleanPrefix = keyPrefix.startsWith('/') ? keyPrefix : `/${keyPrefix}`;
    for (const key of memoryCache.keys()) {
      if (key.includes(cleanPrefix) || key.startsWith(keyPrefix) || key.includes(keyPrefix)) {
        memoryCache.delete(key);
      }
    }
  },
};

export default apiCache;
