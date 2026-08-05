import api from './api';

export const studentService = {
  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  getStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getStudentById: async (studentId) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  updateStudent: async (studentId, studentData) => {
    const response = await api.put(`/students/${studentId}`, studentData);
    return response.data;
  },

  deactivateStudent: async (studentId) => {
    const response = await api.patch(`/students/${studentId}/deactivate`);
    return response.data;
  },

  searchStudents: async (query) => {
    const response = await api.get('/students/search', { params: { query } });
    return response.data;
  },

  uploadStudentPhoto: async (studentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/students/${studentId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getStudentIdCard: async (studentId) => {
    const response = await api.get(`/students/${studentId}/id-card`);
    return response.data;
  },

  deleteStudent: async (studentId) => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  },
};

export default studentService;
