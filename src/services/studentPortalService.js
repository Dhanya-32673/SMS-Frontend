import api from './api.js';

/**
 * Normalizes raw backend StudentResponse into a clean, typed object
 * for the Student Portal UI.
 */
export const normalizeStudentResponse = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw.data || raw.student || raw;

  const getCleanStr = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).trim();
    return str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' ? '' : str;
  };

  const aadhaar = getCleanStr(data.aadhaarNumber);
  let maskedAadhaar = getCleanStr(data.maskedAadhaar);
  if (!maskedAadhaar && aadhaar) {
    const cleanDigits = aadhaar.replace(/\D/g, '');
    if (cleanDigits.length >= 4) {
      maskedAadhaar = `XXXX-XXXX-${cleanDigits.slice(-4)}`;
    }
  }

  // Campus resolution
  let campusName = '';
  if (typeof data.campus === 'string') {
    campusName = data.campus.trim();
  } else if (data.campus && typeof data.campus === 'object') {
    campusName = data.campus.campusName || data.campus.name || '';
  } else if (data.campusName) {
    campusName = data.campusName.trim();
  }

  // Section resolution
  let sectionName = '';
  if (typeof data.section === 'string') {
    sectionName = data.section.trim();
  } else if (data.section && typeof data.section === 'object') {
    sectionName = data.section.sectionName || data.section.name || '';
  } else if (data.sectionName) {
    sectionName = data.sectionName.trim();
  }

  return {
    id: data.id || null,
    studentId: getCleanStr(data.studentId),
    admissionNumber: getCleanStr(data.admissionNumber),
    fullName: getCleanStr(data.fullName),
    gender: getCleanStr(data.gender),
    dateOfBirth: getCleanStr(data.dateOfBirth),
    nationality: getCleanStr(data.nationality),
    religion: getCleanStr(data.religion),
    category: getCleanStr(data.category),
    aadhaarNumber: aadhaar,
    maskedAadhaar: maskedAadhaar,
    profilePhotoUrl: data.profilePhotoUrl || null,
    mobileNumber: getCleanStr(data.mobileNumber),
    alternateMobile: getCleanStr(data.alternateMobile),
    email: getCleanStr(data.emailAddress1 || data.email),
    alternateEmail: getCleanStr(data.emailAddress2 || data.alternateEmail),
    fatherName: getCleanStr(data.fatherName),
    motherName: getCleanStr(data.motherName),
    academicYear: getCleanStr(data.academicYear),
    branchGroup: getCleanStr(data.branchGroup || data.group),
    intermediateYear: getCleanStr(data.intermediateYear),
    batch: getCleanStr(data.batch),
    campus: campusName,
    admissionType: getCleanStr(data.admissionType),
    hostelDayScholar: getCleanStr(data.hostelDayScholar),
    section: sectionName,
    status: getCleanStr(data.status) || 'ACTIVE',
  };
};

/**
 * Generates dynamic initials from a full name (e.g. "Rahul Kumar Sharma" -> "RKS")
 */
export const getStudentInitials = (name) => {
  if (!name || typeof name !== 'string') return 'ST';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Display helper: returns value or 'Not Provided' if null/empty
 */
export const formatStudentField = (val, fallback = 'Not Provided') => {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') return fallback;
  return str;
};

export const studentPortalService = {
  /**
   * Fetches the current authenticated student profile
   */
  getCurrentStudent: async (signal) => {
    const res = await api.get('/students/me', { cache: false, signal });
    return normalizeStudentResponse(res?.data);
  },

  /**
   * Fetches certificates/documents for the current authenticated student
   */
  getMyCertificates: async (signal) => {
    const res = await api.get('/documents/me', { cache: false, signal });
    const docs = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
    return Array.isArray(docs) ? docs : [];
  },

  /**
   * Updates password for the authenticated student account
   */
  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    const payload = {
      currentPassword,
      newPassword,
      confirmPassword: confirmPassword || newPassword,
      confirmNewPassword: confirmPassword || newPassword,
    };
    const res = await api.post('/auth/change-password', payload);
    return res.data;
  },

  /**
   * Formats a download/view URL for a document safely
   */
  getDocumentFileUrl: (id, download = false) => {
    const base = api.defaults.baseURL || '/api';
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${cleanBase}/documents/${id}/file${download ? '?download=true' : ''}`;
  },
};

export default studentPortalService;
