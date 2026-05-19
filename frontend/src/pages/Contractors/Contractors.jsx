import EntityPage from '../EntityPage';
import { contractorsService } from '../../services/api';

const columns = [
  { field: 'code', headerName: 'code', width: 100 },
  { field: 'name', headerName: 'name', flex: 1.5 },
  { field: 'classification', headerName: 'classification', width: 100 },
  { field: 'phone', headerName: 'phone', width: 130 },
  { field: 'status', headerName: 'status', width: 120 },
  { field: 'contract_value', headerName: 'contractValue', type: 'number', width: 130 },
  { field: 'insurance_remaining', headerName: 'insuranceRemaining', type: 'number', width: 130 },
];

const fields = [
  { name: 'code', label: 'code', required: true },
  { name: 'name', label: 'name', required: true },
  { name: 'classification', label: 'classification', required: true, options: [{ value: 'أ', label: 'أ' }, { value: 'ب', label: 'ب' }, { value: 'ج', label: 'ج' }, { value: 'د', label: 'د' }] },
  { name: 'specialties', label: 'specialties' },
  { name: 'phone', label: 'phone' },
  { name: 'email', label: 'email' },
  { name: 'address', label: 'address' },
  { name: 'commercial_register', label: 'commercialRegister' },
  { name: 'tax_card', label: 'taxCard' },
  { name: 'bank_account', label: 'bankAccount' },
  { name: 'contract_number', label: 'contractNumber' },
  { name: 'contract_date', label: 'contractDate', type: 'date' },
  { name: 'contract_value', label: 'contractValue', type: 'number' },
  { name: 'insurance_value', label: 'insuranceValue', type: 'number' },
  { name: 'insurance_remaining', label: 'insuranceRemaining', type: 'number' },
  { name: 'status', label: 'status', options: [{ value: 'active', label: 'active' }, { value: 'suspended', label: 'suspended' }, { value: 'blacklisted', label: 'blacklisted' }] },
  { name: 'notes', label: 'notes' },
];

export default function Contractors() {
  return <EntityPage service={contractorsService} columns={columns} fields={fields} title="contractors" />;
}
