import React from 'react';
import { toast as hotToast } from 'react-hot-toast';
import { CustomToast } from '../components/common/ResponsiveToaster';

// Framework-independent notification bridge. Services and Axios interceptors
// can publish notifications without importing React or depending on a screen.
const listeners = new Set();
let lastApiNotification = null;
const recentNotifications = new Map();

const publish = (message, type = 'info', options = {}) => {
  const now = Date.now();
  const key = `${type}:${message}`;

  // Suppress double notifications within short timeframe
  if (!options.operation && lastApiNotification &&
      lastApiNotification.type === type && now - lastApiNotification.at < 350) {
    return null;
  }
  if (lastApiNotification?.key === key && now - lastApiNotification.at < 1200) return null;
  if (now - (recentNotifications.get(key) || 0) < 1200) return null;

  if (options.operation) lastApiNotification = { key, type, at: now };
  recentNotifications.set(key, now);

  const duration = options.duration ?? 2000;

  // Trigger custom animated react-hot-toast via React.createElement
  const toastId = hotToast.custom(
    (t) => React.createElement(CustomToast, {
      t,
      message,
      type,
      title: options.title,
      duration,
      onUndo: options.onUndo,
    }),
    { duration }
  );

  listeners.forEach((listener) => listener({ id: toastId, message, type, duration }));
  return toastId;
};

export const toast = {
  show: publish,
  success: (message, options) => publish(message, 'success', options),
  error: (message, options) => publish(message, 'error', options),
  warning: (message, options) => publish(message, 'warning', options),
  info: (message, options) => publish(message, 'info', options),
  delete: (message, options) => publish(message, 'delete', options),
  dismiss: (id) => hotToast.dismiss(id),
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export default toast;
