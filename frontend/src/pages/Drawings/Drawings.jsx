import EntityPage from '../EntityPage';
import { Image } from '@mui/icons-material';
import { drawingsService } from '../../services/api';

const columns = [
  { field: 'drawing_number', headerName: 'drawingNumber', width: 120 },
  { field: 'title', headerName: 'title', flex: 1.5 },
  { field: 'project_id', headerName: 'project', type: 'number', width: 80, linkTo: (row) => `/engineering/projects/${row.project_id}` },
  { field: 'discipline', headerName: 'discipline', width: 100 },
  { field: 'status', headerName: 'status', width: 120 },
  { field: 'current_revision', headerName: 'currentRevision', type: 'number', width: 110 },
  { field: 'created_by', headerName: 'createdBy', width: 130 },
];

const disciplines = [
  { value: 'معماري', label: 'معماري' },
  { value: 'إنشائي', label: 'إنشائي' },
  { value: 'كهرباء', label: 'كهرباء' },
  { value: 'ميكانيكا', label: 'ميكانيكا' },
  { value: 'صحي', label: 'صحي' },
  { value: 'شبكات', label: 'شبكات' },
];

const fields = [
  { name: 'project_id', label: 'project', type: 'number', required: true },
  { name: 'drawing_number', label: 'drawingNumber', required: true },
  { name: 'title', label: 'title', required: true },
  { name: 'discipline', label: 'discipline', required: true, options: disciplines },
  { name: 'scale', label: 'scale' },
  { name: 'phase_id', label: 'phases', type: 'number' },
  { name: 'status', label: 'status', options: [
    { value: 'under_review', label: 'underReview' },
    { value: 'approved', label: 'approved' },
    { value: 'rejected', label: 'rejected' },
    { value: 'superseded', label: 'superseded' },
    { value: 'as_built', label: 'asBuilt' },
  ]},
  { name: 'current_revision', label: 'currentRevision', type: 'number' },
  { name: 'file_path', label: 'file' },
  { name: 'created_by', label: 'createdBy' },
];

export default function Drawings() {
  return (
    <EntityPage
      service={drawingsService}
      columns={columns}
      fields={fields}
      title="drawings"
      subtitle="Manage and track engineering drawings across disciplines and revisions"
      icon={<Image />}
      stats={[
        { label: 'Disciplines', value: disciplines.length },
        { label: 'Statuses', value: 5 },
      ]}
    />
  );
}
