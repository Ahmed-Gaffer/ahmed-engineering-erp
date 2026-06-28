import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Card, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, Send, CheckCircle, Cancel, Close, Refresh, Assignment, Warning, History } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import LoadingButton from '@mui/lab/LoadingButton';
import { engineeringApi, projectsService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  submitted: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  under_review: { bg: 'rgba(99,102,241,0.2)', color: '#818cf8' },
  approved: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
  rejected_with_comments: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  resubmitted: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  closed: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const submittalTypes = ['material_approval', 'shop_drawing', 'technical_submittal', 'product_data', 'sample', 'other'];
const priorityOptions = ['low', 'medium', 'high', 'urgent'];

export default function Submittals() {
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
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');

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
      const r = await engineeringApi.submittals.listByProject(selectedProjectId);
      setData(r.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editItem) await engineeringApi.submittals.update(editItem.id, formData);
      else await engineeringApi.submittals.create({ ...formData, project_id: parseInt(selectedProjectId) });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.submittals.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'submit') await engineeringApi.submittals.submit(id, {});
      else if (action === 'approve') await engineeringApi.submittals.approve(id, {});
      else if (action === 'resubmit') await engineeringApi.submittals.resubmit(id, {});
      else if (action === 'close') await engineeringApi.submittals.close(id, {});
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleReject = async () => {
    try {
      await engineeringApi.submittals.reject(rejectDialog.id, { rejection_reason: rejectReason });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setRejectDialog({ open: false, id: null });
      setRejectReason('');
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'submittal_number', headerName: t('submittalNumber'), width: 110 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'submittal_type', headerName: t('submittalType'), width: 140 },
    { field: 'status', headerName: t('status'), width: 130,
      renderCell: (params) => {
        const sc = statusColors[params.value] || statusColors.draft;
        const label = t(`submittalStatus_${params.value}`, params.value);
        return <Chip label={label} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'priority', headerName: t('priority'), width: 90,
      renderCell: (params) => {
        const pc = { low: { color: '#94a3b8' }, medium: { color: '#f59e0b' }, high: { color: '#ef4444' }, urgent: { color: '#dc2626' } };
        const c = pc[params.value] || pc.low;
        return <Chip label={t(`priority_${params.value}`, params.value)} size="small" sx={{ color: c.color, fontWeight: 500 }} variant="outlined" />;
      },
    },
    { field: 'submitted_date', headerName: t('submittedDate'), width: 110, type: 'date' },
    { field: 'required_date', headerName: t('requiredDate'), width: 110, type: 'date' },
    { field: 'actions', headerName: t('actions'), width: 280, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'draft' && (
            <>
              <Tooltip title={t('submit')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'submit')} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' }}>
                  <Send fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)' }}>
                <Edit fontSize="small" />
              </IconButton>
            </>
          )}
          {params.row.status === 'submitted' && (
            <>
              <Tooltip title={t('approve')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'approve')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('reject')}>
                <IconButton size="small" onClick={() => setRejectDialog({ open: true, id: params.row.id })} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.status === 'under_review' && (
            <>
              <Tooltip title={t('approve')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'approve')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('reject')}>
                <IconButton size="small" onClick={() => setRejectDialog({ open: true, id: params.row.id })} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.status === 'rejected_with_comments' && (
            <Tooltip title={t('resubmit')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'resubmit')} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'approved' && (
            <Tooltip title={t('close')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'close')} sx={{ color: '#94a3b8', bgcolor: 'rgba(148,163,184,0.08)' }}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {isAdmin && !['approved', 'rejected_with_comments', 'closed'].includes(params.row.status) && (
            <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'submittal_number', label: t('submittalNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'submittal_type', label: t('submittalType'), required: true, options: submittalTypes.map(m => ({ value: m, label: t(`submittalType_${m}`, m) })) },
    { name: 'priority', label: t('priority'), options: priorityOptions.map(p => ({ value: p, label: t(`priority_${p}`, p) })) },
    { name: 'description', label: t('description'), type: 'textarea' },
    { name: 'submitted_date', label: t('submittedDate'), type: 'date' },
    { name: 'required_date', label: t('requiredDate'), type: 'date' },
    { name: 'specification_ref', label: t('specificationRef') },
    { name: 'location', label: t('location') },
    { name: 'remarks', label: t('remarks'), type: 'textarea' },
  ];

  if (!selectedProjectId) return <DataGridSkeleton />;

  const totalCount = data.length;
  const pendingCount = data.filter(r => ['submitted', 'under_review'].includes(r.status)).length;
  const approvedCount = data.filter(r => r.status === 'approved').length;
  const rejectedCount = data.filter(r => r.status === 'rejected_with_comments').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('submittals')}
        subtitle="Manage submittals with submission, review, approval, and resubmission workflow"
        icon={<Assignment />}
        action={!!selectedProjectId}
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Total', value: totalCount },
          { label: 'Pending', value: pendingCount },
          { label: 'Approved', value: approvedCount },
          { label: 'Rejected', value: rejectedCount },
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
          <DialogTitle>{editItem ? `${t('edit')} Submittal` : `${t('create')} Submittal`}</DialogTitle>
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

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null })}>
        <DialogTitle>{t('reject')} Submittal</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t('rejectionReason')} fullWidth multiline minRows={3}
            value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} size="small" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, id: null })}>{t('cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleReject}>{t('reject')}</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
