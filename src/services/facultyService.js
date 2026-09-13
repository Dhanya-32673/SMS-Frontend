import api from './api';

const facultyService = {
  // Get current logged-in faculty assignments (used by StudentForm, MissingDocuments, ImportStudentsModal)
  getCurrentFacultyAssignments: async () => {
    const response = await api.get('/faculty/me/assignments', { cache: false });
    return response.data;
  },

  // Get single faculty profile if needed
  getFacultyById: async (id) => {
    const response = await api.get(`/faculty/${id}`, { cache: false });
    return response.data;
  },

  // Get assignments for a faculty member
  getAssignments: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/assignments`, { cache: false });
    return response.data;
  },
};

export default facultyService;
