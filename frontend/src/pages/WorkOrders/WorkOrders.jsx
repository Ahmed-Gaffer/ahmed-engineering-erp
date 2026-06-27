import EntityPage from '../EntityPage';
import { workOrdersService } from '../../services/api';

const columns = [
  { field: 'wo_number', headerName: 'woNumber', width: 110, linkTo: '/engineering/work-orders' },
  { field: 'title', headerName: 'title', flex: 1.5 },
  { field: 'project_id', headerName: 'project', type: 'number', width: 80, linkTo: (row) => `/engineering/projects/${row.project_id}` },
  { field: 'priority', headerName: 'priority', width: 90 },
  { field: 'status', headerName: 'status', width: 120 },
  { field: 'issue_date', headerName: 'issueDate', type: 'date', width: 110 },
  { field: 'due_date', headerName: 'dueDate', type: 'date', width: 110 },
  { field: 'total_amount', headerName: 'totalPrice', type: 'number', width: 120 },
];

const fields = [
  { name: 'project_id', label: 'project', type: 'number', required: true },
  { name: 'wo_number', label: 'woNumber', required: true },
  { name: 'title', label: 'title', required: true },
  { name: 'description', label: 'description' },
  { name: 'contractor_id', label: 'contractor', type: 'number' },
  { name: 'issue_date', label: 'issueDate', type: 'date' },
  { name: 'due_date', label: 'dueDate', type: 'date' },
  { name: 'priority', label: 'priority', options: [{ value: 'low', label: 'low' }, { value: 'medium', label: 'medium' }, { value: 'high', label: 'high' }, { value: 'urgent', label: 'urgent' }] },
  { name: 'status', label: 'status', options: [{ value: 'issued', label: 'issued' }, { value: 'under_execution', label: 'underExecution' }, { value: 'completed', label: 'completed' }, { value: 'closed', label: 'closed' }, { value: 'cancelled', label: 'cancelled' }] },
];

export default function WorkOrders() {
  return <EntityPage service={workOrdersService} columns={columns} fields={fields} title="workOrders" />;
}
