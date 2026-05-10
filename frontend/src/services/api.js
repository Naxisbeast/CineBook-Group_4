// =============================================================
// CineBook — frontend/src/services/api.js
// Axios HTTP client — shared by all frontend pages
// CMPG 311 | Group 4 | 2026
// =============================================================
// All pages import this instead of using raw fetch/axios:
//   import api from '../services/api';
//   const res = await api.get('/movies');
//   const res = await api.post('/bookings', { show_id, seat_ids });
//
// The interceptor automatically attaches the JWT token to every
// request so protected routes work without any extra code in pages.
// =============================================================

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',   // Express backend
  headers: { 'Content-Type': 'application/json' }
});

// ── Request interceptor: attach JWT token automatically ─────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinebook_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle auth errors globally ───────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If server returns 401, the token has expired — redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('cinebook_token');
      localStorage.removeItem('cinebook_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;