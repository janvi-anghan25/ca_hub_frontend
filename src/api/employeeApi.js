import api from './axiosInstance';

export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  remove: (id) => api.delete(`/employees/${id}`),
  assignClient: (id, clientId) => api.post(`/employees/${id}/assign-client`, { clientId }),
  markAttendance: (id, data) => api.post(`/employees/${id}/attendance`, data),
  applyLeave: (id, data) => api.post(`/employees/${id}/leave`, data),
};
