import { useState, useEffect, useCallback } from 'react';

// Global In-Memory Cache Store
const cacheStore = new Map();
const listeners = new Map();
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function invalidateCache(keyPrefix) {
  for (const key of cacheStore.keys()) {
    if (!keyPrefix || key.startsWith(keyPrefix)) {
      cacheStore.delete(key);
    }
  }
  listeners.forEach((notify, key) => {
    if (!keyPrefix || key.startsWith(keyPrefix)) {
      notify();
    }
  });
}

export function prefetchData(key, fetcher) {
  const cached = cacheStore.get(key);
  const isStale = !cached || (Date.now() - cached.timestamp > STALE_TIME);
  if (isStale) {
    fetcher()
      .then((data) => {
        cacheStore.set(key, { data, timestamp: Date.now() });
      })
      .catch(() => {});
  }
}

export function useApiCache(key, fetcher, options = {}) {
  const { enabled = true, staleTime = STALE_TIME } = options;

  const getCachedData = () => {
    const entry = cacheStore.get(key);
    if (!entry) return null;
    return entry.data;
  };

  const initialData = getCachedData();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && enabled);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!enabled) return;
      if (!isBackground && !getCachedData()) {
        setLoading(true);
      }
      try {
        const result = await fetcher();
        cacheStore.set(key, { data: result, timestamp: Date.now() });
        setData(result);
        setError(null);
      } catch (err) {
        if (!getCachedData()) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [key, fetcher, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const entry = cacheStore.get(key);
    const isStale = !entry || Date.now() - entry.timestamp > staleTime;

    if (entry) {
      setData(entry.data);
      setLoading(false);
    }

    if (isStale) {
      fetchData(!!entry);
    }

    const onUpdate = () => {
      const updatedEntry = cacheStore.get(key);
      if (updatedEntry) {
        setData(updatedEntry.data);
        setLoading(false);
      } else {
        fetchData(false);
      }
    };

    listeners.set(key, onUpdate);

    return () => {
      listeners.delete(key);
    };
  }, [key, enabled, staleTime, fetchData]);

  const mutate = (newData) => {
    cacheStore.set(key, { data: newData, timestamp: Date.now() });
    setData(newData);
  };

  const refetch = () => fetchData(false);

  return { data, loading, error, refetch, mutate };
}
