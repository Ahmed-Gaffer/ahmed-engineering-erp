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
import { formatDate } from '../../utils/helpers';

export default function DailyReports() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ report_date: '', weather: '', manpower_count: '', equipment_count: '', work_description: '', issues: '' });

  useEffect(() => { engineeringApi.projects.list().then(r => setProjects(r.data || [])).catch(() => {}); }, []);

  const fetchData = async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); return; }
    setLoading(true);
    try { const r = await engineeringApi.dailyReports.listByProject(selectedProjectId); setData(r.data || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      await engineeringApi.dailyReports.create({
        project_id: Number(selectedProjectId),
        report_date: form.report_date,
        weather: form.weather || null,
        manpower_count: Number(form.manpower_count) || 0,
        equipment_count: Number(form.equipment_count) || 0,
        work_description: form.work_description || null,
        issues: form.issues || null,
      });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); } finally { setFormLoading(false); }
  };

  const columns = [
    { field: 'report_date', headerName: t('reportDate'), width: 120, renderCell: (p) => formatDate(p.value) },
    { field: 'weather', headerName: t('weather'), width: 100 },
    { field: 'manpower_count', headerName: t('manpowerCount'), width: 120, type: 'number' },
    { field: 'equipment_count', headerName: t('equipmentCount'), width: 120, type: 'number' },
    { field: 'work_description', headerName: t('workDescription'), flex: 1, minWidth: 200 },
    { field: 'issues', headerName: t('issues'), flex: 0.7, minWidth: 140 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('dailyReportsPage')}</Typography>
          {selectedProjectId && <Button variant="contained" startIcon={<Add />} onClick={() => { setForm({ report_date: '', weather: '', manpower_count: '', equipment_count: '', work_description: '', issues: '' }); setFormOpen(true); }}>{t('create')}</Button>}
        </Stack>
        <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {!selectedProjectId ? <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} /> : loading ? <DataGridSkeleton /> : (
        <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
          <DataGrid rows={data} columns={columns} autoHeight disableRowSelectionOnClick getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]} paginationModel={{ page: 0, pageSize: 20 }} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} localeText={i18n.language === 'ar' ? arSD : enUS} sx={{ border: 'none', '& .MuiDataGrid-cell': { color: '#e2e8f0' }, '& .MuiDataGrid-columnHeaders': { bgcolor: '#0f172a', color: '#94a3b8' } }} />
          {data.length === 0 && <EmptyState title={t('noData')} action onAction={handleAdd} actionLabel={t('create')} />}
        </Card>
        )}
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0' } }}>
          <DialogTitle>{t('create')} {t('dailyReportsPage')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label={t('reportDate')} type="date" value={form.report_date} onChange={(e) => setForm({...form, report_date: e.target.value})} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label={t('weather')} value={form.weather} onChange={(e) => setForm({...form, weather: e.target.value})} fullWidth />
              <TextField label={t('manpowerCount')} type="number" value={form.manpower_count} onChange={(e) => setForm({...form, manpower_count: e.target.value})} fullWidth />
              <TextField label={t('equipmentCount')} type="number" value={form.equipment_count} onChange={(e) => setForm({...form, equipment_count: e.target.value})} fullWidth />
              <TextField label={t('workDescription')} multiline rows={3} value={form.work_description} onChange={(e) => setForm({...form, work_description: e.target.value})} fullWidth />
              <TextField label={t('issues')} multiline rows={2} value={form.issues} onChange={(e) => setForm({...form, issues: e.target.value})} fullWidth />
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