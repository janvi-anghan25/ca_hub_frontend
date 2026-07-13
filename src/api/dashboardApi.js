import api from './axiosInstance';

export const dashboardApi = {
  getHomeDashboard: () => api.get('/dashboard'),
  getChartData: (params) => api.get('/dashboard/charts', { params }),
};
