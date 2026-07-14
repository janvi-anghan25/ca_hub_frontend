import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  refreshQueue = [];
};

const isPublicAuthRequest = (url = '') =>
  ['/auth/login', '/auth/forgot-password', '/auth/reset-password', '/auth/refresh-token'].some(
    (path) => url.includes(path)
  );

const redirectToLogin = () => {
  localStorage.removeItem('accessToken');
  delete api.defaults.headers.Authorization;

  const onLoginPage = window.location.pathname.startsWith('/login');
  if (!onLoginPage) {
    window.location.assign('/login');
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const requestUrl = originalRequest.url || '';

    // Failed login / forgot / reset should show the form error — do not bounce the page
    if (status === 401 && isPublicAuthRequest(requestUrl)) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            redirectToLogin();
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Any remaining 401 (e.g. retry still unauthorized) → login
    if (status === 401) {
      redirectToLogin();
      return Promise.reject(error);
    }

    const message = error.response?.data?.message || 'Something went wrong';
    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;
