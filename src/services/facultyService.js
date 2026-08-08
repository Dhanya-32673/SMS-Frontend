import api from './api';

const facultyService = {
  // Search & list faculty
  getFacultyList: async (params) => {
    const response = await api.get('/faculty', { params });
    return response.data;
  },

  // Create faculty member
  createFaculty: async (data) => {
    const response = await api.post('/faculty', data);
    return response.data;
  },

  // Get single faculty profile
  getFacultyById: async (id) => {
    const response = await api.get(`/faculty/${id}`);
    return response.data;
  },

  // Update faculty
  updateFaculty: async (id, data) => {
    const response = await api.put(`/faculty/${id}`, data);
    return response.data;
  },

  // Toggle status ACTIVE/INACTIVE
  toggleStatus: async (id, status) => {
    const response = await api.patch(`/faculty/${id}/status`, { status });
    return response.data;
  },

  // Add section assignment
  addAssignment: async (facultyId, data) => {
    const response = await api.post(`/faculty/${facultyId}/assignments`, data);
    return response.data;
  },

  // Remove/Delete section assignment
  removeAssignment: async (facultyId, assignmentId) => {
    const response = await api.delete(`/faculty/${facultyId}/assignments/${assignmentId}`);
    return response.data;
  },

  // Get assignments
  getAssignments: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/assignments`);
    return response.data;
  },

  // Get current logged-in faculty assignments
  getCurrentFacultyAssignments: async () => {
    const response = await api.get('/faculty/me/assignments');
    return response.data;
  },

  // Academic Groups
  getGroups: async () => {
    const response = await api.get('/academic/groups');
    return response.data;
  },

  createGroup: async (data) => {
    const response = await api.post('/academic/groups', data);
    return response.data;
  },

  // Academic Sections
  getSections: async () => {
    const response = await api.get('/academic/sections');
    return response.data;
  },

  createSection: async (data) => {
    const response = await api.post('/academic/sections', data);
    return response.data;
  },

  // Upload faculty profile photo
  uploadFacultyPhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/faculty/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete faculty member permanently
  deleteFaculty: async (id) => {
    const response = await api.delete(`/faculty/${id}`);
    return response.data;
  },
};

export default facultyService;
