import axios, { AxiosInstance, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
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

interface EntityService {
  list: (params?: Record<string, unknown>) => Promise<AxiosResponse>;
  get: (id: number | string) => Promise<AxiosResponse>;
  create: (data: Record<string, unknown>) => Promise<AxiosResponse>;
  update: (id: number | string, data: Record<string, unknown>) => Promise<AxiosResponse>;
  delete: (id: number | string) => Promise<AxiosResponse>;
  bulkDelete?: (ids: (number | string)[]) => Promise<AxiosResponse>;
}

const createEntityService = (path: string): EntityService => ({
  list: (params) => api.get(`/${path}/`, { params }),
  get: (id) => api.get(`/${path}/${id}`),
  create: (data) => api.post(`/${path}/`, data),
  update: (id, data) => api.put(`/${path}/${id}`, data),
  delete: (id) => api.delete(`/${path}/${id}`),
  bulkDelete: (ids) => api.post(`/${path}/bulk-delete`, { ids }),
});

export const auth = {
  login: (data: { username: string; password: string }) => api.post('/auth/login', data),
  register: (data: { username: string; email?: string; password: string }) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const uploadFile = (file: File) => {
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
  list: (params?: Record<string, unknown>) => api.get('/engineering/notifications', { params }),
  unreadCount: () => api.get('/engineering/notifications/unread-count'),
  create: (data: Record<string, unknown>) => api.post('/engineering/notifications', data),
  markRead: (id: number | string) => api.put(`/engineering/notifications/${id}/read`),
  markAllRead: () => api.put('/engineering/notifications/read-all'),
};

export const activitiesApi = {
  list: (params?: Record<string, unknown>) => api.get('/activities/', { params }),
};

export const searchApi = {
  search: (q: string, signal?: AbortSignal) => api.get('/search/', { params: { q }, signal }),
};

export const exportApi = {
  download: (entity: string) => api.get(`/export/${entity}`, { responseType: 'blob' }),
};

export const workflowApi = {
  getLogs: (entityType: string, entityId: number | string) => api.get('/workflow/logs', { params: { entity_type: entityType, entity_id: entityId } }),
  getRecent: (limit?: number) => api.get('/workflow/logs/recent', { params: { limit } }),
  createAction: (data: Record<string, unknown>) => api.post('/workflow/actions', data),
};

export const adminApi = {
  logs: (params?: Record<string, unknown>) => api.get('/engineering/admin/logs', { params }),
  listSettings: () => api.get('/engineering/admin/settings'),
  createSetting: (data: Record<string, unknown>) => api.post('/engineering/admin/settings', data),
  updateSetting: (key: string, data: Record<string, unknown>) => api.put(`/engineering/admin/settings/${key}`, data),
  activity: (params?: Record<string, unknown>) => api.get('/engineering/admin/activity', { params }),
};

export const engineeringApi = {
  dashboard: { summary: () => api.get('/engineering/dashboard/summary'), ipcTrends: () => api.get('/engineering/dashboard/ipc-trends') },
  reports: {
    financial: () => api.get('/engineering/reports/financial'),
    progress: () => api.get('/engineering/reports/progress'),
    workOrders: (params?: Record<string, unknown>) => api.get('/engineering/reports/work-orders', { params }),
    schedules: (params?: Record<string, unknown>) => api.get('/engineering/reports/schedules', { params }),
    daily: (params?: Record<string, unknown>) => api.get('/engineering/reports/daily', { params }),
    projectFinancial: (projectId: number | string) => api.get(`/engineering/reports/project-financial/${projectId}`),
    projectComparison: (params?: Record<string, unknown>) => api.get('/engineering/reports/project-comparison', { params }),
    dashboardExport: () => api.get('/engineering/reports/dashboard-export', { responseType: 'blob' }),
  },
  projects: {
    list: () => api.get('/engineering/projects', { params: { skip: 0, limit: 100 } }),
    create: (data: Record<string, unknown>) => api.post('/engineering/projects', data),
    get: (id: number | string) => api.get(`/engineering/projects/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.patch(`/engineering/projects/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/projects/${id}`),
    summary: (id: number | string) => api.get(`/engineering/projects/${id}/summary`),
  },
  contracts: {
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/contracts`),
    create: (data: Record<string, unknown>) => api.post('/engineering/contracts', data),
    get: (id: number | string) => api.get(`/engineering/contracts/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.patch(`/engineering/contracts/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/contracts/${id}`),
  },
  boqItems: {
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/boq`),
    create: (data: Record<string, unknown>) => api.post('/engineering/boq-items', data),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/boq-items/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/boq-items/${id}`),
    bulkCreate: (items: Record<string, unknown>[]) => api.post('/engineering/boq-items/bulk', items),
    exportExcel: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/boq/export`, { responseType: 'blob' }),
    importExcel: (projectId: number | string, file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post(`/engineering/projects/${projectId}/boq/import`, form);
    },
  },
  ipcs: {
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/ipcs`),
    create: (data: Record<string, unknown>) => api.post('/engineering/ipcs', data),
    get: (id: number | string) => api.get(`/engineering/ipcs/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/ipcs/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/ipcs/${id}`),
    approve: (id: number | string, params?: Record<string, unknown>) => api.post(`/engineering/ipcs/${id}/approve`, params),
    submit: (id: number | string, params?: Record<string, unknown>) => api.post(`/engineering/ipcs/${id}/submit`, params),
    reject: (id: number | string, params?: Record<string, unknown>) => api.post(`/engineering/ipcs/${id}/reject`, params),
    pay: (id: number | string, params?: Record<string, unknown>) => api.post(`/engineering/ipcs/${id}/pay`, params),
    exportExcel: (id: number | string) => api.get(`/engineering/ipcs/${id}/export`, { responseType: 'blob' }),
    exportPdf: (id: number | string) => api.get(`/engineering/ipcs/${id}/pdf`, { responseType: 'blob' }),
    projectSummary: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/ipcs/summary`),
  },
  drawings: {
    create: (data: Record<string, unknown>) => api.post('/engineering/drawings', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/drawings`),
  },
  dailyReports: {
    create: (data: Record<string, unknown>) => api.post('/engineering/daily-reports', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/daily-reports`),
    get: (id: number | string) => api.get(`/engineering/daily-reports/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/daily-reports/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/daily-reports/${id}`),
  },
  subcontractors: {
    create: (data: Record<string, unknown>) => api.post('/engineering/subcontractors', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/subcontractors`),
    get: (id: number | string) => api.get(`/engineering/subcontractors/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/subcontractors/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/subcontractors/${id}`),
  },
  schedules: {
    create: (data: Record<string, unknown>) => api.post('/engineering/schedules', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/schedules`),
    get: (id: number | string) => api.get(`/engineering/schedules/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/schedules/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/schedules/${id}`),
    updateProgress: (id: number | string, progress: number) => api.patch(`/engineering/schedules/${id}/progress`, { progress }),
    updateDependencies: (id: number | string, dependencies: unknown[]) => api.patch(`/engineering/schedules/${id}/dependencies`, { dependencies }),
    calculateCriticalPath: (projectId: number | string) => api.post(`/engineering/projects/${projectId}/schedules/critical-path`),
  },
  documents: {
    create: (data: Record<string, unknown>) => api.post('/engineering/documents', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/documents`),
  },
  variationOrders: {
    create: (data: Record<string, unknown>) => api.post('/engineering/variation-orders', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/variation-orders`),
    get: (id: number | string) => api.get(`/engineering/variation-orders/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/variation-orders/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/variation-orders/${id}`),
    impactSummary: (id: number | string) => api.get(`/engineering/variation-orders/${id}/impact-summary`),
    addBoqItem: (voId: number | string, data: Record<string, unknown>) => api.post(`/engineering/variation-orders/${voId}/boq-items`, data),
    listBoqItems: (voId: number | string) => api.get(`/engineering/variation-orders/${voId}/boq-items`),
    deleteBoqItem: (voId: number | string, itemId: number | string) => api.delete(`/engineering/variation-orders/${voId}/boq-items/${itemId}`),
    addScheduleImpact: (voId: number | string, data: Record<string, unknown>) => api.post(`/engineering/variation-orders/${voId}/schedule-impact`, data),
    listScheduleImpacts: (voId: number | string) => api.get(`/engineering/variation-orders/${voId}/schedule-impacts`),
    deleteScheduleImpact: (voId: number | string, impactId: number | string) => api.delete(`/engineering/variation-orders/${voId}/schedule-impacts/${impactId}`),
  },
  rfis: {
    create: (data: Record<string, unknown>) => api.post('/engineering/rfis', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/rfis`),
    get: (id: number | string) => api.get(`/engineering/rfis/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/rfis/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/rfis/${id}`),
  },
  mar: {
    create: (data: Record<string, unknown>) => api.post('/engineering/mar', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/mar`),
    get: (id: number | string) => api.get(`/engineering/mar/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/mar/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/mar/${id}`),
    submit: (id: number | string) => api.post(`/engineering/mar/${id}/submit`),
    approve: (id: number | string) => api.post(`/engineering/mar/${id}/approve`),
    reject: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/mar/${id}/reject`, data),
    upload: (id: number | string, file: File) => { const f = new FormData(); f.append('file', file); return api.post(`/engineering/mar/${id}/upload`, f); },
    exportPdf: (id: number | string) => api.get(`/engineering/mar/${id}/pdf`, { responseType: 'blob' }),
  },
  ncr: {
    create: (data: Record<string, unknown>) => api.post('/engineering/ncr', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/ncr`),
    get: (id: number | string) => api.get(`/engineering/ncr/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/ncr/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/ncr/${id}`),
    investigate: (id: number | string) => api.post(`/engineering/ncr/${id}/investigate`),
    applyAction: (id: number | string, data: Record<string, unknown>) => api.post(`/engineering/ncr/${id}/action`, data),
    close: (id: number | string, data: Record<string, unknown>) => api.post(`/engineering/ncr/${id}/close`, data),
    reject: (id: number | string, data: Record<string, unknown>) => api.post(`/engineering/ncr/${id}/reject`, data),
    upload: (id: number | string, file: File) => { const f = new FormData(); f.append('file', file); return api.post(`/engineering/ncr/${id}/upload`, f); },
    exportPdf: (id: number | string) => api.get(`/engineering/ncr/${id}/pdf`, { responseType: 'blob' }),
  },
  submittals: {
    create: (data: Record<string, unknown>) => api.post('/engineering/submittals', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/submittals`),
    get: (id: number | string) => api.get(`/engineering/submittals/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/submittals/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/submittals/${id}`),
    submit: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/submittals/${id}/submit`, data),
    approve: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/submittals/${id}/approve`, data),
    reject: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/submittals/${id}/reject-with-comments`, data),
    resubmit: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/submittals/${id}/resubmit`, data),
    close: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/submittals/${id}/close`, data),
  },
  inspections: {
    create: (data: Record<string, unknown>) => api.post('/engineering/inspection-requests', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/inspection-requests`),
    get: (id: number | string) => api.get(`/engineering/inspection-requests/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/inspection-requests/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/inspection-requests/${id}`),
    submit: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/inspection-requests/${id}/submit`, data),
    inspect: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/inspection-requests/${id}/inspect`, data),
    pass: (id: number | string) => api.post(`/engineering/inspection-requests/${id}/pass`),
    fail: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/inspection-requests/${id}/fail`, data),
    scheduleReinspection: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/inspection-requests/${id}/schedule-reinspection`, data),
  },
  punchList: {
    create: (data: Record<string, unknown>) => api.post('/engineering/punch-list-items', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/punch-list-items`),
    get: (id: number | string) => api.get(`/engineering/punch-list-items/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/punch-list-items/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/punch-list-items/${id}`),
    start: (id: number | string) => api.post(`/engineering/punch-list-items/${id}/start`),
    complete: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/punch-list-items/${id}/complete`, data),
    verify: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/punch-list-items/${id}/verify`, data),
    accept: (id: number | string) => api.post(`/engineering/punch-list-items/${id}/accept`),
    reopen: (id: number | string) => api.post(`/engineering/punch-list-items/${id}/reopen`),
  },
  transmittals: {
    create: (data: Record<string, unknown>) => api.post('/engineering/transmittals', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/transmittals`),
    get: (id: number | string) => api.get(`/engineering/transmittals/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/transmittals/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/transmittals/${id}`),
    send: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/transmittals/${id}/send`, data),
    markReceived: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/transmittals/${id}/mark-received`, data),
    acknowledge: (id: number | string) => api.post(`/engineering/transmittals/${id}/acknowledge`),
    close: (id: number | string) => api.post(`/engineering/transmittals/${id}/close`),
  },
  meetingMinutes: {
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/meeting-minutes`),
    create: (data: Record<string, unknown>) => api.post('/engineering/meeting-minutes', data),
    get: (id: number | string) => api.get(`/engineering/meeting-minutes/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/meeting-minutes/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/meeting-minutes/${id}`),
    finalize: (id: number | string) => api.post(`/engineering/meeting-minutes/${id}/finalize`),
    exportPdf: (id: number | string) => api.get(`/engineering/meeting-minutes/${id}/pdf`, { responseType: 'blob' }),
  },
  evm: {
    report: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/evm`),
  },
  branches: {
    create: (data: Record<string, unknown>) => api.post('/engineering/branches', data),
    list: () => api.get('/engineering/branches'),
    get: (id: number | string) => api.get(`/engineering/branches/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/branches/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/branches/${id}`),
  },
  categories: {
    create: (data: Record<string, unknown>) => api.post('/engineering/categories', data),
    list: (type?: string) => api.get('/engineering/categories', { params: { type } }),
    get: (id: number | string) => api.get(`/engineering/categories/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/categories/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/categories/${id}`),
  },
  costCodes: {
    create: (data: Record<string, unknown>) => api.post('/engineering/cost-codes', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/cost-codes`),
    get: (id: number | string) => api.get(`/engineering/cost-codes/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/cost-codes/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/cost-codes/${id}`),
  },
  safetyIncidents: {
    create: (data: Record<string, unknown>) => api.post('/engineering/safety-incidents', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/safety-incidents`),
    get: (id: number | string) => api.get(`/engineering/safety-incidents/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/safety-incidents/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/safety-incidents/${id}`),
    investigate: (id: number | string, data: Record<string, unknown>) => api.post(`/engineering/safety-incidents/${id}/investigate`, data),
    takeAction: (id: number | string, data: Record<string, unknown>) => api.post(`/engineering/safety-incidents/${id}/take-action`, data),
    close: (id: number | string, data: Record<string, unknown>) => api.post(`/engineering/safety-incidents/${id}/close`, data),
  },
  safetyObservations: {
    create: (data: Record<string, unknown>) => api.post('/engineering/safety-observations', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/safety-observations`),
    get: (id: number | string) => api.get(`/engineering/safety-observations/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/safety-observations/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/safety-observations/${id}`),
    acknowledge: (id: number | string) => api.post(`/engineering/safety-observations/${id}/acknowledge`),
    resolve: (id: number | string, data: Record<string, unknown>) => api.post(`/engineering/safety-observations/${id}/resolve`, data),
    close: (id: number | string) => api.post(`/engineering/safety-observations/${id}/close`),
  },
  hseDashboard: {
    get: (projectId: number | string) => api.get(`/engineering/hse/dashboard/${projectId}`),
  },
  materialTests: {
    create: (data: Record<string, unknown>) => api.post('/engineering/material-tests', data),
    listByProject: (projectId: number | string) => api.get(`/engineering/material-tests`, { params: { project_id: projectId } }),
    get: (id: number | string) => api.get(`/engineering/material-tests/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/material-tests/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/material-tests/${id}`),
    stats: (projectId?: number | string) => api.get(`/engineering/material-tests/stats/overview`, { params: projectId ? { project_id: projectId } : undefined }),
    recordResult: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/material-tests/${id}/record-result`, data),
    verify: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/material-tests/${id}/verify`, data),
  },
  itps: {
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/itps`),
    create: (data: Record<string, unknown>) => api.post('/engineering/itps', data),
    get: (id: number | string) => api.get(`/engineering/itps/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/itps/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/itps/${id}`),
    submit: (id: number | string) => api.post(`/engineering/itps/${id}/submit`),
    review: (id: number | string, data: Record<string, unknown>) => api.post(`/engineering/itps/${id}/review`, data),
    approve: (id: number | string) => api.post(`/engineering/itps/${id}/approve`),
    reject: (id: number | string) => api.post(`/engineering/itps/${id}/reject`),
    stats: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/itps/stats`),
  },
  methodStatements: {
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/method-statements`),
    create: (data: Record<string, unknown>) => api.post('/engineering/method-statements', data),
    get: (id: number | string) => api.get(`/engineering/method-statements/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/method-statements/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/method-statements/${id}`),
    submit: (id: number | string) => api.post(`/engineering/method-statements/${id}/submit`),
    review: (id: number | string, data: Record<string, unknown>) => api.post(`/engineering/method-statements/${id}/review`, data),
    approve: (id: number | string) => api.post(`/engineering/method-statements/${id}/approve`),
    reject: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/method-statements/${id}/reject`, data),
    stats: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/method-statements/stats`),
  },
  permits: {
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/permits`),
    create: (data: Record<string, unknown>) => api.post('/engineering/permits', data),
    get: (id: number | string) => api.get(`/engineering/permits/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/permits/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/permits/${id}`),
    submit: (id: number | string) => api.post(`/engineering/permits/${id}/submit`),
    approve: (id: number | string) => api.post(`/engineering/permits/${id}/approve`),
    issue: (id: number | string) => api.post(`/engineering/permits/${id}/issue`),
    activate: (id: number | string) => api.post(`/engineering/permits/${id}/activate`),
    complete: (id: number | string) => api.post(`/engineering/permits/${id}/complete`),
    cancel: (id: number | string) => api.post(`/engineering/permits/${id}/cancel`),
    reject: (id: number | string, data?: Record<string, unknown>) => api.post(`/engineering/permits/${id}/reject`, data),
    stats: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/permits/stats`),
  },
  surveyPoints: {
    listByProject: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/survey-points`),
    create: (data: Record<string, unknown>) => api.post('/engineering/survey-points', data),
    get: (id: number | string) => api.get(`/engineering/survey-points/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/survey-points/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/survey-points/${id}`),
    stats: (projectId: number | string) => api.get(`/engineering/projects/${projectId}/survey-points/stats`),
    listReadings: (projectId: number | string, pointId?: number | string) => {
      const params: Record<string, unknown> = {};
      if (pointId) params.point_id = pointId;
      return api.get(`/engineering/projects/${projectId}/survey-readings`, { params });
    },
    createReading: (pointId: number | string, data: Record<string, unknown>) => api.post(`/engineering/survey-points/${pointId}/readings`, data),
    updateReading: (readingId: number | string, data: Record<string, unknown>) => api.put(`/engineering/survey-readings/${readingId}`, data),
    deleteReading: (readingId: number | string) => api.delete(`/engineering/survey-readings/${readingId}`),
  },
  specifications: {
    list: (params?: Record<string, unknown>) => api.get('/engineering/specifications', { params }),
    create: (data: Record<string, unknown>) => api.post('/engineering/specifications', data),
    search: (params?: Record<string, unknown>) => api.get('/engineering/specifications/search', { params }),
    stats: () => api.get('/engineering/specifications/stats'),
    get: (id: number | string) => api.get(`/engineering/specifications/${id}`),
    update: (id: number | string, data: Record<string, unknown>) => api.put(`/engineering/specifications/${id}`, data),
    delete: (id: number | string) => api.delete(`/engineering/specifications/${id}`),
    createSection: (specId: number | string, data: Record<string, unknown>) => api.post(`/engineering/specifications/${specId}/sections`, data),
    updateSection: (sectionId: number | string, data: Record<string, unknown>) => api.put(`/engineering/spec-sections/${sectionId}`, data),
    deleteSection: (sectionId: number | string) => api.delete(`/engineering/spec-sections/${sectionId}`),
  },
};

export default api;
