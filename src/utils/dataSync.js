/**
 * Small, dependency-free query invalidation bus.
 *
 * All successful API mutations publish the data domains they change. Mounted
 * views subscribe only to the domains they render, so a write updates related
 * lists, counters and dashboards without a route or browser reload.
 */
import { useEffect, useRef } from 'react';

const listeners = new Set();

export const dataSync = {
  invalidate(scopes) {
    const changed = new Set(Array.isArray(scopes) ? scopes : [scopes]);
    listeners.forEach((listener) => {
      try {
        listener(changed);
      } catch (err) {
        console.warn('dataSync listener error:', err);
      }
    });
  },

  notify(scopes) {
    this.invalidate(scopes);
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** Refetch a mounted view once when one of its data domains changes. */
export function useDataRefresh(scopes, refresh) {
  const refreshRef = useRef(refresh);
  const scopesRef = useRef(scopes);
  const scheduledRef = useRef(false);
  refreshRef.current = refresh;
  scopesRef.current = scopes;
  const scopeKey = Array.isArray(scopes) ? scopes.slice().sort().join('|') : String(scopes);

  useEffect(() => dataSync.subscribe((changed) => {
    if (!Array.isArray(scopesRef.current) || !scopesRef.current.some((scope) => changed.has(scope))) return;
    // A mutation can affect several domains; coalesce it into one fetch/frame.
    if (scheduledRef.current) return;
    scheduledRef.current = true;
    requestAnimationFrame(() => {
      scheduledRef.current = false;
      if (typeof refreshRef.current === 'function') {
        refreshRef.current();
      }
    });
  }), [scopeKey]); // scopes are expected to be stable literals
}

export default dataSync;
