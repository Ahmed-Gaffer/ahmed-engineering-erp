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
    if (err.response?.status === 401) {
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

export default api;
