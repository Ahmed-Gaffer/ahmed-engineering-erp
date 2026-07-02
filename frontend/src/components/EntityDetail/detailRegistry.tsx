import { ReactNode } from 'react';
import { engineeringApi, contractorsService, projectsService, phasesService, codesService, workOrdersService, workOrderItemsService, drawingsService, drawingRevisionsService, documentsService, paymentCertificatesService, employeesService } from '../../services/api';
import { FieldDef, SubItemConfig } from './EntityDetail';
import {
  Business, Image, WarningAmber, QuestionAnswer, Description, CheckCircle, CalendarMonth,
  Schedule, Receipt, CompareArrows, Engineering, Science, FolderOpen, Assignment,
  SafetyCheck, Architecture, Handyman, Category, Money, People, Badge, Notifications,
  AdminPanelSettings, AccountBalance, LocalShipping, Build, School, Plumbing, Search,
} from '@mui/icons-material';

interface DetailRouteConfig {
  path: string;
  titleKey: string;
  backPath: string;
  fetchById: (id: number | string) => Promise<any>;
  fields?: FieldDef[];
  subItems?: SubItemConfig[];
  icon?: ReactNode;
}

export const detailRoutes: DetailRouteConfig[] = [
  { path: 'contractors', titleKey: 'contractors', backPath: '/engineering/contractors', fetchById: (id) => contractorsService.get(id), icon: <People /> },
  { path: 'projects', titleKey: 'projects', backPath: '/engineering/projects', fetchById: (id) => projectsService.get(id), icon: <FolderOpen /> },
  { path: 'phases', titleKey: 'phases', backPath: '/engineering/phases', fetchById: (id) => phasesService.get(id), icon: <Architecture /> },
  { path: 'codes', titleKey: 'codes', backPath: '/engineering/codes', fetchById: (id) => codesService.get(id), icon: <Category /> },
  { path: 'work-orders', titleKey: 'workOrders', backPath: '/engineering/work-orders', fetchById: (id) => workOrdersService.get(id), icon: <Handyman /> },
  { path: 'work-order-items', titleKey: 'workOrderItems', backPath: '/engineering/work-order-items', fetchById: (id) => workOrderItemsService.get(id), icon: <Build /> },
  { path: 'drawings', titleKey: 'drawings', backPath: '/engineering/drawings', fetchById: (id) => drawingsService.get(id), icon: <Image /> },
  { path: 'drawing-revisions', titleKey: 'drawingRevisions', backPath: '/engineering/drawing-revisions', fetchById: (id) => drawingRevisionsService.get(id), icon: <Image /> },
  { path: 'documents', titleKey: 'documents', backPath: '/engineering/documents', fetchById: (id) => documentsService.get(id), icon: <Description /> },
  { path: 'payment-certificates', titleKey: 'paymentCertificates', backPath: '/engineering/payment-certificates', fetchById: (id) => paymentCertificatesService.get(id), icon: <Money /> },
  { path: 'employees', titleKey: 'employees', backPath: '/engineering/employees', fetchById: (id) => employeesService.get(id), icon: <Badge /> },
  {
    path: 'contracts-list', titleKey: 'contractsPage', backPath: '/engineering/contracts-list',
    fetchById: (id) => engineeringApi.contracts.get(id), icon: <Assignment />,
    subItems: [{
      titleKey: 'boq', fetchFn: (pid) => engineeringApi.boqItems.listByProject(pid),
      columns: [{ field: 'item_code', labelKey: 'itemCode' }, { field: 'description', labelKey: 'description' }, { field: 'quantity', labelKey: 'quantity', type: 'number' }, { field: 'unit_price', labelKey: 'unitPrice', type: 'number' }],
    }],
  },
  {
    path: 'ipc', titleKey: 'ipc', backPath: '/engineering/ipc',
    fetchById: (id) => engineeringApi.ipcs.get(id), icon: <Engineering />,
    subItems: [{
      titleKey: 'ipcItems', fetchFn: (ipcId) => engineeringApi.ipcs.get(ipcId).then((r) => {
        const items = (r.data as any).items || (r.data as any).details || [];
        return { data: Array.isArray(items) ? items : [] };
      }),
      columns: [{ field: 'item_code', labelKey: 'itemCode' }, { field: 'description', labelKey: 'description' }, { field: 'quantity', labelKey: 'quantity', type: 'number' }, { field: 'unit_price', labelKey: 'unitPrice', type: 'number' }, { field: 'total', labelKey: 'total', type: 'number' }],
    }],
  },
  {
    path: 'daily-reports', titleKey: 'dailyReportsPage', backPath: '/engineering/daily-reports',
    fetchById: (id) => engineeringApi.dailyReports.get(id), icon: <CalendarMonth />,
  },
  {
    path: 'subcontractors', titleKey: 'subcontractorsPage', backPath: '/engineering/subcontractors',
    fetchById: (id) => engineeringApi.subcontractors.get(id), icon: <LocalShipping />,
  },
  {
    path: 'schedules', titleKey: 'schedulesPage', backPath: '/engineering/schedules',
    fetchById: (id) => engineeringApi.schedules.get(id), icon: <Schedule />,
  },
  {
    path: 'variation-orders', titleKey: 'variationOrders', backPath: '/engineering/variation-orders',
    fetchById: (id) => engineeringApi.variationOrders.get(id), icon: <CompareArrows />,
  },
  {
    path: 'rfis', titleKey: 'rfis', backPath: '/engineering/rfis',
    fetchById: (id) => engineeringApi.rfis.get(id), icon: <QuestionAnswer />,
  },
  {
    path: 'mar', titleKey: 'mar', backPath: '/engineering/mar',
    fetchById: (id) => engineeringApi.mar.get(id), icon: <CheckCircle />,
  },
  {
    path: 'ncr', titleKey: 'ncr', backPath: '/engineering/ncr',
    fetchById: (id) => engineeringApi.ncr.get(id), icon: <WarningAmber />,
  },
  {
    path: 'submittals', titleKey: 'submittals', backPath: '/engineering/submittals',
    fetchById: (id) => engineeringApi.submittals.get(id), icon: <Description />,
  },
  {
    path: 'inspection-requests', titleKey: 'inspectionRequests', backPath: '/engineering/inspection-requests',
    fetchById: (id) => engineeringApi.inspections.get(id), icon: <Search />,
  },
  {
    path: 'punch-list', titleKey: 'punchList', backPath: '/engineering/punch-list',
    fetchById: (id) => engineeringApi.punchList.get(id), icon: <Build />,
  },
  {
    path: 'transmittals', titleKey: 'transmittals', backPath: '/engineering/transmittals',
    fetchById: (id) => engineeringApi.transmittals.get(id), icon: <LocalShipping />,
  },
  {
    path: 'branches', titleKey: 'branches', backPath: '/engineering/branches',
    fetchById: (id) => engineeringApi.branches.get(id), icon: <AccountBalance />,
  },
  {
    path: 'categories', titleKey: 'categories', backPath: '/engineering/categories',
    fetchById: (id) => engineeringApi.categories.get(id), icon: <Category />,
  },
  {
    path: 'cost-codes', titleKey: 'costCodes', backPath: '/engineering/cost-codes',
    fetchById: (id) => engineeringApi.costCodes.get(id), icon: <Money />,
  },
  {
    path: 'safety-incidents', titleKey: 'safetyIncidents', backPath: '/engineering/safety-incidents',
    fetchById: (id) => engineeringApi.safetyIncidents.get(id), icon: <SafetyCheck />,
  },
  {
    path: 'safety-observations', titleKey: 'safetyObservations', backPath: '/engineering/safety-observations',
    fetchById: (id) => engineeringApi.safetyObservations.get(id), icon: <SafetyCheck />,
  },
  {
    path: 'material-tests', titleKey: 'materialTests', backPath: '/engineering/material-tests',
    fetchById: (id) => engineeringApi.materialTests.get(id), icon: <Science />,
  },
  {
    path: 'itps', titleKey: 'itp', backPath: '/engineering/itps',
    fetchById: (id) => engineeringApi.itps.get(id), icon: <Assignment />,
    subItems: [{
      titleKey: 'itpItems', fetchFn: (itpId) => engineeringApi.itps.get(itpId).then((r) => {
        const items = (r.data as any).items || (r.data as any).checkpoints || [];
        return { data: Array.isArray(items) ? items : [] };
      }),
      columns: [{ field: 'item_code', labelKey: 'itemCode' }, { field: 'description', labelKey: 'description' }, { field: 'status', labelKey: 'status' }],
    }],
  },
  {
    path: 'method-statements', titleKey: 'methodStatements', backPath: '/engineering/method-statements',
    fetchById: (id) => engineeringApi.methodStatements.get(id), icon: <School />,
  },
  {
    path: 'specifications', titleKey: 'specifications', backPath: '/engineering/specifications',
    fetchById: (id) => engineeringApi.specifications.get(id), icon: <Architecture />,
  },
  {
    path: 'permits', titleKey: 'permits', backPath: '/engineering/permits',
    fetchById: (id) => engineeringApi.permits.get(id), icon: <Plumbing />,
  },
  {
    path: 'survey', titleKey: 'survey', backPath: '/engineering/survey',
    fetchById: (id) => engineeringApi.surveyPoints.get(id), icon: <Search />,
  },
];
