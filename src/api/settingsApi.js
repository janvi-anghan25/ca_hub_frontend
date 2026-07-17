import api from './axiosInstance';

export const settingsApi = {
  updateProfile: (data) => api.put('/settings/profile', data),
  getMyOffice: () => api.get('/settings/office'),
  updateMyOffice: (data) => api.put('/settings/office', data),
};
