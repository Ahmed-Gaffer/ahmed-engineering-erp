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
export const companyProfileService = createEntityService('company-profile');
export const notificationsApi = {
  list: (params) => api.get('/engineering/notifications', { params }),
  unreadCount: () => api.get('/engineering/notifications/unread-count'),
  create: (data) => api.post('/engineering/notifications', data),
  markRead: (id) => api.put(`/engineering/notifications/${id}/read`),
  markAllRead: () => api.put('/engineering/notifications/read-all'),
};

export const activitiesApi = {
  list: (params) => api.get('/activities/', { params }),
};

export const searchApi = {
  search: (q, signal) => api.get('/search/', { params: { q }, signal }),
};

export const exportApi = {
  download: (entity) => api.get(`/export/${entity}`, { responseType: 'blob' }),
};

export const workflowApi = {
  getLogs: (entityType, entityId) => api.get('/workflow/logs', { params: { entity_type: entityType, entity_id: entityId } }),
  getRecent: (limit = 20) => api.get('/workflow/logs/recent', { params: { limit } }),
  createAction: (data) => api.post('/workflow/actions', data),
};

export const adminApi = {
  logs: (params) => api.get('/engineering/admin/logs', { params }),
  listSettings: () => api.get('/engineering/admin/settings'),
  createSetting: (data) => api.post('/engineering/admin/settings', data),
  updateSetting: (key, data) => api.put(`/engineering/admin/settings/${key}`, data),
  activity: (params) => api.get('/engineering/admin/activity', { params }),
};

