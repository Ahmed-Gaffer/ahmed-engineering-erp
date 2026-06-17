import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

const createEntityService = (path) => ({
  list: (params) => api.get(`/${path}/`, { params }),
  get: (id) => api.get(`/${path}/${id}`),
  create: (data) => api.post(`/${path}/`, data),
  update: (id, data) => api.put(`/${path}/${id}`, data),
  delete: (id) => api.delete(`/${path}/${id}`),
  bulkDelete: (ids) => api.post(`/${path}/bulk-delete`, { ids }),
});

export const auth = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const uploadFile = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/', form);
};

export const contractorsService = createEntityService('contractors');
export const projectsService = createEntityService('projects');
export const phasesService = createEntityService('phases');
export const codesService = createEntityService('codes');
export const workOrdersService = createEntityService('work-orders');
export const workOrderItemsService = createEntityService('work-order-items');
export const drawingsService = createEntityService('drawings');
export const drawingRevisionsService = createEntityService('drawing-revisions');
export const documentsService = createEntityService('documents');
export const paymentCertificatesService = createEntityService('payment-certificates');
export const employeesService = createEntityService('employees');
export const boqService = createEntityService('boq');
export const ipcService = createEntityService('ipc');
export const ipcItemsService = createEntityService('ipc-items');

export const notificationsApi = {
  list: (params) => api.get('/notifications/', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  create: (data) => api.post('/notifications/', data),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const activitiesApi = {
  list: (params) => api.get('/activities/', { params }),
};

export const searchApi = {
  search: (q) => api.get('/search/', { params: { q } }),
};

export const exportApi = {
  download: (entity) => api.get(`/export/${entity}`, { responseType: 'blob' }),
};

export const engineeringApi = {
  dashboard: { summary: () => api.get('/engineering/dashboard/summary') },
  projects: {
    list: () => api.get('/engineering/projects', { params: { skip: 0, limit: 100 } }),
    create: (data) => api.post('/engineering/projects', data),
    get: (id) => api.get(`/engineering/projects/${id}`),
    update: (id, data) => api.patch(`/engineering/projects/${id}`, data),
    delete: (id) => api.delete(`/engineering/projects/${id}`),
    summary: (id) => api.get(`/engineering/projects/${id}/summary`),
  },
  contracts: {
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/contracts`),
    create: (data) => api.post('/engineering/contracts', data),
    get: (id) => api.get(`/engineering/contracts/${id}`),
    update: (id, data) => api.patch(`/engineering/contracts/${id}`, data),
  },
  boqItems: {
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/boq`),
    create: (data) => api.post('/engineering/boq-items', data),
    update: (id, data) => api.put(`/engineering/boq-items/${id}`, data),
    delete: (id) => api.delete(`/engineering/boq-items/${id}`),
    bulkCreate: (items) => api.post('/engineering/boq-items/bulk', items),
    exportExcel: (projectId) => api.get(`/engineering/projects/${projectId}/boq/export`, { responseType: 'blob' }),
    importExcel: (projectId, file) => {
      const form = new FormData();
      form.append('file', file);
      return api.post(`/engineering/projects/${projectId}/boq/import`, form);
    },
  },
  ipcs: {
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/ipcs`),
    create: (data) => api.post('/engineering/ipcs', data),
    get: (id) => api.get(`/engineering/ipcs/${id}`),
    update: (id, data) => api.put(`/engineering/ipcs/${id}`, data),
    delete: (id) => api.delete(`/engineering/ipcs/${id}`),
    approve: (id) => api.post(`/engineering/ipcs/${id}/approve`),
    submit: (id) => api.post(`/engineering/ipcs/${id}/submit`),
    reject: (id) => api.post(`/engineering/ipcs/${id}/reject`),
    pay: (id) => api.post(`/engineering/ipcs/${id}/pay`),
    exportExcel: (id) => api.get(`/engineering/ipcs/${id}/export`, { responseType: 'blob' }),
  },
  drawings: {
    create: (data) => api.post('/engineering/drawings', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/drawings`),
  },
  dailyReports: {
    create: (data) => api.post('/engineering/daily-reports', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/daily-reports`),
  },
  subcontractors: {
    create: (data) => api.post('/engineering/subcontractors', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/subcontractors`),
  },
  schedules: {
    create: (data) => api.post('/engineering/schedules', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/schedules`),
    updateProgress: (id, progress) => api.patch(`/engineering/schedules/${id}/progress`, { progress }),
  },
  documents: {
    create: (data) => api.post('/engineering/documents', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/documents`),
  },
};

export default api;
