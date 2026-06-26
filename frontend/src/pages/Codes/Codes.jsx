import EntityPage from '../EntityPage';
import { codesService } from '../../services/api';

const columns = [
  { field: 'code', headerName: 'code', width: 120 },
  { field: 'title', headerName: 'title', flex: 1.5 },
  { field: 'project_id', headerName: 'project', type: 'number', width: 80 },
  { field: 'level', headerName: 'level', type: 'number', width: 70 },
  { field: 'type', headerName: 'type', width: 80 },
  { field: 'unit', headerName: 'unit', width: 80 },
  { field: 'unit_price', headerName: 'unitPrice', type: 'number', width: 100 },
  { field: 'total_quantity', headerName: 'quantity', type: 'number', width: 100 },
];

const fields = [
  { name: 'project_id', label: 'project', type: 'number', required: true },
  { name: 'code', label: 'code', required: true },
  { name: 'parent_id', label: 'parent', type: 'number' },
  { name: 'level', label: 'level', type: 'number' },
  { name: 'title', label: 'title', required: true },
  { name: 'unit', label: 'unit' },
  { name: 'unit_price', label: 'unitPrice', type: 'number' },
  { name: 'total_quantity', label: 'quantity', type: 'number' },
  { name: 'type', label: 'type', options: [{ value: 'item', label: 'item' }, { value: 'group', label: 'group' }] },
];

export default function Codes() {
  return <EntityPage service={codesService} columns={columns} fields={fields} title="codes" />;
}
