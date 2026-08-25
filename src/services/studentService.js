import api from './api';
import apiCache from '../utils/apiCache';
import { dataSync } from '../utils/dataSync';

export const studentService = {
  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    apiCache.clear('/students');
    apiCache.clear('/academic/sections');
    dataSync.notify(['students', 'sections', 'dashboard']);
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
    apiCache.clear('/academic/sections');
    dataSync.notify(['students', 'sections', 'dashboard']);
    return response.data;
  },

  deactivateStudent: async (studentId) => {
    const response = await api.patch(`/students/${studentId}/deactivate`);
    apiCache.clear('/students');
    apiCache.clear('/academic/sections');
    dataSync.notify(['students', 'sections', 'dashboard']);
    return response.data;
  },

  searchStudents: async (query) => {
    const response = await api.get('/students/search', { params: { query }, cache: false });
    return response.data;
  },

  uploadStudentPhoto: async (studentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/students/${studentId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    apiCache.clear('/students');
    dataSync.notify(['students']);
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
    dataSync.notify(['students', 'sections', 'dashboard']);
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
};

export default studentService;
