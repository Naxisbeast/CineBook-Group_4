import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinebook_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cinebook_token');
      localStorage.removeItem('cinebook_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload)
};

export const moviesApi = {
  all: () => api.get('/movies'),
  byId: (id) => api.get(`/movies/${id}`)
};

export const seatsApi = {
  byShow: (showId) => api.get(`/seats/${showId}`)
};

export const bookingsApi = {
  create: (payload) => api.post('/bookings', payload),
  mine: () => api.get('/bookings/my-bookings')
};

export const paymentsApi = {
  create: (payload) => api.post('/payments', payload)
};

export const imagesApi = {
  movie: (params) => api.get('/images/movie', { params })
};

export const adminApi = {
  summary: () => api.get('/admin/summary'),
  lookups: () => api.get('/admin/lookups'),
  users: {
    all: () => api.get('/admin/users'),
    updateRole: (userId, payload) => api.patch(`/admin/users/${userId}/role`, payload)
  },
  movies: {
    all: () => api.get('/admin/movies'),
    create: (payload) => api.post('/admin/movies', payload),
    update: (movieId, payload) => api.patch(`/admin/movies/${movieId}`, payload),
    remove: (movieId) => api.delete(`/admin/movies/${movieId}`)
  },
  shows: {
    all: () => api.get('/admin/shows'),
    create: (payload) => api.post('/admin/shows', payload),
    update: (showId, payload) => api.patch(`/admin/shows/${showId}`, payload),
    remove: (showId) => api.delete(`/admin/shows/${showId}`)
  },
  bookings: {
    all: () => api.get('/admin/bookings'),
    updateStatus: (bookingId, payload) => api.patch(`/admin/bookings/${bookingId}/status`, payload)
  }
};

export const managerApi = {
  summary: () => api.get('/manager/summary'),
  lookups: () => api.get('/manager/lookups'),
  shows: {
    all: () => api.get('/manager/shows'),
    create: (payload) => api.post('/manager/shows', payload),
    update: (showId, payload) => api.patch(`/manager/shows/${showId}`, payload)
  },
  bookings: {
    all: () => api.get('/manager/bookings'),
    updateStatus: (bookingId, payload) => api.patch(`/manager/bookings/${bookingId}/status`, payload)
  }
};

export default api;
