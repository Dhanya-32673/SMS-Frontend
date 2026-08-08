import React, { createContext, useContext, useCallback } from 'react';
import ResponsiveToaster from '../components/common/ResponsiveToaster';
import toast from '../utils/toastService';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = 'success', duration = 2000) => (
    toast.show(message, type, { duration })
  ), []);

  const showSuccess = useCallback((message, duration = 2000) => (
    toast.success(message, { duration })
  ), []);

  const showError = useCallback((message, duration = 2000) => (
    toast.error(message, { duration })
  ), []);

  const showWarning = useCallback((message, duration = 2000) => (
    toast.warning(message, { duration })
  ), []);

  const showInfo = useCallback((message, duration = 2000) => (
    toast.info(message, { duration })
  ), []);

  const showDeleteSuccess = useCallback((message = 'Item deleted successfully', duration = 2000) => (
    toast.delete(message, { duration })
  ), []);

  const showUndoToast = useCallback(({ message, durationMs = 5000, onUndo }) => (
    toast.warning(message, { duration: durationMs, onUndo })
  ), []);

  return (
    <ToastContext.Provider value={{
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showDeleteSuccess,
      showUndoToast,
    }}>
      {children}
      <ResponsiveToaster />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => toast.show(msg),
      showSuccess: (msg) => toast.success(msg),
      showError: (msg) => toast.error(msg),
      showWarning: (msg) => toast.warning(msg),
      showInfo: (msg) => toast.info(msg),
      showDeleteSuccess: (msg) => toast.delete(msg),
      showUndoToast: ({ message, onUndo }) => toast.warning(message, { onUndo }),
    };
  }
  return context;
};

export default ToastContext;
