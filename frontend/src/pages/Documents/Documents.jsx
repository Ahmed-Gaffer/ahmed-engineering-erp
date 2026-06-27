import EntityPage from '../EntityPage';
import { documentsService } from '../../services/api';

const columns = [
  { field: 'doc_number', headerName: 'docNumber', width: 110 },
  { field: 'title', headerName: 'title', flex: 1.5 },
  { field: 'project_id', headerName: 'project', type: 'number', width: 80, linkTo: (row) => `/engineering/projects/${row.project_id}` },
  { field: 'type', headerName: 'type', width: 110 },
  { field: 'direction', headerName: 'direction', width: 90 },
  { field: 'status', headerName: 'status', width: 90 },
  { field: 'issue_date', headerName: 'issueDate', type: 'date', width: 110 },
];

const fields = [
  { name: 'project_id', label: 'project', type: 'number', required: true },
  { name: 'doc_number', label: 'docNumber', required: true },
  { name: 'title', label: 'title', required: true },
  { name: 'type', label: 'type', required: true, options: [{ value: 'contract', label: 'contract' }, { value: 'variation_order', label: 'variation_order' }, { value: 'letter', label: 'letter' }, { value: 'report', label: 'report' }, { value: 'permit', label: 'permit' }, { value: 'protocol', label: 'protocol' }, { value: 'other', label: 'other' }] },
  { name: 'direction', label: 'direction', required: true, options: [{ value: 'incoming', label: 'incoming' }, { value: 'outgoing', label: 'outgoing' }, { value: 'internal', label: 'internal' }] },
  { name: 'related_party', label: 'relatedParty' },
  { name: 'issue_date', label: 'issueDate', type: 'date' },
  { name: 'file_path', label: 'file' },
  { name: 'tags', label: 'tags' },
  { name: 'status', label: 'status', options: [{ value: 'draft', label: 'draft' }, { value: 'final', label: 'final' }, { value: 'archived', label: 'archived' }] },
];

export default function Documents() {
  return <EntityPage service={documentsService} columns={columns} fields={fields} title="documents" />;
}
