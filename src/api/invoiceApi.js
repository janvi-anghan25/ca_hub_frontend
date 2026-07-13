import api from './axiosInstance';

export const invoiceApi = {
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
  recordPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),
  getRevenueStats: (params) => api.get('/invoices/stats/revenue', { params }),
  getMonthlyRevenue: (params) => api.get('/invoices/stats/monthly', { params }),
  getOverdue: () => api.get('/invoices/overdue'),
};
