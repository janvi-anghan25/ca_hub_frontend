import api from './axiosInstance';

export const gstApi = {
  getReturns: (params) => api.get('/gst-returns', { params }),
  getReturnById: (id) => api.get(`/gst-returns/${id}`),
  createReturn: (data) => api.post('/gst-returns', data),
  updateReturn: (id, data) => api.put(`/gst-returns/${id}`, data),
  deleteReturn: (id) => api.delete(`/gst-returns/${id}`),
  getPending: (params) => api.get('/gst-returns/pending', { params }),
  getOverdue: () => api.get('/gst-returns/overdue'),
  getMonthlyStats: (params) => api.get('/gst-returns/stats/monthly', { params }),
  importReturns: (formData) =>
    api.post('/gst-returns/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
