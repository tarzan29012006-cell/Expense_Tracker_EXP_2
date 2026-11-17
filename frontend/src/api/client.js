import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh or redirect
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          if (res.data?.access) {
            localStorage.setItem('access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login/', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register/', userData);
    return res.data;
  },
  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },
  getMe: async () => {
    const res = await api.get('/auth/me/');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.patch('/auth/me/', data);
    return res.data;
  },
};

export const trackerAPI = {
  getCategories: async () => {
    const res = await api.get('/categories/');
    return res.data;
  },
  getSummary: async (period = 'this_month') => {
    const res = await api.get(`/summary/?period=${period}`);
    return res.data;
  },
  getExpensesByCategory: async (period = 'this_month') => {
    const res = await api.get(`/expenses/by-category/?period=${period}`);
    return res.data;
  },
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/transactions/${query ? `?${query}` : ''}`);
    return res.data;
  },
  addTransaction: async (data) => {
    const res = await api.post('/transactions/', data);
    return res.data;
  },
  updateTransaction: async (id, data) => {
    const res = await api.put(`/transactions/${id}/`, data);
    return res.data;
  },
  deleteTransaction: async (id) => {
    const res = await api.delete(`/transactions/${id}/`);
    return res.data;
  },
  getInsights: async (period = 'this_month') => {
    const res = await api.get(`/insights/?period=${period}`);
    return res.data;
  },
};

export default api;
