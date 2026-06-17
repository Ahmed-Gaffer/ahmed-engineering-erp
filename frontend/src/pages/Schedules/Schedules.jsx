import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, Card, TextField, Button, Stack, MenuItem, Chip, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit } from '@mui/icons-material';
import { motion } from 'framer-motion';
import EmptyState from '../../components/EmptyState/EmptyState';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import { engineeringApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';

const chipStatus = (value) => {
  const colors = { not_started: '#cbd5e1', in_progress: '#fbbf24', completed: '#34d399', delayed: '#fca5a5' };
  return <Chip label={value} size="small" sx={{ color: colors[value] || '#cbd5e1', border: `1px solid ${colors[value] || '#cbd5e1'}`, bgcolor: 'transparent', fontWeight: 500 }} />;
};

export default function Schedules() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressItem, setProgressItem] = useState(null);
  const [progressVal, setProgressVal] = useState('');
  const [form, setForm] = useState({ task_name: '', start_date: '', end_date: '', duration_days: '', progress_percent: '0', status: 'not_started', responsible: '' });

  useEffect(() => { engineeringApi.projects.list().then(r => setProjects(r.data || [])).catch(() => {}); }, []);

  const fetchData = async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); return; }
    setLoading(true);
    try { const r = await engineeringApi.schedules.listByProject(selectedProjectId); setData(r.data || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      await engineeringApi.schedules.create({
        project_id: Number(selectedProjectId),
        task_name: form.task_name,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        duration_days: Number(form.duration_days) || 0,
        progress_percent: Number(form.progress_percent) || 0,
        status: form.status,
        responsible: form.responsible || null,
      });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); } finally { setFormLoading(false); }
  };

  const handleUpdateProgress = async () => {
    if (!progressItem) return;
    try {
      await engineeringApi.schedules.updateProgress(progressItem.id, Number(progressVal));
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setProgressOpen(false);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'task_name', headerName: t('taskName'), flex: 1, minWidth: 180 },
    { field: 'start_date', headerName: t('startDate'), width: 110, renderCell: (p) => formatDate(p.value) },
    { field: 'end_date', headerName: t('endDatePlanned'), width: 110, renderCell: (p) => formatDate(p.value) },
    { field: 'duration_days', headerName: t('durationDays'), width: 100, type: 'number' },
    {
      field: 'progress_percent', headerName: t('progressPercent'), width: 140,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%', py: 1 }}>
          <Box sx={{ flex: 1 }}><LinearProgress variant="determinate" value={Number(p.value)} sx={{ height: 6, borderRadius: 3, bgcolor: '#334155', '& .MuiLinearProgress-bar': { bgcolor: Number(p.value) >= 100 ? '#34d399' : Number(p.value) > 0 ? '#60a5fa' : '#64748b' } }} /></Box>
          <Typography variant="caption" fontWeight={600} sx={{ minWidth: 35 }}>{Number(p.value).toFixed(0)}%</Typography>
          <IconButton size="small" onClick={() => { setProgressItem(p.row); setProgressVal(p.value?.toString() || '0'); setProgressOpen(true); }} sx={{ color: '#94a3b8' }}><Edit fontSize="small" /></IconButton>
        </Stack>
      ),
    },
    { field: 'status', headerName: t('status'), width: 110, renderCell: (p) => chipStatus(p.value) },
    { field: 'responsible', headerName: t('responsible'), width: 130 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('schedulesPage')}</Typography>
          {selectedProjectId && <Button variant="contained" startIcon={<Add />} onClick={() => { setForm({ task_name: '', start_date: '', end_date: '', duration_days: '', progress_percent: '0', status: 'not_started', responsible: '' }); setFormOpen(true); }}>{t('create')}</Button>}
        </Stack>
        <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {!selectedProjectId ? <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} /> : loading ? <DataGridSkeleton /> : (
          <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
            <DataGrid rows={data} columns={columns} autoHeight disableRowSelectionOnClick getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ border: 'none', '& .MuiDataGrid-cell': { color: '#e2e8f0' }, '& .MuiDataGrid-columnHeaders': { bgcolor: '#0f172a', color: '#94a3b8' } }} />
            {data.length === 0 && <EmptyState title={t('noData')} action onAction={() => setFormOpen(true)} actionLabel={t('create')} />}
          </Card>
        )}
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0' } }}>
          <DialogTitle>{t('create')} {t('schedulesPage')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label={t('taskName')} value={form.task_name} onChange={(e) => setForm({...form, task_name: e.target.value})} required fullWidth />
              <TextField label={t('startDate')} type="date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label={t('endDatePlanned')} type="date" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label={t('durationDays')} type="number" value={form.duration_days} onChange={(e) => setForm({...form, duration_days: e.target.value})} fullWidth />
              <TextField select label={t('status')} value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} fullWidth>
                <MenuItem value="not_started">{t('notStarted')}</MenuItem>
                <MenuItem value="in_progress">{t('inProgress')}</MenuItem>
                <MenuItem value="completed">{t('completed')}</MenuItem>
              </TextField>
              <TextField label={t('responsible')} value={form.responsible} onChange={(e) => setForm({...form, responsible: e.target.value})} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={formLoading}>{t('save')}</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={progressOpen} onClose={() => setProgressOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0' } }}>
          <DialogTitle>{t('updateProgress')}</DialogTitle>
          <DialogContent>
            <TextField label={t('progressPercent')} type="number" value={progressVal} onChange={(e) => setProgressVal(e.target.value)} fullWidth sx={{ mt: 1 }} inputProps={{ min: 0, max: 100 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProgressOpen(false)}>{t('cancel')}</Button>
            <Button variant="contained" onClick={handleUpdateProgress}>{t('save')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}