import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Tooltip, CircularProgress,
  Checkbox, FormControlLabel, FormGroup,
} from '@mui/material';
import {
  Add, Delete, Edit, Refresh, CheckCircle, Cancel, Send, RateReview,
  ThumbUp, ThumbDown,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { engineeringApi } from '../../services/api';
import { formatDate, statusColors } from '../../utils/helpers';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import PageHeader from '../../components/PageHeader/PageHeader';

const itpStatusColors = {
  itpStatus_draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  itpStatus_submitted: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  itpStatus_review: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  itpStatus_approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  itpStatus_rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  itpStatus_archived: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const statusOptions = ['draft', 'submitted', 'review', 'approved', 'rejected', 'archived'];

export default function ITP() {
  const { t, i18n } = useTranslation();
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
  const [actionDialog, setActionDialog] = useState({ open: false, id: null, action: '' });
  const [actionData, setActionData] = useState({});
  const [itpItems, setItpItems] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    engineeringApi.projects.list().then((r) => {
      const items = r.data || [];
      setProjects(items);
      const urlPid = searchParams.get('project_id');
      if (urlPid && items.some((p) => p.id === Number(urlPid))) {
        setSelectedProjectId(Number(urlPid));
      } else if (items.length && !selectedProjectId) {
        setSelectedProjectId(items[0].id);
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        engineeringApi.itps.listByProject(selectedProjectId),
        engineeringApi.itps.stats(selectedProjectId),
      ]);
      setData(listRes.data || []);
      setStats(statsRes.data || null);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { if (selectedProjectId) fetchData(); }, [fetchData, selectedProjectId]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = { ...formData, project_id: Number(selectedProjectId) };
      if (editItem) await engineeringApi.itps.update(editItem.id, payload);
      else await engineeringApi.itps.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.itps.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleWorkflow = async () => {
    try {
      const { id, action } = actionDialog;
      if (action === 'submit') await engineeringApi.itps.submit(id);
      else if (action === 'review') {
        const payload = { approved_item_ids: actionData.approved_item_ids || [], comments: actionData.comments || '' };
        await engineeringApi.itps.review(id, payload);
      } else if (action === 'approve') await engineeringApi.itps.approve(id);
      else if (action === 'reject') await engineeringApi.itps.reject(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setActionDialog({ open: false, id: null, action: '' });
      setActionData({});
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const openActionDialog = (id, action) => {
    setActionDialog({ open: true, id, action });
    if (action === 'review') {
      engineeringApi.itps.get(id).then(r => {
        const items = r.data?.items || [];
        setItpItems(items);
        setActionData({ approved_item_ids: items.map(i => i.id), comments: '' });
      }).catch(() => setItpItems([]));
    } else {
      setActionData({});
    }
  };

  const handleToggleItem = (itemId) => {
    setActionData(prev => {
      const ids = prev.approved_item_ids || [];
      return {
        ...prev,
        approved_item_ids: ids.includes(itemId) ? ids.filter(i => i !== itemId) : [...ids, itemId],
      };
    });
  };

  const columns = [
    { field: 'itp_number', headerName: t('itpNumber'), width: 130 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'location', headerName: t('location'), width: 160 },
    {
      field: 'status', headerName: t('status'), width: 120,
      renderCell: (params) => {
        const sc = itpStatusColors[`itpStatus_${params.value}`] || itpStatusColors.itpStatus_draft;
        return <Chip label={t(`itpStatus_${params.value}`, params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'version', headerName: t('version'), width: 80 },
    { field: 'prepared_by', headerName: t('preparedBy'), width: 130 },
    {
      field: 'actions', headerName: t('actions'), width: 240, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'draft' && (
            <Tooltip title={t('submit')}>
              <IconButton size="small" onClick={() => openActionDialog(params.row.id, 'submit')} sx={{ color: '#3b82f6', bgcolor: 'rgba(59,130,246,0.08)' }}>
                <Send fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'submitted' && (
            <Tooltip title={t('review')}>
              <IconButton size="small" onClick={() => openActionDialog(params.row.id, 'review')} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.12)' }}>
                <RateReview fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'review' && (
            <>
              <Tooltip title={t('approve')}>
                <IconButton size="small" onClick={() => openActionDialog(params.row.id, 'approve')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                  <ThumbUp fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('reject')}>
                <IconButton size="small" onClick={() => openActionDialog(params.row.id, 'reject')} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
                  <ThumbDown fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.status === 'draft' && (
            <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: '#D97706', bgcolor: 'rgba(217,119,6,0.08)' }}>
              <Edit fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'itp_number', label: t('itpNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'description', label: t('description'), type: 'textarea' },
    { name: 'location', label: t('location') },
    { name: 'prepared_by', label: t('preparedBy') },
  ];

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('itp')} subtitle="Inspection Test Plan management" icon={<Assignment />} />
        <Stack direction="row" spacing={1.5} mb={2.5}>
          <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
            sx={{ minWidth: 240 }}>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
          </TextField>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('itp')}
        subtitle="Inspection Test Plan — ITP management"
        icon={<Assignment />}
        action actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: t('total'), value: stats?.total || 0 },
          { label: t('approved'), value: stats?.by_status?.approved || 0 },
          { label: t('rejected'), value: stats?.by_status?.rejected || 0 },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
        </TextField>
        <Button variant="outlined" startIcon={<Refresh />} size="small" onClick={fetchData}>{t('refresh')}</Button>
      </Stack>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={data} columns={columns} getRowId={(r) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); const data = {}; fields.forEach(f => { data[f.name] = fd.get(f.name); }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} ${t('itp')}` : `${t('create')} ${t('itp')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f) => (
                <TextField key={f.name} name={f.name} label={f.label}
                  defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth
                  multiline={f.type === 'textarea'} minRows={f.type === 'textarea' ? 3 : undefined}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="contained" disabled={formLoading}>{formLoading ? t('saving') : t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, id: null, action: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.action === 'submit' && t('submit')}
          {actionDialog.action === 'review' && t('review')}
          {actionDialog.action === 'approve' && t('approve')}
          {actionDialog.action === 'reject' && t('reject')}
          {' '}{t('itp')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {actionDialog.action === 'review' && (
              <>
                <Typography variant="subtitle2">{t('reviewItems')}</Typography>
                <FormGroup>
                  {itpItems.map((item) => (
                    <FormControlLabel key={item.id}
                      control={<Checkbox checked={(actionData.approved_item_ids || []).includes(item.id)} onChange={() => handleToggleItem(item.id)} size="small" />}
                      label={<Typography variant="body2">{item.item_number} — {item.description}</Typography>}
                    />
                  ))}
                </FormGroup>
                <TextField label={t('comments')} multiline minRows={2} size="small" fullWidth
                  value={actionData.comments || ''} onChange={(e) => setActionData(prev => ({ ...prev, comments: e.target.value }))} />
              </>
            )}
            {(actionDialog.action === 'approve' || actionDialog.action === 'reject') && (
              <Typography>{t('confirmWorkflowAction', { action: t(actionDialog.action) })}</Typography>
            )}
            {actionDialog.action === 'submit' && (
              <Typography>{t('confirmSubmit')}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, id: null, action: '' })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleWorkflow}>
            {actionDialog.action === 'submit' && t('submit')}
            {actionDialog.action === 'review' && t('review')}
            {actionDialog.action === 'approve' && t('approve')}
            {actionDialog.action === 'reject' && t('reject')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
    </motion.div>
  );
}
