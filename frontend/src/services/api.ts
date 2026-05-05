// Servicio HTTP v2 — Axios con interceptores JWT + refresh automático

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST: adjuntar access token ──────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('payflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── RESPONSE: manejar 401 con refresh automático ────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('payflow_refresh');
      if (!refreshToken) {
        localStorage.removeItem('payflow_token');
        localStorage.removeItem('payflow_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        const newToken = data.data?.accessToken || data.data?.token;
        const newRefresh = data.data?.refreshToken;

        localStorage.setItem('payflow_token', newToken);
        if (newRefresh) localStorage.setItem('payflow_refresh', newRefresh);

        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        refreshQueue = [];
        localStorage.removeItem('payflow_token');
        localStorage.removeItem('payflow_user');
        localStorage.removeItem('payflow_refresh');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
