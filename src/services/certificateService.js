import api from './api';

export const certificateService = {
  // Get student-centric certificate summaries (one student = one row)
  getStudentSummaries: async (params = {}) => {
    const response = await api.get('/documents/student-summaries', { params });
    return response.data;
  },

  // Get paginated and filtered list of certificates
  getCertificates: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  // Get single document by ID
  getDocumentById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Get all documents for a specific student
  getStudentDocuments: async (studentId) => {
    const response = await api.get(`/documents/student/${studentId}`);
    return response.data;
  },

  // Upload new certificate with multipart form data
  uploadCertificate: async (formData) => {
    const response = await api.post('/documents', formData);
    return response.data;
  },

  // Replace existing certificate PDF
  replaceCertificate: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/documents/${id}/replace`, formData);
    return response.data;
  },

  // Delete certificate
  deleteCertificate: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Verify document (Admin only)
  verifyDocument: async (id) => {
    const response = await api.patch(`/documents/${id}/verify`);
    return response.data;
  },

  // Reject document with reason (Admin only)
  rejectDocument: async (id, reason) => {
    const response = await api.patch(`/documents/${id}/reject`, { reason });
    return response.data;
  },

  // Archive document (Admin only)
  archiveDocument: async (id) => {
    const response = await api.patch(`/documents/${id}/archive`);
    return response.data;
  },

  // Delete document permanently
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Get list of missing required documents
  getMissingDocuments: async () => {
    const response = await api.get('/documents/missing');
    return response.data;
  },

  // Get document types list
  getDocumentTypes: async () => {
    const response = await api.get('/document-types');
    return response.data;
  },

  // Get active document types list
  getActiveDocumentTypes: async () => {
    const response = await api.get('/document-types/active');
    return response.data;
  },

  // Create new document type (Admin only)
  createDocumentType: async (data) => {
    const response = await api.post('/document-types', data);
    return response.data;
  },

  // Update existing document type (Admin only)
  updateDocumentType: async (id, data) => {
    const response = await api.put(`/document-types/${id}`, data);
    return response.data;
  },
};

export default certificateService;
