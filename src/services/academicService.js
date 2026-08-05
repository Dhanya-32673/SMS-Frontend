import api from './api';

export const academicService = {
  // Groups
  getAllGroups: async () => {
    const response = await api.get('/academic/groups');
    return response.data;
  },

  createGroup: async (groupData) => {
    const response = await api.post('/academic/groups', groupData);
    return response.data;
  },

  deleteGroup: async (id) => {
    const response = await api.delete(`/academic/groups/${id}`);
    return response.data;
  },

  // Sections
  getAllSections: async () => {
    const response = await api.get('/academic/sections');
    return response.data;
  },

  createSection: async (sectionData) => {
    const response = await api.post('/academic/sections', sectionData);
    return response.data;
  },

  updateSection: async (id, sectionData) => {
    const response = await api.put(`/academic/sections/${id}`, sectionData);
    return response.data;
  },

  deleteSection: async (id) => {
    const response = await api.delete(`/academic/sections/${id}`);
    return response.data;
  },

  getSectionMembers: async (id) => {
    const response = await api.get(`/academic/sections/${id}/members`);
    return response.data;
  },

  assignStudentsToSection: async (id, studentIds) => {
    const response = await api.post(`/academic/sections/${id}/assign`, { studentIds });
    return response.data;
  },

  removeStudentFromSection: async (id, studentId) => {
    const response = await api.delete(`/academic/sections/${id}/members/${studentId}`);
    return response.data;
  },
};

export default academicService;
