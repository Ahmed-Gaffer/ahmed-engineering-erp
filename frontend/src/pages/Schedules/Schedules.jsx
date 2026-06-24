import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, TextField, Button, Stack, MenuItem, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable/DataTable';
import FormDialog from '../../components/FormDialog/FormDialog';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import EmptyState from '../../components/EmptyState/EmptyState';
import { engineeringApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';

export default function Schedules() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
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

  const openCreate = () => {
    setEditItem(null);
    setForm({ task_name: '', start_date: '', end_date: '', duration_days: '', progress_percent: '0', status: 'not_started', responsible: '' });
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    setForm({
      task_name: row.task_name || '',
      start_date: row.start_date || '',
      end_date: row.end_date || '',
      duration_days: row.duration_days?.toString() || '',
      progress_percent: row.progress_percent?.toString() || '0',
      status: row.status || 'not_started',
      responsible: row.responsible || '',
    });
    setFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = {
        project_id: Number(selectedProjectId),
        task_name: formData.task_name,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        duration_days: Number(formData.duration_days) || 0,
        progress_percent: Number(formData.progress_percent) || 0,
        status: formData.status,
        responsible: formData.responsible || null,
      };
      if (editItem) await engineeringApi.schedules.update(editItem.id, payload);
      else await engineeringApi.schedules.create(payload);
      setFormOpen(false);
      fetchData();
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    await engineeringApi.schedules.delete(id);
    fetchData();
  };

  const handleUpdateProgress = async () => {
    if (!progressItem) return;
    try {
      await engineeringApi.schedules.updateProgress(progressItem.id, Number(progressVal));
      setProgressOpen(false);
      fetchData();
    } catch {}
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
          <Box sx={{ flex: 1 }}><LinearProgress variant="determinate" value={Number(p.value)} sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: Number(p.value) >= 100 ? 'success.main' : Number(p.value) > 0 ? 'info.main' : 'text.disabled' } }} /></Box>
          <Typography variant="caption" fontWeight={600} sx={{ minWidth: 35 }}>{Number(p.value).toFixed(0)}%</Typography>
          <IconButton size="small" onClick={() => { setProgressItem(p.row); setProgressVal(p.value?.toString() || '0'); setProgressOpen(true); }}><Edit fontSize="small" /></IconButton>
        </Stack>
      ),
    },
    { field: 'status', headerName: t('status'), width: 110 },
    { field: 'responsible', headerName: t('responsible'), width: 130 },
  ];

  const fields = [
    { name: 'task_name', label: t('taskName'), type: 'text', required: true },
    { name: 'start_date', label: t('startDate'), type: 'date' },
    { name: 'end_date', label: t('endDatePlanned'), type: 'date' },
    { name: 'duration_days', label: t('durationDays'), type: 'number' },
    { name: 'status', label: t('status'), type: 'select', options: [{ value: 'not_started', label: t('notStarted') }, { value: 'in_progress', label: t('inProgress') }, { value: 'completed', label: t('completed') }, { value: 'delayed', label: t('delayed') }] },
    { name: 'responsible', label: t('responsible'), type: 'text' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('schedulesPage')}</Typography>
          {selectedProjectId && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>{t('create')}</Button>}
        </Stack>
        <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {!selectedProjectId ? <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} /> : loading ? <DataGridSkeleton /> : (
          <>
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
              entityName="schedulesPage"
            />
            <Dialog open={progressOpen} onClose={() => setProgressOpen(false)} maxWidth="xs" fullWidth>
              <DialogTitle>{t('updateProgress')}</DialogTitle>
              <DialogContent>
                <TextField label={t('progressPercent')} type="number" value={progressVal} onChange={(e) => setProgressVal(e.target.value)} fullWidth sx={{ mt: 1 }} inputProps={{ min: 0, max: 100 }} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setProgressOpen(false)}>{t('cancel')}</Button>
                <Button variant="contained" onClick={handleUpdateProgress}>{t('save')}</Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        <FormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          fields={fields}
          initialValues={editItem}
          title={editItem ? `${t('edit')} ${t('schedulesPage')}` : `${t('create')} ${t('schedulesPage')}`}
          loading={formLoading}
        />
      </Box>
    </motion.div>
  );
}