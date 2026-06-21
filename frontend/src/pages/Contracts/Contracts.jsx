import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, Card, TextField, Button, Stack, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit } from '@mui/icons-material';
import { motion } from 'framer-motion';
import EmptyState from '../../components/EmptyState/EmptyState';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import { engineeringApi } from '../../services/api';
import { formatNumber, formatDate } from '../../utils/helpers';

const chipStatus = (value) => {
  const colors = { active: '#34d399', draft: '#cbd5e1', completed: '#60a5fa', terminated: '#fca5a5' };
  return <Chip label={value} size="small" sx={{ color: colors[value] || '#cbd5e1', border: `1px solid ${colors[value] || '#cbd5e1'}`, bgcolor: 'transparent', fontWeight: 500 }} />;
};

export default function Contracts() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
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

  const openCreate = () => { setEditItem(null); setForm({ contract_number: '', contract_type: 'main', party_a: '', party_b: '', value: '', duration_months: '', retention_percent: '5', status: 'draft', sign_date: '', advance_payment_percent: '0' }); setFormOpen(true); };

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

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      const payload = { ...form, project_id: Number(selectedProjectId), value: Number(form.value), duration_months: Number(form.duration_months), retention_percent: Number(form.retention_percent), advance_payment_percent: Number(form.advance_payment_percent), sign_date: form.sign_date || null };
      if (editItem) await engineeringApi.contracts.update(editItem.id, payload);
      else await engineeringApi.contracts.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); } finally { setFormLoading(false); }
  };

  const columns = [
    { field: 'contract_number', headerName: t('contractNumber'), width: 120 },
    { field: 'contract_type', headerName: t('contractType'), width: 100 },
    { field: 'party_a', headerName: t('partyA'), flex: 1, minWidth: 140 },
    { field: 'party_b', headerName: t('partyB'), flex: 1, minWidth: 140 },
    { field: 'value', headerName: t('contractValue'), type: 'number', width: 130, renderCell: (p) => <Typography variant="body2" fontWeight={600}>{formatNumber(p.value)}</Typography> },
    { field: 'duration_months', headerName: t('durationMonths'), width: 100 },
    { field: 'status', headerName: t('status'), width: 110, renderCell: (p) => chipStatus(p.value) },
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
          <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
            <DataGrid rows={data} columns={columns} autoHeight disableRowSelectionOnClick getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ border: 'none', '& .MuiDataGrid-cell': { color: '#e2e8f0' }, '& .MuiDataGrid-columnHeaders': { bgcolor: '#0f172a', color: '#94a3b8' } }} />
            {data.length === 0 && <EmptyState title={t('noData')} action onAction={openCreate} actionLabel={t('create')} />}
          </Card>
        )}
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0' } }}>
          <DialogTitle>{editItem ? `${t('edit')} ${t('contract')}` : `${t('create')} ${t('contract')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label={t('contractNumber')} value={form.contract_number} onChange={(e) => setForm({...form, contract_number: e.target.value})} required fullWidth />
              <TextField select label={t('contractType')} value={form.contract_type} onChange={(e) => setForm({...form, contract_type: e.target.value})} fullWidth>
                <MenuItem value="main">{t('main')}</MenuItem>
                <MenuItem value="subcontract">{t('subcontract')}</MenuItem>
              </TextField>
              <TextField label={t('partyA')} value={form.party_a} onChange={(e) => setForm({...form, party_a: e.target.value})} fullWidth />
              <TextField label={t('partyB')} value={form.party_b} onChange={(e) => setForm({...form, party_b: e.target.value})} fullWidth />
              <TextField label={t('contractValue')} type="number" value={form.value} onChange={(e) => setForm({...form, value: e.target.value})} fullWidth />
              <TextField label={t('durationMonths')} type="number" value={form.duration_months} onChange={(e) => setForm({...form, duration_months: e.target.value})} fullWidth />
              <TextField select label={t('status')} value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} fullWidth>
                <MenuItem value="draft">{t('draft')}</MenuItem>
                <MenuItem value="active">{t('active')}</MenuItem>
                <MenuItem value="completed">{t('completed')}</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={formLoading}>{t('save')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}