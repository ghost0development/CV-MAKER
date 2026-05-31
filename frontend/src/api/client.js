import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

export const cvs = {
  list: () => api.get('/cvs').then(r => r.data),
  get: (id) => api.get(`/cvs/${id}`).then(r => r.data),
  create: (data) => api.post('/cvs', data).then(r => r.data),
  update: (id, data) => api.put(`/cvs/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/cvs/${id}`).then(r => r.data),
  share: (id) => api.post(`/cvs/${id}/share`).then(r => r.data),
  clone: (id) => api.post(`/cvs/${id}/clone`).then(r => r.data),
  getShared: (link) => api.get(`/cvs/shared/${link}`).then(r => r.data),
  getPDF: (id) => api.get(`/cvs/${id}/pdf`).then(r => r.data),
  downloadPDF: (id) => api.post(`/cvs/${id}/pdf`, {}, { responseType: 'blob' }).then(r => r.data),
};

export const templates = {
  list: () => api.get('/templates').then(r => r.data),
};

export const jobs = {
  match: (data) => api.post('/jobs/match', data).then(r => r.data),
  scan: () => api.post('/jobs/scan').then(r => r.data),
  list: (params) => api.get('/jobs', { params }).then(r => r.data),
  get: (id) => api.get(`/jobs/${id}`).then(r => r.data),
  update: (id, data) => api.patch(`/jobs/${id}`, data).then(r => r.data),
  profiles: () => api.get('/jobs/profiles').then(r => r.data),
  profile: (role) => api.get(`/jobs/profiles/${encodeURIComponent(role)}`).then(r => r.data),
  rescore: () => api.post('/jobs/rescore').then(r => r.data),
  enrich: () => api.post('/jobs/enrich').then(r => r.data),
  bestRole: () => api.get('/jobs/best-role').then(r => r.data),
  exportCSV: () => api.get('/jobs/export/csv', { responseType: 'blob' }).then(r => r.data),
  stats: () => api.get('/jobs/stats/summary').then(r => r.data),
};

export default api;
