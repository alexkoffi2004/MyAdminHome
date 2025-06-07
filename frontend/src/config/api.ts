import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },
  REQUESTS: {
    CREATE: '/requests',
    GET_ALL: '/requests',
    GET_ONE: (id: string) => `/requests/${id}`,
    UPDATE: (id: string) => `/requests/${id}`,
    DELETE: (id: string) => `/requests/${id}`,
  },
  AGENTS: {
    CREATE: '/agents',
    GET_ALL: '/agents',
    GET_ONE: (id: string) => `/agents/${id}`,
    UPDATE: (id: string) => `/agents/${id}`,
    DELETE: (id: string) => `/agents/${id}`,
  },
  ADMIN: {
    STATS: '/admin/stats',
    RECENT_PAYMENTS: '/admin/payments/recent',
    USERS: '/admin/users',
    DOCUMENTS: '/admin/documents',
    PAYMENTS: '/admin/payments',
  },
};

export default api; 