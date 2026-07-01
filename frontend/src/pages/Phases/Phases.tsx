import { AccountTree } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import EntityPage from '../EntityPage';
import { phasesService } from '../../services/api';

const columns = [
  { field: 'name', headerName: 'name', flex: 1.5 },
  { field: 'project_id', headerName: 'project', type: 'number', width: 80, linkTo: (row: { project_id: number }) => `/engineering/projects/${row.project_id}` },
  { field: 'order_index', headerName: 'orderIndex', type: 'number', width: 80 },
  { field: 'progress_percentage', headerName: 'progressPercentage', type: 'number', width: 120 },
  { field: 'status', headerName: 'status', width: 110 },
  { field: 'start_date_planned', headerName: 'startDate', type: 'date', width: 110 },
  { field: 'end_date_planned', headerName: 'endDatePlanned', type: 'date', width: 110 },
];

const fields = [
  { name: 'project_id', label: 'project', type: 'number', required: true },
  { name: 'name', label: 'name', required: true },
  { name: 'order_index', label: 'orderIndex', type: 'number' },
  { name: 'start_date_planned', label: 'startDate', type: 'date' },
  { name: 'start_date_actual', label: 'startDate', type: 'date' },
  { name: 'end_date_planned', label: 'endDatePlanned', type: 'date' },
  { name: 'end_date_actual', label: 'endDateActual', type: 'date' },
  { name: 'progress_percentage', label: 'progressPercentage', type: 'number' },
  { name: 'status', label: 'status', options: [{ value: 'pending', label: 'pending' }, { value: 'in_progress', label: 'inProgress' }, { value: 'completed', label: 'completed' }, { value: 'delayed', label: 'delayed' }] },
];

export default function Phases() {
  const theme = useTheme();
  return <EntityPage service={phasesService} columns={columns} fields={fields} title="phases" icon={<AccountTree />} accentColor={theme.palette.secondary.main} />;
}
