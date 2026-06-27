import EntityPage from '../EntityPage';
import { paymentCertificatesService } from '../../services/api';

const columns = [
  { field: 'certificate_number', headerName: 'certificateNumber', width: 120 },
  { field: 'project_id', headerName: 'project', type: 'number', width: 80, linkTo: (row) => `/engineering/projects/${row.project_id}` },
  { field: 'period_from', headerName: 'periodFrom', type: 'date', width: 100 },
  { field: 'period_to', headerName: 'periodTo', type: 'date', width: 100 },
  { field: 'current_works', headerName: 'currentWorks', type: 'number', width: 120 },
  { field: 'net_amount', headerName: 'netAmount', type: 'number', width: 110 },
  { field: 'amount_due', headerName: 'amountDue', type: 'number', width: 110 },
  { field: 'status', headerName: 'status', width: 110 },
];

const fields = [
  { name: 'project_id', label: 'project', type: 'number', required: true },
  { name: 'certificate_number', label: 'certificateNumber', required: true },
  { name: 'contractor_id', label: 'contractor', type: 'number' },
  { name: 'period_from', label: 'periodFrom', type: 'date' },
  { name: 'period_to', label: 'periodTo', type: 'date' },
  { name: 'issue_date', label: 'issueDate', type: 'date' },
  { name: 'previous_total', label: 'previousTotal', type: 'number' },
  { name: 'current_works', label: 'currentWorks', type: 'number' },
  { name: 'materials_on_site', label: 'materialsOnSite', type: 'number' },
  { name: 'insurance_percent', label: 'insurancePercent', type: 'number' },
  { name: 'advance_repayment', label: 'advanceRepayment', type: 'number' },
  { name: 'fine_deductions', label: 'fineDeductions', type: 'number' },
  { name: 'other_deductions', label: 'otherDeductions', type: 'number' },
  { name: 'retention_percent', label: 'retentionPercent', type: 'number' },
  { name: 'status', label: 'status', options: [{ value: 'under_review', label: 'underReview' }, { value: 'approved', label: 'approved' }, { value: 'paid', label: 'paid' }, { value: 'rejected', label: 'rejected' }] },
  { name: 'payment_date', label: 'paymentDate', type: 'date' },
  { name: 'notes', label: 'notes' },
];

export default function PaymentCertificates() {
  return <EntityPage service={paymentCertificatesService} columns={columns} fields={fields} title="paymentCertificates" />;
}
