import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, TextField, Button, Stack, MenuItem, LinearProgress, Card,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip, Tooltip,
  Select, FormControl, InputLabel, FormControlLabel, Switch, ToggleButtonGroup, ToggleButton, useTheme,
} from '@mui/material';
import {
  Add, Edit, Delete, ViewTimeline, TableChart, AccountTree, AutoAwesome, CalendarMonth,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import DataTable from '../../components/DataTable/DataTable';
import GanttChart from '../../components/GanttChart/GanttChart';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import EmptyState from '../../components/EmptyState/EmptyState';
import { engineeringApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';

const STATUS_CHIP = (t) => ({
  not_started: <Chip label={t('notStarted')} size="small" sx={{ bgcolor: 'rgba(148,163,184,0.15)', color: '#94a3b8' }} />,
  in_progress: <Chip label={t('inProgress')} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.15)', color: '#60a5fa' }} />,
  completed: <Chip label={t('completed')} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#34d399' }} />,
  delayed: <Chip label={t('delayed')} size="small" sx={{ bgcolor: 'rgba(239,68,68,0.15)', color: '#fca5a5' }} />,
});

export default function Schedules() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
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
  const [viewMode, setViewMode] = useState('table');
  const [form, setForm] = useState({
    task_name: '', start_date: '', end_date: '', duration_days: '',
    progress_percent: '0', status: 'not_started', responsible: '',
    task_type: 'task', is_milestone: false, parent_id: '',
    dependencies: '', priority: 'medium', notes: '',
    baseline_start: '', baseline_end: '', actual_start: '', actual_end: '',
  });

  useEffect(() => { engineeringApi.projects.list().then(r => setProjects(r.data || [])).catch(() => {}); }, []);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); return; }
    setLoading(true);
    try {
      const r = await engineeringApi.schedules.listByProject(selectedProjectId);
      setData(r.data || []);
    } catch {} finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      task_name: '', start_date: '', end_date: '', duration_days: '',
      progress_percent: '0', status: 'not_started', responsible: '',
      task_type: 'task', is_milestone: false, parent_id: '',
      dependencies: '', priority: 'medium', notes: '',
      baseline_start: '', baseline_end: '', actual_start: '', actual_end: '',
    });
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
      task_type: row.task_type || 'task',
      is_milestone: row.is_milestone || false,
      parent_id: row.parent_id?.toString() || '',
      dependencies: row.dependencies || '',
      priority: row.priority || 'medium',
      notes: row.notes || '',
      baseline_start: row.baseline_start || '',
      baseline_end: row.baseline_end || '',
      actual_start: row.actual_start || '',
      actual_end: row.actual_end || '',
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
        task_type: formData.task_type || 'task',
        is_milestone: formData.is_milestone || false,
        parent_id: Number(formData.parent_id) || null,
        dependencies: formData.dependencies || null,
        priority: formData.priority || 'medium',
        notes: formData.notes || null,
        baseline_start: formData.baseline_start || null,
        baseline_end: formData.baseline_end || null,
        actual_start: formData.actual_start || null,
        actual_end: formData.actual_end || null,
      };
      if (editItem) await engineeringApi.schedules.update(editItem.id, payload);
      else await engineeringApi.schedules.create(payload);
      setFormOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); } finally { setFormLoading(false); }
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
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleCalculateCriticalPath = async () => {
    try {
      const r = await engineeringApi.schedules.calculateCriticalPath(selectedProjectId);
      enqueueSnackbar(t('criticalPathCount', { count: r.data.critical_count, total: r.data.total }), { variant: 'info' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'task_name', headerName: t('taskName'), flex: 1, minWidth: 200,
      renderCell: (p) => <Stack direction="row" spacing={1} alignItems="center">
        {p.row.is_milestone && <Chip label="M" size="small" sx={{ height: 18, fontSize: 10, bgcolor: '#f59e0b', color: 'white' }} />}
        {p.row.critical && <Chip label="Critical" size="small" sx={{ height: 18, fontSize: 10, bgcolor: '#ef4444', color: 'white' }} />}
        <Typography variant="body2" fontWeight={p.row.parent_id ? 400 : 600}>{p.value}</Typography>
      </Stack>,
    },
    { field: 'task_type', headerName: t('taskType'), width: 80,
      renderCell: (p) => { const v = p.value || 'task'; return <Typography variant="caption" color="text.secondary">{v.charAt(0).toUpperCase() + v.slice(1)}</Typography>; },
    },
    { field: 'start_date', headerName: t('startDate'), width: 110, renderCell: (p) => formatDate(p.value) },
    { field: 'end_date', headerName: t('endDatePlanned'), width: 110, renderCell: (p) => formatDate(p.value) },
    { field: 'duration_days', headerName: t('durationDays'), width: 80, type: 'number' },
    {
      field: 'progress_percent', headerName: t('progressPercent'), width: 160,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%', py: 1 }}>
          <Box sx={{ flex: 1 }}><LinearProgress variant="determinate" value={Number(p.value)} sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: Number(p.value) >= 100 ? 'success.main' : Number(p.value) > 0 ? 'info.main' : 'text.disabled' } }} /></Box>
          <Typography variant="caption" fontWeight={600} sx={{ minWidth: 35 }}>{Number(p.value).toFixed(0)}%</Typography>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setProgressItem(p.row); setProgressVal(p.value?.toString() || '0'); setProgressOpen(true); }}><Edit fontSize="small" /></IconButton>
        </Stack>
      ),
    },
    { field: 'status', headerName: t('status'), width: 120, renderCell: (p) => (STATUS_CHIP(t))[p.value] || STATUS_CHIP(t).not_started },
    { field: 'responsible', headerName: t('responsible'), width: 120 },
    { field: 'priority', headerName: t('priority'), width: 80,
      renderCell: (p) => {
        const colors = { low: '#94a3b8', medium: '#f59e0b', high: '#ef4444', urgent: '#dc2626' };
        const labels = { low: t('low'), medium: t('medium'), high: t('high'), urgent: t('urgent') };
        const val = p.value || 'medium';
        return <Chip label={labels[val] || val} size="small" sx={{ bgcolor: `${colors[val]}22`, color: colors[val] }} />;
      },
    },
  ];

  const fields = [
    { name: 'task_name', label: t('taskName'), type: 'text', required: true },
    { name: 'task_type', label: t('taskType'), type: 'select', options: [{ value: 'task', label: 'Task' }, { value: 'phase', label: 'Phase' }, { value: 'milestone', label: 'Milestone' }] },
    { name: 'start_date', label: t('startDate'), type: 'date' },
    { name: 'end_date', label: t('endDatePlanned'), type: 'date' },
    { name: 'duration_days', label: t('durationDays'), type: 'number' },
    { name: 'status', label: t('status'), type: 'select', options: [{ value: 'not_started', label: t('notStarted') }, { value: 'in_progress', label: t('inProgress') }, { value: 'completed', label: t('completed') }, { value: 'delayed', label: t('delayed') }] },
    { name: 'progress_percent', label: t('progressPercent'), type: 'number' },
    { name: 'priority', label: t('priority'), type: 'select', options: [{ value: 'low', label: t('low') }, { value: 'medium', label: t('medium') }, { value: 'high', label: t('high') }, { value: 'urgent', label: t('urgent') }] },
    { name: 'responsible', label: t('responsible'), type: 'text' },
    { name: 'parent_id', label: t('parentId'), type: 'number', help: 'Leave empty for top-level task' },
    { name: 'dependencies', label: t('dependencies'), type: 'text' },
    { name: 'baseline_start', label: t('baselineStart'), type: 'date' },
    { name: 'baseline_end', label: t('baselineEnd'), type: 'date' },
    { name: 'actual_start', label: t('actualStart'), type: 'date' },
    { name: 'actual_end', label: t('actualEnd'), 'type': 'date' },
    { name: 'notes', label: t('notes'), type: 'text', multiline: true, rows: 2 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <PageHeader
          title={t('schedulesPage')}
          subtitle="Manage project schedules with Gantt chart, progress tracking, and critical path analysis"
          icon={<CalendarMonth />}
          accentColor={theme.palette.secondary.main}
          stats={[
            { label: 'Tasks', value: data.length },
            { label: 'Completed', value: data.filter(t => t.status === 'completed').length },
            { label: 'Delayed', value: data.filter(t => t.status === 'delayed').length },
          ]}
        />
        {selectedProjectId && (
          <Stack direction="row" spacing={1} mb={2.5} alignItems="center">
            <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ minWidth: 240 }}>
              <MenuItem value="">{t('all')}</MenuItem>
              {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
              <ToggleButton value="table"><TableChart fontSize="small" /></ToggleButton>
              <ToggleButton value="gantt"><ViewTimeline fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" size="small" startIcon={<AutoAwesome />} onClick={handleCalculateCriticalPath}>{t('criticalPath')}</Button>
            <Button variant="contained" size="small" startIcon={<Add />} onClick={openCreate}>{t('create')}</Button>
          </Stack>
        )}
        {!selectedProjectId && (
          <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
            <MenuItem value="">{t('all')}</MenuItem>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </TextField>
        )}

        {!selectedProjectId ? (
          <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} />
        ) : loading ? (
          <DataGridSkeleton />
        ) : viewMode === 'table' ? (
          <Card>
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              total={data.length}
              page={1}
              pageSize={50}
              paginationMode="client"
              search=""
              onSearchChange={() => {}}
              onAdd={openCreate}
              onEdit={openEdit}
              onDelete={handleDelete}
              service={{ delete: handleDelete }}
              entityName="schedulesPage"
              accentColor={theme.palette.secondary.main}
            />
          </Card>
        ) : (
          <GanttChart tasks={data} onTaskClick={(task) => openEdit(task)} />
        )}

        <Dialog open={progressOpen} onClose={() => setProgressOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>{t('updateProgress')}</DialogTitle>
          <DialogContent>
            <TextField label={t('progressPercent')} type="number" value={progressVal} onChange={(e) => setProgressVal(e.target.value)} fullWidth sx={{ mt: 1 }} inputProps={{ min: 0, max: 100 }} />
            {progressItem && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{progressItem.task_name}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProgressOpen(false)}>{t('cancel')}</Button>
            <Button variant="contained" onClick={handleUpdateProgress}>{t('save')}</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editItem ? `${t('edit')} ${t('schedulesPage')}` : `${t('create')} ${t('schedulesPage')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label={t('taskName')} required fullWidth size="small" value={form.task_name} onChange={(e) => setForm(f => ({ ...f, task_name: e.target.value }))} />
              <Stack direction="row" spacing={2}>
                <TextField select label={t('taskType')} size="small" fullWidth value={form.task_type} onChange={(e) => setForm(f => ({ ...f, task_type: e.target.value }))}>
                  <MenuItem value="task">Task</MenuItem>
                  <MenuItem value="phase">Phase</MenuItem>
                  <MenuItem value="milestone">{t('milestone')}</MenuItem>
                </TextField>
                <FormControlLabel control={<Switch checked={form.is_milestone} onChange={(e) => setForm(f => ({ ...f, is_milestone: e.target.checked }))} />} label={t('milestone')} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label={t('startDate')} type="date" size="small" fullWidth value={form.start_date} onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label={t('endDatePlanned')} type="date" size="small" fullWidth value={form.end_date} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label={t('durationDays')} type="number" size="small" fullWidth value={form.duration_days} onChange={(e) => setForm(f => ({ ...f, duration_days: e.target.value }))} />
                <TextField label={t('progressPercent')} type="number" size="small" fullWidth value={form.progress_percent} onChange={(e) => setForm(f => ({ ...f, progress_percent: e.target.value }))} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField select label={t('status')} size="small" fullWidth value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                  <MenuItem value="not_started">{t('notStarted')}</MenuItem>
                  <MenuItem value="in_progress">{t('inProgress')}</MenuItem>
                  <MenuItem value="completed">{t('completed')}</MenuItem>
                  <MenuItem value="delayed">{t('delayed')}</MenuItem>
                </TextField>
                <TextField select label={t('priority')} size="small" fullWidth value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <MenuItem value="low">{t('low')}</MenuItem>
                  <MenuItem value="medium">{t('medium')}</MenuItem>
                  <MenuItem value="high">{t('high')}</MenuItem>
                  <MenuItem value="urgent">{t('urgent')}</MenuItem>
                </TextField>
              </Stack>
              <TextField label={t('responsible')} size="small" fullWidth value={form.responsible} onChange={(e) => setForm(f => ({ ...f, responsible: e.target.value }))} />
              <Stack direction="row" spacing={2}>
                <TextField label={t('parentId')} type="number" size="small" fullWidth value={form.parent_id} onChange={(e) => setForm(f => ({ ...f, parent_id: e.target.value }))} helperText="Leave empty for top-level" />
                <TextField label={t('dependencies')} size="small" fullWidth value={form.dependencies} onChange={(e) => setForm(f => ({ ...f, dependencies: e.target.value }))} helperText="e.g. 1,3,5" />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label={t('baselineStart')} type="date" size="small" fullWidth value={form.baseline_start} onChange={(e) => setForm(f => ({ ...f, baseline_start: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label={t('baselineEnd')} type="date" size="small" fullWidth value={form.baseline_end} onChange={(e) => setForm(f => ({ ...f, baseline_end: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label={t('actualStart')} type="date" size="small" fullWidth value={form.actual_start} onChange={(e) => setForm(f => ({ ...f, actual_start: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label={t('actualEnd')} type="date" size="small" fullWidth value={form.actual_end} onChange={(e) => setForm(f => ({ ...f, actual_end: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              </Stack>
              <TextField label={t('notes')} multiline rows={2} size="small" fullWidth value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)} disabled={formLoading}>{t('cancel')}</Button>
            <Button onClick={() => handleSubmit(form)} variant="contained" disableElevation disabled={formLoading}>{formLoading ? t('loading') : t('save')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}