export const engineeringApi = {
  dashboard: { summary: () => api.get('/engineering/dashboard/summary'), ipcTrends: () => api.get('/engineering/dashboard/ipc-trends') },
  reports: {
    financial: () => api.get('/engineering/reports/financial'),
    progress: () => api.get('/engineering/reports/progress'),
    workOrders: (params) => api.get('/engineering/reports/work-orders', { params }),
    schedules: (params) => api.get('/engineering/reports/schedules', { params }),
    daily: (params) => api.get('/engineering/reports/daily', { params }),
    projectFinancial: (projectId) => api.get(`/engineering/reports/project-financial/${projectId}`),
    projectComparison: (params) => api.get('/engineering/reports/project-comparison', { params }),
    dashboardExport: () => api.get('/engineering/reports/dashboard-export', { responseType: 'blob' }),
  },
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
    delete: (id) => api.delete(`/engineering/contracts/${id}`),
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
    exportPdf: (id) => api.get(`/engineering/ipcs/${id}/pdf`, { responseType: 'blob' }),
    projectSummary: (projectId) => api.get(`/engineering/projects/${projectId}/ipcs/summary`),
  },
  drawings: {
    create: (data) => api.post('/engineering/drawings', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/drawings`),
  },
  dailyReports: {
    create: (data) => api.post('/engineering/daily-reports', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/daily-reports`),
    get: (id) => api.get(`/engineering/daily-reports/${id}`),
    update: (id, data) => api.put(`/engineering/daily-reports/${id}`, data),
    delete: (id) => api.delete(`/engineering/daily-reports/${id}`),
  },
  subcontractors: {
    create: (data) => api.post('/engineering/subcontractors', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/subcontractors`),
    get: (id) => api.get(`/engineering/subcontractors/${id}`),
    update: (id, data) => api.put(`/engineering/subcontractors/${id}`, data),
    delete: (id) => api.delete(`/engineering/subcontractors/${id}`),
  },
  schedules: {
    create: (data) => api.post('/engineering/schedules', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/schedules`),
    get: (id) => api.get(`/engineering/schedules/${id}`),
    update: (id, data) => api.put(`/engineering/schedules/${id}`, data),
    delete: (id) => api.delete(`/engineering/schedules/${id}`),
    updateProgress: (id, progress) => api.patch(`/engineering/schedules/${id}/progress`, { progress }),
    updateDependencies: (id, dependencies) => api.patch(`/engineering/schedules/${id}/dependencies`, { dependencies }),
    calculateCriticalPath: (projectId) => api.post(`/engineering/projects/${projectId}/schedules/critical-path`),
  },
  documents: {
    create: (data) => api.post('/engineering/documents', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/documents`),
  },
  variationOrders: {
    create: (data) => api.post('/engineering/variation-orders', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/variation-orders`),
    get: (id) => api.get(`/engineering/variation-orders/${id}`),
    update: (id, data) => api.put(`/engineering/variation-orders/${id}`, data),
    delete: (id) => api.delete(`/engineering/variation-orders/${id}`),
    impactSummary: (id) => api.get(`/engineering/variation-orders/${id}/impact-summary`),
    addBoqItem: (voId, data) => api.post(`/engineering/variation-orders/${voId}/boq-items`, data),
    listBoqItems: (voId) => api.get(`/engineering/variation-orders/${voId}/boq-items`),
    deleteBoqItem: (voId, itemId) => api.delete(`/engineering/variation-orders/${voId}/boq-items/${itemId}`),
    addScheduleImpact: (voId, data) => api.post(`/engineering/variation-orders/${voId}/schedule-impact`, data),
    listScheduleImpacts: (voId) => api.get(`/engineering/variation-orders/${voId}/schedule-impacts`),
    deleteScheduleImpact: (voId, impactId) => api.delete(`/engineering/variation-orders/${voId}/schedule-impacts/${impactId}`),
  },
  rfis: {
    create: (data) => api.post('/engineering/rfis', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/rfis`),
    get: (id) => api.get(`/engineering/rfis/${id}`),
    update: (id, data) => api.put(`/engineering/rfis/${id}`, data),
    delete: (id) => api.delete(`/engineering/rfis/${id}`),
  },
  mar: {
    create: (data) => api.post('/engineering/mar', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/mar`),
    get: (id) => api.get(`/engineering/mar/${id}`),
    update: (id, data) => api.put(`/engineering/mar/${id}`, data),
    delete: (id) => api.delete(`/engineering/mar/${id}`),
    submit: (id) => api.post(`/engineering/mar/${id}/submit`),
    approve: (id) => api.post(`/engineering/mar/${id}/approve`),
    reject: (id, data) => api.post(`/engineering/mar/${id}/reject`, data),
    upload: (id, file) => { const f = new FormData(); f.append('file', file); return api.post(`/engineering/mar/${id}/upload`, f); },
    exportPdf: (id) => api.get(`/engineering/mar/${id}/pdf`, { responseType: 'blob' }),
  },
   ncr: {
     create: (data) => api.post('/engineering/ncr', data),
     listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/ncr`),
     get: (id) => api.get(`/engineering/ncr/${id}`),
     update: (id, data) => api.put(`/engineering/ncr/${id}`, data),
     delete: (id) => api.delete(`/engineering/ncr/${id}`),
     investigate: (id) => api.post(`/engineering/ncr/${id}/investigate`),
     applyAction: (id, data) => api.post(`/engineering/ncr/${id}/action`, data),
     close: (id, data) => api.post(`/engineering/ncr/${id}/close`, data),
     reject: (id, data) => api.post(`/engineering/ncr/${id}/reject`, data),
     upload: (id, file) => { const f = new FormData(); f.append('file', file); return api.post(`/engineering/ncr/${id}/upload`, f); },
     exportPdf: (id) => api.get(`/engineering/ncr/${id}/pdf`, { responseType: 'blob' }),
   },
   submittals: {
     create: (data) => api.post('/engineering/submittals', data),
     listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/submittals`),
     get: (id) => api.get(`/engineering/submittals/${id}`),
     update: (id, data) => api.put(`/engineering/submittals/${id}`, data),
     delete: (id) => api.delete(`/engineering/submittals/${id}`),
     submit: (id, data) => api.post(`/engineering/submittals/${id}/submit`, data),
     approve: (id, data) => api.post(`/engineering/submittals/${id}/approve`, data),
     reject: (id, data) => api.post(`/engineering/submittals/${id}/reject`, data),
     resubmit: (id, data) => api.post(`/engineering/submittals/${id}/resubmit`, data),
     close: (id, data) => api.post(`/engineering/submittals/${id}/close`, data),
   },
   inspections: {
     create: (data) => api.post('/engineering/inspection-requests', data),
     listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/inspection-requests`),
     get: (id) => api.get(`/engineering/inspection-requests/${id}`),
     update: (id, data) => api.put(`/engineering/inspection-requests/${id}`, data),
     delete: (id) => api.delete(`/engineering/inspection-requests/${id}`),
     submit: (id, data) => api.post(`/engineering/inspection-requests/${id}/submit`, data),
     inspect: (id, data) => api.post(`/engineering/inspection-requests/${id}/inspect`, data),
     pass: (id) => api.post(`/engineering/inspection-requests/${id}/pass`),
     fail: (id, data) => api.post(`/engineering/inspection-requests/${id}/fail`, data),
     scheduleReinspection: (id, data) => api.post(`/engineering/inspection-requests/${id}/re-inspection`, data),
   },
   punchList: {
     create: (data) => api.post('/engineering/punch-list-items', data),
     listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/punch-list-items`),
     get: (id) => api.get(`/engineering/punch-list-items/${id}`),
     update: (id, data) => api.put(`/engineering/punch-list-items/${id}`, data),
     delete: (id) => api.delete(`/engineering/punch-list-items/${id}`),
     start: (id) => api.post(`/engineering/punch-list-items/${id}/start`),
     complete: (id, data) => api.post(`/engineering/punch-list-items/${id}/complete`, data),
     verify: (id, data) => api.post(`/engineering/punch-list-items/${id}/verify`, data),
     accept: (id) => api.post(`/engineering/punch-list-items/${id}/accept`),
     reopen: (id) => api.post(`/engineering/punch-list-items/${id}/reopen`),
   },
   transmittals: {
     create: (data) => api.post('/engineering/transmittals', data),
     listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/transmittals`),
     get: (id) => api.get(`/engineering/transmittals/${id}`),
     update: (id, data) => api.put(`/engineering/transmittals/${id}`, data),
     delete: (id) => api.delete(`/engineering/transmittals/${id}`),
     send: (id, data) => api.post(`/engineering/transmittals/${id}/send`, data),
     markReceived: (id, data) => api.post(`/engineering/transmittals/${id}/mark-received`, data),
     acknowledge: (id) => api.post(`/engineering/transmittals/${id}/acknowledge`),
     close: (id) => api.post(`/engineering/transmittals/${id}/close`),
   },
   meetingMinutes: {
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/meeting-minutes`),
    create: (data) => api.post('/engineering/meeting-minutes', data),
    get: (id) => api.get(`/engineering/meeting-minutes/${id}`),
    update: (id, data) => api.put(`/engineering/meeting-minutes/${id}`, data),
    delete: (id) => api.delete(`/engineering/meeting-minutes/${id}`),
    finalize: (id) => api.post(`/engineering/meeting-minutes/${id}/finalize`),
    exportPdf: (id) => api.get(`/engineering/meeting-minutes/${id}/pdf`, { responseType: 'blob' }),
  },
  evm: {
    report: (projectId) => api.get(`/engineering/projects/${projectId}/evm`),
  },
   branches: {
    create: (data) => api.post('/engineering/branches', data),
    list: () => api.get('/engineering/branches'),
    get: (id) => api.get(`/engineering/branches/${id}`),
    update: (id, data) => api.put(`/engineering/branches/${id}`, data),
    delete: (id) => api.delete(`/engineering/branches/${id}`),
  },
  categories: {
    create: (data) => api.post('/engineering/categories', data),
    list: (type) => api.get('/engineering/categories', { params: { type } }),
    get: (id) => api.get(`/engineering/categories/${id}`),
    update: (id, data) => api.put(`/engineering/categories/${id}`, data),
    delete: (id) => api.delete(`/engineering/categories/${id}`),
  },
  costCodes: {
    create: (data) => api.post('/engineering/cost-codes', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/cost-codes`),
    get: (id) => api.get(`/engineering/cost-codes/${id}`),
    update: (id, data) => api.put(`/engineering/cost-codes/${id}`, data),
    delete: (id) => api.delete(`/engineering/cost-codes/${id}`),
  },
  safetyIncidents: {
    create: (data) => api.post('/engineering/safety-incidents', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/safety-incidents`),
    get: (id) => api.get(`/engineering/safety-incidents/${id}`),
    update: (id, data) => api.put(`/engineering/safety-incidents/${id}`, data),
    delete: (id) => api.delete(`/engineering/safety-incidents/${id}`),
    investigate: (id, data) => api.post(`/engineering/safety-incidents/${id}/investigate`, data),
    takeAction: (id, data) => api.post(`/engineering/safety-incidents/${id}/take-action`, data),
    close: (id, data) => api.post(`/engineering/safety-incidents/${id}/close`, data),
  },
  safetyObservations: {
    create: (data) => api.post('/engineering/safety-observations', data),
    listByProject: (projectId) => api.get(`/engineering/projects/${projectId}/safety-observations`),
    get: (id) => api.get(`/engineering/safety-observations/${id}`),
    update: (id, data) => api.put(`/engineering/safety-observations/${id}`, data),
    delete: (id) => api.delete(`/engineering/safety-observations/${id}`),
    acknowledge: (id) => api.post(`/engineering/safety-observations/${id}/acknowledge`),
    resolve: (id, data) => api.post(`/engineering/safety-observations/${id}/resolve`, data),
    close: (id) => api.post(`/engineering/safety-observations/${id}/close`),
  },
  hseDashboard: {
    get: (projectId) => api.get(`/engineering/hse/dashboard/${projectId}`),
  },
};

export default api;
