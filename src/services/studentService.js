import api from './api';
import apiCache from '../utils/apiCache';
import { dataSync } from '../utils/dataSync';

export const studentService = {
  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    apiCache.clear('/students');
    apiCache.clear('/academic/sections');
    dataSync.invalidate(['students', 'sections', 'dashboard']);
    return response.data;
  },

  getStudents: async (params = {}) => {
    const response = await api.get('/students', { params, cache: false });
    return response.data;
  },

  getStudentById: async (studentId) => {
    const response = await api.get(`/students/${studentId}`, { cache: false });
    return response.data;
  },

  updateStudent: async (studentId, studentData) => {
    const response = await api.put(`/students/${studentId}`, studentData);
    apiCache.clear('/students');
    apiCache.clear(`/students/${studentId}`);
    apiCache.clear('/academic/sections');
    dataSync.invalidate(['students', 'sections', 'dashboard']);
    return response.data;
  },

  deactivateStudent: async (studentId) => {
    const response = await api.patch(`/students/${studentId}/deactivate`);
    apiCache.clear('/students');
    apiCache.clear('/academic/sections');
    dataSync.invalidate(['students', 'sections', 'dashboard']);
    return response.data;
  },

  searchStudents: async (query) => {
    const response = await api.get('/students/search', { params: { query }, cache: false });
    return response.data;
  },

  uploadStudentPhoto: async (studentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/students/${studentId}/photo`, formData);
    apiCache.clear('/students');
    apiCache.clear(`/students/${studentId}`);
    dataSync.invalidate(['students']);
    return response.data;
  },

  getStudentIdCard: async (studentId) => {
    const response = await api.get(`/students/${studentId}/id-card`, { cache: false });
    return response.data;
  },

  deleteStudent: async (studentId) => {
    const response = await api.delete(`/students/${studentId}`);
    apiCache.clear('/students');
    apiCache.clear('/academic/sections');
    dataSync.invalidate(['students', 'sections', 'dashboard']);
    return response.data;
  },

  exportStudentsToExcel: async () => {
    const response = await api.get('/students/export/excel', {
      responseType: 'blob',
      cache: false,
      timeout: 60000,
    });
    return response;
  },

  downloadImportTemplate: async (isFaculty = false) => {
    const endpoint = isFaculty ? '/faculty/students/import/template' : '/admin/students/import/template';
    const response = await api.get(endpoint, {
      responseType: 'blob',
      cache: false,
      timeout: 30000,
    });
    return response;
  },

  validateAdminImport: async (file, { branchGroup, intermediateYear, section } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (branchGroup) formData.append('branchGroup', branchGroup);
    if (intermediateYear) formData.append('intermediateYear', intermediateYear);
    if (section) formData.append('section', section);

    const response = await api.post('/admin/students/import/validate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },

  confirmAdminImport: async (file, { branchGroup, intermediateYear, section, skipDuplicates = true, updateExisting = false } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (branchGroup) formData.append('branchGroup', branchGroup);
    if (intermediateYear) formData.append('intermediateYear', intermediateYear);
    if (section) formData.append('section', section);
    formData.append('skipDuplicates', String(skipDuplicates));
    formData.append('updateExisting', String(updateExisting));

    const response = await api.post('/admin/students/import/confirm', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    apiCache.clear();
    dataSync.invalidate(['students', 'sections', 'dashboard', 'certificates', 'adminDashboard']);
    return response.data;
  },

  validateFacultyImport: async (file, { assignmentId } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (assignmentId) formData.append('assignmentId', assignmentId);

    const response = await api.post('/faculty/students/import/validate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },

  confirmFacultyImport: async (file, { assignmentId, skipDuplicates = true, updateExisting = false } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (assignmentId) formData.append('assignmentId', assignmentId);
    formData.append('skipDuplicates', String(skipDuplicates));
    formData.append('updateExisting', String(updateExisting));

    const response = await api.post('/faculty/students/import/confirm', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    apiCache.clear();
    dataSync.invalidate(['students', 'sections', 'dashboard', 'certificates', 'facultyDashboard']);
    return response.data;
  },

  validateStudentImport: async (file, options = {}) => {
    return studentService.validateAdminImport(file, options);
  },

  confirmStudentImport: async (file, options = {}) => {
    return studentService.confirmAdminImport(file, options);
  },

  downloadImportErrorReport: async (failedRows, isFaculty = false) => {
    const endpoint = isFaculty ? '/faculty/students/import/error-report' : '/admin/students/import/error-report';
    const response = await api.post(endpoint, failedRows, {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    return response;
  },
};

export default studentService;
