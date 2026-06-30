import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Card, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, Send, CheckCircle, Cancel, Close, Refresh, Assignment, Warning, History, PlayArrow, Done, Verified, Undo } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import LoadingButton from '@mui/lab/LoadingButton';
import { engineeringApi, projectsService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  open: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  in_progress: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  completed: { bg: 'rgba(15,23,42,0.2)', color: '#D97706' },
  verified: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
  accepted: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const categories = ['architectural', 'structural', 'mechanical', 'electrical', 'finishing', 'general'];
const severityOptions = ['low', 'medium', 'high', 'critical'];
const severityColors = {
  low: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  medium: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  high: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  critical: { bg: 'rgba(220,38,38,0.25)', color: '#dc2626' },
};

export default function PunchList() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project_id') || '');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [completeDialog, setCompleteDialog] = useState({ open: false, id: null });
  const [completionNotes, setCompletionNotes] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    projectsService.list({ limit: 100 }).then((r) => {
      const items = r.data.items || [];
      setProjects(items);
      const urlPid = searchParams.get('project_id');
      if (urlPid && items.some((p) => p.id === Number(urlPid))) {
        setSelectedProjectId(Number(urlPid));
      } else if (items.length && !selectedProjectId) {
        setSelectedProjectId(items[0].id);
      }
    });
  }, []);

  const fetchData = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const r = await engineeringApi.punchList.listByProject(selectedProjectId);
      setData(r.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editItem) await engineeringApi.punchList.update(editItem.id, formData);
      else await engineeringApi.punchList.create({ ...formData, project_id: parseInt(selectedProjectId) });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.punchList.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'start') await engineeringApi.punchList.start(id, {});
      else if (action === 'verify') await engineeringApi.punchList.verify(id, {});
      else if (action === 'accept') await engineeringApi.punchList.accept(id, {});
      else if (action === 'reopen') await engineeringApi.punchList.reopen(id, {});
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleComplete = async () => {
    try {
      await engineeringApi.punchList.complete(completeDialog.id, { completion_notes: completionNotes });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setCompleteDialog({ open: false, id: null });
      setCompletionNotes('');
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'item_number', headerName: t('itemNumber'), width: 110 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'category', headerName: t('category'), width: 110 },
    { field: 'severity', headerName: t('severity'), width: 90,
      renderCell: (params) => {
        const sc = severityColors[params.value] || severityColors.low;
        const label = t(`severity_${params.value}`, params.value);
        return <Chip label={label} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'status', headerName: t('status'), width: 120,
      renderCell: (params) => {
        const sc = statusColors[params.value] || statusColors.open;
        const label = t(`punchStatus_${params.value}`, params.value);
        return <Chip label={label} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'assigned_to', headerName: t('assignedTo'), width: 130 },
    { field: 'target_date', headerName: t('targetDate'), width: 110, type: 'date' },
    { field: 'actions', headerName: t('actions'), width: 300, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'open' && (
            <>
              <Tooltip title={t('startWork')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'start')} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' }}>
                  <PlayArrow fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: '#D97706', bgcolor: 'rgba(217,119,6,0.08)' }}>
                <Edit fontSize="small" />
              </IconButton>
            </>
          )}
          {params.row.status === 'in_progress' && (
            <Tooltip title={t('complete')}>
              <IconButton size="small" onClick={() => setCompleteDialog({ open: true, id: params.row.id })} sx={{ color: '#D97706', bgcolor: 'rgba(217,119,6,0.08)' }}>
                <Done fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'completed' && (
            <Tooltip title={t('verify')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'verify')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                <Verified fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'verified' && (
            <>
              <Tooltip title={t('accept')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'accept')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('reopen')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'reopen')} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
                  <Undo fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {isAdmin && !['accepted', 'verified'].includes(params.row.status) && (
            <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'item_number', label: t('itemNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'category', label: t('category'), required: true, options: categories.map(m => ({ value: m, label: t(`category_${m}`, m) })) },
    { name: 'severity', label: t('severity'), options: severityOptions.map(p => ({ value: p, label: t(`severity_${p}`, p) })) },
    { name: 'description', label: t('description'), type: 'textarea' },
    { name: 'assigned_to', label: t('assignedTo') },
    { name: 'target_date', label: t('targetDate'), type: 'date' },
    { name: 'location', label: t('location') },
    { name: 'remarks', label: t('remarks'), type: 'textarea' },
  ];

  if (!selectedProjectId) return <DataGridSkeleton />;

  const totalCount = data.length;
  const openCount = data.filter(r => r.status === 'open').length;
  const completedCount = data.filter(r => r.status === 'completed').length;
  const verifiedCount = data.filter(r => r.status === 'verified').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('punchList')}
        subtitle="Manage punch list items with start, complete, verify, accept, and reopen workflow"
        icon={<Warning />}
        action={!!selectedProjectId}
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Total', value: totalCount },
          { label: 'Open', value: openCount },
          { label: 'Completed', value: completedCount },
          { label: 'Verified', value: verifiedCount },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
        </TextField>
      </Stack>

      <Card>
        {loading ? <DataGridSkeleton /> : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={data} columns={columns} getRowId={(r) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); const data = {}; fields.forEach(f => { data[f.name] = fd.get(f.name); }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} Punch List Item` : `${t('create')} Punch List Item`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={f.label} defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    {f.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                ) : (
                  <TextField key={f.name} name={f.name} label={f.label} type={f.type === 'date' ? 'date' : 'text'}
                    defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth
                    multiline={f.type === 'textarea'} minRows={f.type === 'textarea' ? 3 : undefined}
                    slotProps={f.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
                  />
                )
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <LoadingButton type="submit" variant="contained" loading={formLoading}>{t('save')}</LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>{t('cancel')}</Button>
          <Button color="error" variant="contained" onClick={() => handleDelete(deleteId)}>{t('delete')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={completeDialog.open} onClose={() => setCompleteDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('complete')} Punch List Item</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t('completionNotes')} fullWidth multiline minRows={3}
            value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} size="small" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialog({ open: false, id: null })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleComplete}>{t('complete')}</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
