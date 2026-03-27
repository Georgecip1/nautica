import axios from 'axios';

// Fallback antiglonț: Dacă variabila lipsește sau e textul "undefined"
let API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL;
if (!API_URL || API_URL === 'undefined') {
  API_URL = 'http://localhost:8000/api';
} else if (!API_URL.endsWith('/api')) {
  API_URL = `${API_URL}/api`;
}

const getToken = () => localStorage.getItem('nautica_token');

const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor pentru a trimite automat token-ul
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pentru erori (în special 401 - Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nautica_token');
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  setupPassword: (token, password) => api.post('/auth/setup-password', { token, password }),
  requestReset: (email) => api.post('/auth/request-reset', { email }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }), // Acum suportă { page, limit, search, sort_by }
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resendSetup: (id) => api.post(`/users/${id}/resend-setup`),
  getWithActiveSubscriptions: (params) => api.get('/users/active-subscriptions', { params }),
  
  // Modulul de Familie (Copii)
  addChild: (userId, data) => api.post(`/users/${userId}/children`, data),
  updateChild: (userId, childId, data) => api.put(`/users/${userId}/children/${childId}`, data),
  deleteChild: (userId, childId) => api.delete(`/users/${userId}/children/${childId}`),
};

// Plans
export const plansAPI = {
  getAll: (params) => api.get('/plans', { params }),
  getOne: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

// Subscriptions
export const subscriptionsAPI = {
  getAll: (params) => api.get('/subscriptions', { params }),
  getForPerson: (personId, personType) => api.get(`/subscriptions/person/${personId}`, { params: { person_type: personType } }),
  create: (data) => api.post('/subscriptions', data),
  createBatch: (data) => api.post('/subscriptions/batch', data), // Endpoint nou pt checkout rapid la familii
  delete: (id) => api.delete(`/subscriptions/${id}`),
};

// Attendance
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  // Noul backend accepta POST /attendance direct, cu person_id SAU qr_token in body
  recordManual: (data) => api.post('/attendance', data),
  recordQR: (qrToken, location) => api.post('/attendance', { qr_token: qrToken, location }),
  delete: (id) => api.delete(`/attendance/${id}`), // Acest delete face si "Undo" la abonament acum!
  export: (params) => api.get('/export/attendance', { params }),
};

// Locations 
export const locationsAPI = {
  getAll: () => api.get('/locations'),
  getOne: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};

// Coaches
export const coachesAPI = {
  getAll: () => api.get('/coaches'),
  create: (data) => api.post('/coaches', data),
  update: (id, data) => api.put(`/coaches/${id}`, data),
  delete: (id) => api.delete(`/coaches/${id}`),
};

// Blog
export const blogAPI = {
  getAll: (publishedOnly = true) => api.get('/blog', { params: { published_only: publishedOnly } }),
  getOne: (slug) => api.get(`/blog/${slug}`),
  create: (data) => api.post('/blog', data),
  update: (id, data) => api.put(`/blog/${id}`, data),
  delete: (id) => api.delete(`/blog/${id}`),
};

// Alerts
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getCount: () => api.get('/alerts/count'),
  markSeen: (id) => api.put(`/alerts/${id}/seen`),
  markAllSeen: () => api.put('/alerts/seen-all'),
  getMine: () => api.get('/my-alerts'),
};

// Reports
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getRevenue: (months) => api.get('/reports/revenue', { params: { months } }),
  getAttendance: (months) => api.get('/reports/attendance', { params: { months } }),
  getLocations: () => api.get('/reports/locations'),
  getHours: () => api.get('/reports/hours'),
  // NOU: Export Excel (Necesita responseType: 'blob')
  exportExcel: (params) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
};

// Contact (Smart Inbox)
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getMessages: () => api.get('/contact'),
  markRead: (id) => api.put(`/contact/${id}/read`),
};

// Maintenance
export const maintenanceAPI = {
  markInactiveUsers: () => api.post('/maintenance/mark-inactive-users'),
};

// QR Code Scanner
export const qrAPI = {
  // Sincronizat cu noul 'backend/routes/qr.py'
  validate: (token) => api.get(`/qr/scan/${token}`),
  regenerate: (personId, personType) => api.post(`/qr/regenerate/${personId}`, null, { params: { person_type: personType } }),
};

// Seed DB
export const seedAPI = {
  seed: () => api.post('/seed'),
};

export default api;