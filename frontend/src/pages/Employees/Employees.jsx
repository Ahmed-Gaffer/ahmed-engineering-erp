import EntityPage from '../EntityPage';
import { employeesService } from '../../services/api';

const columns = [
  { field: 'employee_code', headerName: 'employeeCode', width: 110 },
  { field: 'full_name', headerName: 'fullName', flex: 1.5 },
  { field: 'position', headerName: 'position', width: 140 },
  { field: 'department', headerName: 'department', width: 120 },
  { field: 'status', headerName: 'status', width: 100 },
  { field: 'phone', headerName: 'phone', width: 120 },
  { field: 'hire_date', headerName: 'hireDate', type: 'date', width: 110 },
];

const fields = [
  { name: 'employee_code', label: 'employeeCode', required: true },
  { name: 'full_name', label: 'fullName', required: true },
  { name: 'position', label: 'position' },
  { name: 'department', label: 'department' },
  { name: 'email', label: 'email' },
  { name: 'phone', label: 'phone' },
  { name: 'national_id', label: 'nationalId' },
  { name: 'passport_number', label: 'passportNumber' },
  { name: 'hire_date', label: 'hireDate', type: 'date' },
  { name: 'salary', label: 'salary', type: 'number' },
  { name: 'status', label: 'status', options: [{ value: 'active', label: 'active' }, { value: 'inactive', label: 'inactive' }, { value: 'on_leave', label: 'onLeave' }, { value: 'terminated', label: 'terminated' }] },
  { name: 'notes', label: 'notes' },
];

export default function Employees() {
  return <EntityPage service={employeesService} columns={columns} fields={fields} title="employees" />;
}
