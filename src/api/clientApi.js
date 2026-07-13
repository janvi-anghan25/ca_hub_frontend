import api from './axiosInstance';

export const clientApi = {
  getClients: (params) => api.get('/clients', { params }),
  getClientById: (id) => api.get(`/clients/${id}`),
  createClient: (data) => api.post('/clients', data),
  updateClient: (id, data) => api.put(`/clients/${id}`, data),
  deleteClient: (id) => api.delete(`/clients/${id}`),
  uploadPhoto: (id, formData) =>
    api.post(`/clients/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStats: () => api.get('/clients/stats'),
};
