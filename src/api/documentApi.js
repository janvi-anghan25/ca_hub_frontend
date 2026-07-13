import api from './axiosInstance';

export const documentApi = {
  getDocuments: (clientId, params) => api.get(`/documents/client/${clientId}`, { params }),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  uploadDocument: (clientId, formData) =>
    api.post(`/documents/client/${clientId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateVersion: (id, formData) =>
    api.put(`/documents/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};
