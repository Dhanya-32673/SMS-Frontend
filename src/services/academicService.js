import api from './api';
import apiCache from '../utils/apiCache';

export const academicService = {
  // Groups (Cached for 5 minutes)
  getAllGroups: async () => {
    const cacheKey = '/academic/groups';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;
    const response = await api.get('/academic/groups');
    apiCache.set(cacheKey, response.data, 300000);
    return response.data;
  },

  createGroup: async (groupData) => {
    const response = await api.post('/academic/groups', groupData);
    apiCache.clear('/academic/groups');
    return response.data;
  },

  deleteGroup: async (id) => {
    const response = await api.delete(`/academic/groups/${id}`);
    apiCache.clear('/academic/groups');
    return response.data;
  },

  // Sections (Cached for 5 minutes)
  getAllSections: async () => {
    const cacheKey = '/academic/sections';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;
    const response = await api.get('/academic/sections');
    apiCache.set(cacheKey, response.data, 300000);
    return response.data;
  },

  createSection: async (sectionData) => {
    const response = await api.post('/academic/sections', sectionData);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  updateSection: async (id, sectionData) => {
    const response = await api.put(`/academic/sections/${id}`, sectionData);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  deleteSection: async (id) => {
    const response = await api.delete(`/academic/sections/${id}`);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  getSectionMembers: async (id) => {
    const response = await api.get(`/academic/sections/${id}/members`);
    return response.data;
  },

  assignStudentsToSection: async (id, studentIds) => {
    const response = await api.post(`/academic/sections/${id}/assign`, { studentIds });
    apiCache.clear('/academic/sections');
    return response.data;
  },

  removeStudentFromSection: async (id, studentId) => {
    const response = await api.delete(`/academic/sections/${id}/members/${studentId}`);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  removeStudentsFromSection: async (id, studentIds) => {
    const response = await api.post(`/academic/sections/${id}/remove-students`, studentIds);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  clearSectionsCache: () => {
    apiCache.clear('/academic/sections');
  },
};

export default academicService;
