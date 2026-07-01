import { Folder } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import EntityPage from '../EntityPage';
import { projectsService } from '../../services/api';

const columns = [
  { field: 'code', headerName: 'code', width: 100, linkTo: (row: { id: number }) => `/engineering/projects/${row.id}` },
  { field: 'name', headerName: 'name', flex: 1.5, linkTo: (row: { id: number }) => `/engineering/projects/${row.id}` },
  { field: 'project_type', headerName: 'projectType', width: 100 },
  { field: 'status', headerName: 'status', width: 110 },
  { field: 'start_date', headerName: 'startDate', type: 'date', width: 110 },
  { field: 'end_date_planned', headerName: 'endDatePlanned', type: 'date', width: 110 },
  { field: 'budget_estimated', headerName: 'budgetEstimated', type: 'number', width: 130 },
];

const fields = [
  { name: 'code', label: 'code', required: true },
  { name: 'name', label: 'name', required: true },
  { name: 'location', label: 'location' },
  { name: 'project_type', label: 'projectType', required: true, options: [{ value: 'مباني', label: 'مباني' }, { value: 'طرق', label: 'طرق' }, { value: 'بنية تحتية', label: 'بنية تحتية' }, { value: 'صيانة', label: 'صيانة' }] },
  { name: 'contractor_id', label: 'contractor', type: 'number' },
  { name: 'start_date', label: 'startDate', type: 'date' },
  { name: 'end_date_planned', label: 'endDatePlanned', type: 'date' },
  { name: 'end_date_actual', label: 'endDateActual', type: 'date' },
  { name: 'status', label: 'status', options: [{ value: 'planned', label: 'planned' }, { value: 'in_progress', label: 'inProgress' }, { value: 'completed', label: 'completed' }, { value: 'on_hold', label: 'onHold' }, { value: 'cancelled', label: 'cancelled' }] },
  { name: 'budget_estimated', label: 'budgetEstimated', type: 'number' },
  { name: 'budget_actual', label: 'budgetActual', type: 'number' },
  { name: 'client_name', label: 'clientName' },
  { name: 'consultant_name', label: 'consultantName' },
  { name: 'project_manager', label: 'projectManager' },
  { name: 'notes', label: 'notes' },
];

export default function Projects() {
  const theme = useTheme();
  return <EntityPage service={projectsService} columns={columns} fields={fields} title="projects" icon={<Folder />} accentColor={theme.palette.secondary.main} />;
}
