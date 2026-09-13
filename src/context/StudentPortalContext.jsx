import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { studentPortalService } from '../services/studentPortalService';

const StudentPortalContext = createContext(null);

export const StudentPortalProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [student, setStudent] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lifespan & Abort management
  const isMountedRef = useRef(true);
  const studentAbortRef = useRef(null);
  const certsAbortRef = useRef(null);
  const activeStudentFetchRef = useRef(false);
  const activeCertsFetchRef = useRef(false);
  const lastFetchedUserKeyRef = useRef('');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (studentAbortRef.current) {
        studentAbortRef.current.abort();
      }
      if (certsAbortRef.current) {
        certsAbortRef.current.abort();
      }
    };
  }, []);

  const studentRef = useRef(student);
  studentRef.current = student;

  const isAbortError = (err) => {
    if (!err) return false;
    return (
      axios.isCancel(err) ||
      err.name === 'CanceledError' ||
      err.name === 'AbortError' ||
      err.code === 'ERR_CANCELED' ||
      err.message === 'canceled'
    );
  };

  const fetchStudent = useCallback(async (isForced = false) => {
    // If auth is still loading or user is not authenticated, do not fetch
    if (authLoading) return;
    if (!isAuthenticated && !user) {
      if (isMountedRef.current) {
        setLoading(false);
        setStudent(null);
      }
      return;
    }

    // Prevent duplicate parallel requests for the same user unless forced (e.g. Retry button)
    const currentUserKey = user?.email || user?.studentId || String(user?.id || '');
    if (!isForced && activeStudentFetchRef.current) {
      return;
    }
    if (!isForced && studentRef.current && lastFetchedUserKeyRef.current === currentUserKey) {
      setLoading(false);
      return;
    }

    if (studentAbortRef.current) {
      studentAbortRef.current.abort();
    }
    const controller = new AbortController();
    studentAbortRef.current = controller;
    activeStudentFetchRef.current = true;

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await studentPortalService.getCurrentStudent(controller.signal);
      if (!isMountedRef.current) return;

      if (data && (data.studentId || data.id || data.fullName)) {
        setStudent(data);
        setError(null);
        lastFetchedUserKeyRef.current = currentUserKey;
      } else {
        setStudent(null);
        setError('No student profile is linked to this account.');
      }
      setLoading(false);
    } catch (err) {
      // If aborted, do NOT mark as error or set loading to false
      if (isAbortError(err)) {
        return;
      }

      if (!isMountedRef.current) return;

      console.error('Error fetching student profile:', err);
      const status = err.response?.status;
      if (status === 401) {
        setError('Your session has expired. Please sign in again.');
      } else if (status === 403) {
        setError('You are not authorized to access this profile.');
      } else if (status === 404) {
        setError('No student profile is linked to this account.');
      } else if (status === 500) {
        setError('Unable to load your profile right now. Please try again later.');
      } else {
        setError(err.response?.data?.message || err.message || 'Unable to load student profile. Please check network connection.');
      }
      setStudent(null);
      setLoading(false);
    } finally {
      activeStudentFetchRef.current = false;
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchCertificates = useCallback(async (isForced = false) => {
    if (authLoading || (!isAuthenticated && !user)) {
      if (isMountedRef.current) setCertificatesLoading(false);
      return;
    }

    if (!isForced && activeCertsFetchRef.current) {
      return;
    }

    if (certsAbortRef.current) {
      certsAbortRef.current.abort();
    }
    const controller = new AbortController();
    certsAbortRef.current = controller;
    activeCertsFetchRef.current = true;

    if (isMountedRef.current) {
      setCertificatesLoading(true);
    }

    try {
      const docs = await studentPortalService.getMyCertificates(controller.signal);
      if (!isMountedRef.current) return;
      setCertificates(Array.isArray(docs) ? docs : []);
      setCertificatesLoading(false);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      if (!isMountedRef.current) return;
      console.error('Error fetching student certificates:', err);
      setCertificates([]);
      setCertificatesLoading(false);
    } finally {
      activeCertsFetchRef.current = false;
    }
  }, [authLoading, isAuthenticated, user]);

  // Handle user change or initial auth resolution
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated && !user) {
      setLoading(false);
      setStudent(null);
      setCertificates([]);
      lastFetchedUserKeyRef.current = '';
      return;
    }

    const currentUserKey = user?.email || user?.studentId || String(user?.id || '');
    if (currentUserKey && currentUserKey !== lastFetchedUserKeyRef.current) {
      // User identity changed or first login: fetch fresh student data
      fetchStudent(true);
      fetchCertificates(true);
    } else if (!studentRef.current && !activeStudentFetchRef.current) {
      // First load for current user
      fetchStudent(false);
      fetchCertificates(false);
    }
  }, [authLoading, isAuthenticated, user, fetchStudent, fetchCertificates]);

  const value = useMemo(() => ({
    student,
    certificates,
    certificateCount: certificates.length,
    loading: authLoading || loading,
    certificatesLoading,
    error,
    refreshStudent: () => fetchStudent(true),
    refreshCertificates: () => fetchCertificates(true),
  }), [
    student,
    certificates,
    authLoading,
    loading,
    certificatesLoading,
    error,
    fetchStudent,
    fetchCertificates,
  ]);

  return (
    <StudentPortalContext.Provider value={value}>
      {children}
    </StudentPortalContext.Provider>
  );
};

export const useStudentPortal = () => {
  const context = useContext(StudentPortalContext);
  if (!context) {
    throw new Error('useStudentPortal must be used within a StudentPortalProvider');
  }
  return context;
};

export default StudentPortalContext;
