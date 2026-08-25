import api from './api';
import apiCache from '../utils/apiCache';
import { dataSync } from '../utils/dataSync';

const facultyService = {
  // Search & list faculty
  getFacultyList: async (params) => {
    const response = await api.get('/faculty', { params, cache: false });
    return response.data;
  },

  // Create faculty member
  createFaculty: async (data) => {
    const response = await api.post('/faculty', data);
    apiCache.clear('/faculty');
    dataSync.notify(['faculty', 'dashboard']);
    return response.data;
  },

  // Get single faculty profile
  getFacultyById: async (id) => {
    const response = await api.get(`/faculty/${id}`, { cache: false });
    return response.data;
  },

  // Update faculty
  updateFaculty: async (id, data) => {
    const response = await api.put(`/faculty/${id}`, data);
    apiCache.clear('/faculty');
    dataSync.notify(['faculty', 'dashboard']);
    return response.data;
  },

  // Toggle status ACTIVE/INACTIVE
  toggleStatus: async (id, status) => {
    const response = await api.patch(`/faculty/${id}/status`, { status });
    apiCache.clear('/faculty');
    dataSync.notify(['faculty', 'dashboard']);
    return response.data;
  },

  // Add section assignment
  addAssignment: async (facultyId, data) => {
    const response = await api.post(`/faculty/${facultyId}/assignments`, data);
    apiCache.clear('/faculty');
    dataSync.notify(['faculty', 'sections']);
    return response.data;
  },

  // Remove/Delete section assignment
  removeAssignment: async (facultyId, assignmentId) => {
    const response = await api.delete(`/faculty/${facultyId}/assignments/${assignmentId}`);
    apiCache.clear('/faculty');
    dataSync.notify(['faculty', 'sections']);
    return response.data;
  },

  // Get assignments
  getAssignments: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/assignments`, { cache: false });
    return response.data;
  },

  // Get current logged-in faculty assignments
  getCurrentFacultyAssignments: async () => {
    const response = await api.get('/faculty/me/assignments', { cache: false });
    return response.data;
  },

  // Academic Groups
  getGroups: async () => {
    const response = await api.get('/academic/groups', { cache: false });
    return response.data;
  },

  createGroup: async (data) => {
    const response = await api.post('/academic/groups', data);
    apiCache.clear('/academic/groups');
    dataSync.notify(['groups']);
    return response.data;
  },

  // Academic Sections
  getSections: async () => {
    const response = await api.get('/academic/sections', { cache: false });
    return response.data;
  },

  createSection: async (data) => {
    const response = await api.post('/academic/sections', data);
    apiCache.clear('/academic/sections');
    dataSync.notify(['sections']);
    return response.data;
  },

  // Upload faculty profile photo
  uploadFacultyPhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/faculty/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    apiCache.clear('/faculty');
    dataSync.notify(['faculty']);
    return response.data;
  },

  // Delete faculty member permanently
  deleteFaculty: async (id) => {
    const response = await api.delete(`/faculty/${id}`);
    apiCache.clear('/faculty');
    dataSync.notify(['faculty', 'dashboard']);
    return response.data;
  },
};

export default facultyService;
