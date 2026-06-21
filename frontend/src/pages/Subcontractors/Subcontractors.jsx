import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, Card, TextField, Button, Stack, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import EmptyState from '../../components/EmptyState/EmptyState';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import { engineeringApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';

const chipStatus = (value) => {
  const colors = { active: '#34d399', suspended: '#fbbf24', terminated: '#fca5a5' };
  return <Chip label={value} size="small" sx={{ color: colors[value] || '#cbd5e1', border: `1px solid ${colors[value] || '#cbd5e1'}`, bgcolor: 'transparent', fontWeight: 500 }} />;
};

export default function Subcontractors() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ name: '', trade: '', contract_value: '', status: 'active' });

  useEffect(() => { engineeringApi.projects.list().then(r => setProjects(r.data || [])).catch(() => {}); }, []);

  const fetchData = async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); return; }
    setLoading(true);
    try { const r = await engineeringApi.subcontractors.listByProject(selectedProjectId); setData(r.data || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      await engineeringApi.subcontractors.create({
        project_id: Number(selectedProjectId),
        name: form.name,
        trade: form.trade || null,
        contract_value: Number(form.contract_value) || 0,
        status: form.status,
      });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); } finally { setFormLoading(false); }
  };

  const columns = [
    { field: 'name', headerName: t('name'), flex: 1, minWidth: 160 },
    { field: 'trade', headerName: t('trade'), width: 130 },
    { field: 'contract_value', headerName: t('contractValue'), type: 'number', width: 140, renderCell: (p) => <Typography variant="body2" fontWeight={600}>{formatNumber(p.value)}</Typography> },
    { field: 'status', headerName: t('status'), width: 110, renderCell: (p) => chipStatus(p.value) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('subcontractorsPage')}</Typography>
          {selectedProjectId && <Button variant="contained" startIcon={<Add />} onClick={() => { setForm({ name: '', trade: '', contract_value: '', status: 'active' }); setFormOpen(true); }}>{t('create')}</Button>}
        </Stack>
        <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {!selectedProjectId ? <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} /> : loading ? <DataGridSkeleton /> : (
          <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
            <DataGrid rows={data} columns={columns} autoHeight disableRowSelectionOnClick getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]} paginationModel={{ page: 0, pageSize: 20 }} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} localeText={i18n.language === 'ar' ? arSD : enUS} sx={{ border: 'none', '& .MuiDataGrid-cell': { color: '#e2e8f0' }, '& .MuiDataGrid-columnHeaders': { bgcolor: '#0f172a', color: '#94a3b8' } }} />
            {data.length === 0 && <EmptyState title={t('noData')} action onAction={() => setFormOpen(true)} actionLabel={t('create')} />}
          </Card>
        )}
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0' } }}>
          <DialogTitle>{t('create')} {t('subcontractorsPage')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label={t('name')} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required fullWidth />
              <TextField label={t('trade')} value={form.trade} onChange={(e) => setForm({...form, trade: e.target.value})} fullWidth />
              <TextField label={t('contractValue')} type="number" value={form.contract_value} onChange={(e) => setForm({...form, contract_value: e.target.value})} fullWidth />
              <TextField select label={t('status')} value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} fullWidth>
                <MenuItem value="active">{t('active')}</MenuItem>
                <MenuItem value="suspended">{t('suspended')}</MenuItem>
                <MenuItem value="terminated">منتهي</MenuItem>
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