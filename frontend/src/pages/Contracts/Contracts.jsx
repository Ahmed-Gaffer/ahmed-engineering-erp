import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, TextField, Button, Stack, MenuItem } from '@mui/material';
import { Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable/DataTable';
import FormDialog from '../../components/FormDialog/FormDialog';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import EmptyState from '../../components/EmptyState/EmptyState';
import { engineeringApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';

export default function Contracts() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ contract_number: '', contract_type: 'main', party_a: '', party_b: '', value: '', duration_months: '', retention_percent: '5', status: 'draft', sign_date: '', advance_payment_percent: '0' });

  useEffect(() => { engineeringApi.projects.list().then(r => setProjects(r.data || [])).catch(() => {}); }, []);

  const fetchData = async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); return; }
    setLoading(true);
    try { const r = await engineeringApi.contracts.listByProject(selectedProjectId); setData(r.data || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ contract_number: '', contract_type: 'main', party_a: '', party_b: '', value: '', duration_months: '', retention_percent: '5', status: 'draft', sign_date: '', advance_payment_percent: '0' });
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    setForm({
      contract_number: row.contract_number || '',
      contract_type: row.contract_type || 'main',
      party_a: row.party_a || '',
      party_b: row.party_b || '',
      value: row.value?.toString() || '',
      duration_months: row.duration_months?.toString() || '',
      retention_percent: row.retention_percent?.toString() || '5',
      status: row.status || 'draft',
      sign_date: row.sign_date || '',
      advance_payment_percent: row.advance_payment_percent?.toString() || '0',
    });
    setFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = { ...formData, project_id: Number(selectedProjectId), value: Number(formData.value), duration_months: Number(formData.duration_months), retention_percent: Number(formData.retention_percent), advance_payment_percent: Number(formData.advance_payment_percent), sign_date: formData.sign_date || null };
      if (editItem) await engineeringApi.contracts.update(editItem.id, payload);
      else await engineeringApi.contracts.create(payload);
      setFormOpen(false);
      fetchData();
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    await engineeringApi.contracts.delete(id);
    fetchData();
  };

  const columns = [
    { field: 'contract_number', headerName: t('contractNumber'), width: 120 },
    { field: 'contract_type', headerName: t('contractType'), width: 100 },
    { field: 'party_a', headerName: t('partyA'), flex: 1, minWidth: 140 },
    { field: 'party_b', headerName: t('partyB'), flex: 1, minWidth: 140 },
    { field: 'value', headerName: t('contractValue'), type: 'number', width: 130, renderCell: (p) => <Typography variant="body2" fontWeight={600}>{formatNumber(p.value)}</Typography> },
    { field: 'duration_months', headerName: t('durationMonths'), width: 100 },
    { field: 'status', headerName: t('status'), width: 110 },
  ];

  const fields = [
    { name: 'contract_number', label: t('contractNumber'), type: 'text', required: true },
    { name: 'contract_type', label: t('contractType'), type: 'select', required: true, options: [{ value: 'main', label: t('main') }, { value: 'subcontract', label: t('subcontract') }] },
    { name: 'party_a', label: t('partyA'), type: 'text' },
    { name: 'party_b', label: t('partyB'), type: 'text' },
    { name: 'value', label: t('contractValue'), type: 'number' },
    { name: 'duration_months', label: t('durationMonths'), type: 'number' },
    { name: 'status', label: t('status'), type: 'select', options: [{ value: 'draft', label: t('draft') }, { value: 'active', label: t('active') }, { value: 'completed', label: t('completed') }, { value: 'terminated', label: t('terminated') }] },
    { name: 'sign_date', label: t('signDate'), type: 'date' },
    { name: 'retention_percent', label: t('retentionPercent'), type: 'number' },
    { name: 'advance_payment_percent', label: t('advancePaymentPercent'), type: 'number' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('contractsPage')}</Typography>
          {selectedProjectId && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>{t('create')}</Button>}
        </Stack>
        <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {!selectedProjectId ? <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} /> : loading ? <DataGridSkeleton /> : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            total={data.length}
            page={1}
            pageSize={20}
            paginationMode="client"
            search=""
            onSearchChange={() => {}}
            onAdd={openCreate}
            onEdit={openEdit}
            onDelete={handleDelete}
            service={{ delete: handleDelete }}
            entityName="contractsPage"
          />
        )}
        <FormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          fields={fields}
          initialValues={editItem}
          title={editItem ? `${t('edit')} ${t('contract')}` : `${t('create')} ${t('contract')}`}
          loading={formLoading}
        />
      </Box>
    </motion.div>
  );
}
