import EntityPage from '../EntityPage';
import { drawingsService } from '../../services/api';

const columns = [
  { field: 'drawing_number', headerName: 'drawingNumber', width: 110 },
  { field: 'title', headerName: 'title', flex: 1.5 },
  { field: 'project_id', headerName: 'project', type: 'number', width: 80 },
  { field: 'discipline', headerName: 'discipline', width: 90 },
  { field: 'status', headerName: 'status', width: 120 },
  { field: 'current_revision', headerName: 'currentRevision', type: 'number', width: 100 },
  { field: 'created_by', headerName: 'createdBy', width: 130 },
];

const fields = [
  { name: 'project_id', label: 'project', type: 'number', required: true },
  { name: 'drawing_number', label: 'drawingNumber', required: true },
  { name: 'title', label: 'title', required: true },
  { name: 'discipline', label: 'discipline', required: true, options: [{ value: 'معماري', label: 'معماري' }, { value: 'إنشائي', label: 'إنشائي' }, { value: 'كهرباء', label: 'كهرباء' }, { value: 'ميكانيكا', label: 'ميكانيكا' }, { value: 'صحي', label: 'صحي' }, { value: 'شبكات', label: 'شبكات' }] },
  { name: 'scale', label: 'scale' },
  { name: 'phase_id', label: 'phases', type: 'number' },
  { name: 'status', label: 'status', options: [{ value: 'under_review', label: 'underReview' }, { value: 'approved', label: 'approved' }, { value: 'rejected', label: 'rejected' }, { value: 'superseded', label: 'superseded' }, { value: 'as_built', label: 'asBuilt' }] },
  { name: 'current_revision', label: 'currentRevision', type: 'number' },
  { name: 'file_path', label: 'file' },
  { name: 'created_by', label: 'createdBy' },
];

export default function Drawings() {
  return <EntityPage service={drawingsService} columns={columns} fields={fields} title="drawings" />;
}
