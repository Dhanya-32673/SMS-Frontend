import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';
import { tokenUtils } from '../utils/tokenUtils';
import SessionTimeoutModal from '../components/common/SessionTimeoutModal';
import toast from '../utils/toastService';

const AuthContext = createContext(null);

// Inactivity Threshold Constants
const WARNING_TIMEOUT_MS = 55 * 60 * 1000; // 55 minutes of inactivity before warning modal
const WARNING_DURATION_SECONDS = 5 * 60;   // 5 minutes (300s) countdown inside modal
const TOTAL_TIMEOUT_MS = 60 * 60 * 1000;   // 60 minutes total auto-logout threshold
const THROTTLE_MS = 3000;                  // Throttle user activity events to once per 3s

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(tokenUtils.getUser());
  const [loading, setLoading] = useState(true);
  const [isInactiveLoggedOut, setIsInactiveLoggedOut] = useState(false);

  // Inactivity & Modal State
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_DURATION_SECONDS);

  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // Initialize BroadcastChannel for Multi-Tab Sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('sicms_session_channel');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data === 'SESSION_LOGOUT') {
          handleAutoLogout(true);
        } else if (event.data === 'ACTIVITY_RESET') {
          resetInactivityTimer(false);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  const handleAutoLogout = useCallback((isRemote = false) => {
    tokenUtils.clearAuth();
    setUser(null);
    setShowWarningModal(false);
    setIsInactiveLoggedOut(true);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    if (!isRemote && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage('SESSION_LOGOUT');
      } catch (err) {
        console.warn('BroadcastChannel notice:', err);
      }
    }
  }, []);

  const resetInactivityTimer = useCallback((broadcast = true) => {
    lastActivityRef.current = Date.now();

    if (showWarningModal) {
      setShowWarningModal(false);
      setSecondsRemaining(WARNING_DURATION_SECONDS);
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    if (broadcast && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage('ACTIVITY_RESET');
      } catch (err) {
        console.warn('BroadcastChannel notice:', err);
      }
    }

    // Schedule 55-minute warning timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarningModal(true);
      setSecondsRemaining(WARNING_DURATION_SECONDS);

      // Start 5-minute countdown clock
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleAutoLogout(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, WARNING_TIMEOUT_MS);
  }, [showWarningModal, handleAutoLogout]);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenUtils.getAccessToken();
      const cachedUser = tokenUtils.getUser();

      if (token) {
        if (cachedUser) {
          setUser(cachedUser);
          resetInactivityTimer(false);
        }
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            tokenUtils.setUser(currentUser);
            resetInactivityTimer(false);
          }
        } catch (error) {
          if (!cachedUser) {
            tokenUtils.clearAuth();
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [resetInactivityTimer]);

  // Global User Activity Listeners
  useEffect(() => {
    if (!user) return;

    let lastThrottledTime = 0;

    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottledTime > THROTTLE_MS) {
        lastThrottledTime = now;
        if (!showWarningModal) {
          resetInactivityTimer(true);
        }
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'click', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, [user, showWarningModal, resetInactivityTimer]);

  const login = async (email, password) => {
    setIsInactiveLoggedOut(false);
    return await authService.login(email, password);
  };

  const googleLogin = async (idToken) => {
    setIsInactiveLoggedOut(false);
    const data = await authService.googleLogin(idToken);
    return data;
  };

  const verifyOtp = async (email, otp) => {
    setIsInactiveLoggedOut(false);
    const data = await authService.verifyOtp(email, otp);
    if (data.user) {
      setUser(data.user);
    } else {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    }
    resetInactivityTimer(true);
    return data;
  };

  const logout = async () => {
    setIsInactiveLoggedOut(false);
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage('SESSION_LOGOUT');
      } catch (err) {
        console.warn('BroadcastChannel notice:', err);
      }
    }
    await authService.logout();
    tokenUtils.clearAuth();
    setUser(null);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    toast.success('Logout successful.', { operation: 'local:logout' });
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role?.roleName === 'ROLE_ADMIN',
    isFaculty: user?.role === 'FACULTY' || user?.role?.roleName === 'ROLE_FACULTY',
    isInactiveLoggedOut,
    clearInactivityNotice: () => setIsInactiveLoggedOut(false),
    login,
    googleLogin,
    verifyOtp,
    logout,
    resetInactivityTimer: () => resetInactivityTimer(true),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}

      {/* Global Session Timeout Warning Modal */}
      {showWarningModal && (
        <SessionTimeoutModal
          secondsRemaining={secondsRemaining}
          onStayLoggedIn={() => resetInactivityTimer(true)}
          onLogoutNow={() => handleAutoLogout(false)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
