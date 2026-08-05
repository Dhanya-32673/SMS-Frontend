import api from './api';

export const dashboardService = {
  getAdminSummary: async () => {
    const response = await api.get('/dashboard/admin/summary');
    return response.data;
  },

  getFacultySummary: async () => {
    const response = await api.get('/dashboard/faculty/summary');
    return response.data;
  },
};

export default dashboardService;
