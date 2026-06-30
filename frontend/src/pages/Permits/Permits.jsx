import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Tooltip, CircularProgress, Grid,
} from '@mui/material';
import {
  Add, Delete, Edit, Refresh, CheckCircle, Cancel, Assignment, Close, Block, HowToReg, Send, PlayArrow, DoneAll,
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

const permitTypeColors = {
  hot_work: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  excavation: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  height: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  confined_space: { bg: 'rgba(139,92,246,0.15)', color: '#D97706' },
  electrical: { bg: 'rgba(245,158,11,0.2)', color: '#eab308' },
  lifting: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  other: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const permitTypes = ['hot_work', 'excavation', 'height', 'confined_space', 'electrical', 'lifting', 'other'];

export default function Permits() {
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
        engineeringApi.permits.listByProject(selectedProjectId),
        engineeringApi.permits.stats(selectedProjectId),
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
      if (editItem) await engineeringApi.permits.update(editItem.id, payload);
      else await engineeringApi.permits.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.permits.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleWorkflow = async () => {
    try {
      const { id, action } = actionDialog;
      if (action === 'reject') await engineeringApi.permits.reject(id, actionData);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setActionDialog({ open: false, id: null, action: '' });
      setActionData({});
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleAction = async (id, action) => {
    try {
      const actionMap = {
        submit: engineeringApi.permits.submit,
        approve: engineeringApi.permits.approve,
        issue: engineeringApi.permits.issue,
        activate: engineeringApi.permits.activate,
        complete: engineeringApi.permits.complete,
        cancel: engineeringApi.permits.cancel,
        reject: engineeringApi.permits.reject,
      };
      if (action === 'reject') {
        setActionDialog({ open: true, id, action: 'reject' });
        setActionData({ reason: '' });
        return;
      }
      await actionMap[action](id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'permit_number', headerName: t('permitNumber'), width: 130 },
    { field: 'permit_type', headerName: t('permitType'), width: 140,
      renderCell: (params) => {
        const tc = permitTypeColors[params.value] || permitTypeColors.other;
        return <Chip label={t(params.value)} size="small" sx={{ backgroundColor: tc.bg, color: tc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'location', headerName: t('location'), width: 130 },
    { field: 'requested_by', headerName: t('requestedBy'), width: 120 },
    { field: 'requested_date', headerName: t('requestedDate'), width: 110, renderCell: (params) => params.value ? formatDate(params.value) : '' },
    { field: 'valid_from', headerName: t('validFrom'), width: 110, renderCell: (params) => params.value ? formatDate(params.value) : '' },
    { field: 'valid_to', headerName: t('validTo'), width: 110, renderCell: (params) => params.value ? formatDate(params.value) : '' },
    { field: 'status', headerName: t('status'), width: 120,
      renderCell: (params) => {
        const sc = statusColors[`permitStatus_${params.value}`] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
        return <Chip label={t(`permitStatus_${params.value}`, params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'actions', headerName: t('actions'), width: 280, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'requested' && (
            <>
              <Tooltip title={t('approve')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'approve')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                  <HowToReg fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('reject')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'reject')} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
                  <Block fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.status === 'approved' && (
            <Tooltip title={t('issue')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'issue')} sx={{ color: '#D97706', bgcolor: 'rgba(139,92,246,0.08)' }}>
                <Send fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'issued' && (
            <Tooltip title={t('activate')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'activate')} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.15)' }}>
                <PlayArrow fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'activated' && (
            <Tooltip title={t('complete')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'complete')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                <DoneAll fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!['completed', 'cancelled', 'rejected'].includes(params.row.status) && (
            <Tooltip title={t('cancel')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'cancel')} sx={{ color: '#94a3b8', bgcolor: 'rgba(148,163,184,0.15)' }}>
                <Cancel fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'requested' && (
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
    { name: 'permit_number', label: t('permitNumber'), required: true },
    { name: 'permit_type', label: t('permitType'), required: true, options: permitTypes.map(m => ({ value: m, label: t(m) })) },
    { name: 'title', label: t('title'), required: true },
    { name: 'description', label: t('description'), type: 'textarea' },
    { name: 'location', label: t('location') },
    { name: 'requested_by', label: t('requestedBy') },
    { name: 'requested_date', label: t('requestedDate'), type: 'date' },
    { name: 'valid_from', label: t('validFrom'), type: 'date' },
    { name: 'valid_to', label: t('validTo'), type: 'date' },
    { name: 'safety_measures', label: t('safetyMeasures'), type: 'textarea' },
  ];

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('permits')} subtitle="Permits to work management" icon={<Assignment />} />
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
        title={t('permits')}
        subtitle="Permits to work management — hot work, excavation, height, confined space, electrical, lifting"
        icon={<Assignment />}
        action actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: t('total'), value: stats?.total || 0 },
          { label: t('byType'), value: stats?.by_type ? Object.keys(stats.by_type).length : 0 },
          { label: t('byStatus'), value: stats?.by_status ? Object.keys(stats.by_status).length : 0 },
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
          <DialogTitle>{editItem ? `${t('edit')} ${t('permit')}` : `${t('create')} ${t('permit')}`}</DialogTitle>
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
            <Button type="submit" variant="contained" disabled={formLoading}>{formLoading ? t('saving') : t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, id: null, action: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('reject')} {t('permit')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('reason')} multiline minRows={3} size="small" fullWidth
              value={actionData.reason || ''} onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, id: null, action: '' })}>{t('cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleWorkflow}>{t('reject')}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
    </motion.div>
  );
}
