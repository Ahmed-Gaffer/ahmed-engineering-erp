import EntityPage from '../EntityPage';
import { drawingRevisionsService } from '../../services/api';

const columns = [
  { field: 'revision_number', headerName: 'revisionNumber', type: 'number', width: 110 },
  { field: 'description', headerName: 'description', flex: 1.5 },
  { field: 'drawing_id', headerName: 'drawings', type: 'number', width: 90 },
  { field: 'status', headerName: 'status', width: 110 },
  { field: 'approved_by', headerName: 'approvedBy', width: 130 },
  { field: 'approved_date', headerName: 'approvedDate', type: 'date', width: 110 },
];

const fields = [
  { name: 'drawing_id', label: 'drawings', type: 'number', required: true },
  { name: 'revision_number', label: 'revisionNumber', type: 'number', required: true },
  { name: 'description', label: 'description' },
  { name: 'file_path', label: 'file' },
  { name: 'approved_by', label: 'approvedBy' },
  { name: 'approved_date', label: 'approvedDate', type: 'date' },
  { name: 'status', label: 'status', options: [{ value: 'submitted', label: 'submitted' }, { value: 'under_review', label: 'underReview' }, { value: 'approved', label: 'approved' }, { value: 'rejected', label: 'rejected' }] },
];

export default function DrawingRevisions() {
  return <EntityPage service={drawingRevisionsService} columns={columns} fields={fields} title="drawingRevisions" />;
}
