import api from './axiosInstance';

export const itrApi = {
  getReturns: (params) => api.get('/itr-returns', { params }),
  getReturnById: (id) => api.get(`/itr-returns/${id}`),
  createReturn: (data) => api.post('/itr-returns', data),
  updateReturn: (id, data) => api.put(`/itr-returns/${id}`, data),
  deleteReturn: (id) => api.delete(`/itr-returns/${id}`),
  getPending: (params) => api.get('/itr-returns/pending', { params }),
  getOverdue: () => api.get('/itr-returns/overdue'),
  getRefundPending: () => api.get('/itr-returns/refund-pending'),
};
