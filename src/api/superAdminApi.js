import api from './axiosInstance';

export const superAdminApi = {
  getStats: () => api.get('/superadmin/stats'),

  // Offices
  getOffices: (params) => api.get('/superadmin/offices', { params }),
  getOfficeById: (id) => api.get(`/superadmin/offices/${id}`),
  updateOffice: (id, data) => api.put(`/superadmin/offices/${id}`, data),
  toggleOfficeStatus: (id) => api.patch(`/superadmin/offices/${id}/toggle-status`),

  // Admins
  getAdmins: (params) => api.get('/superadmin/admins', { params }),
  createAdmin: (data) => api.post('/superadmin/admins', data),
  toggleAdminStatus: (id) => api.patch(`/superadmin/admins/${id}/toggle-status`),
};
