import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, CardContent, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Alert, Grid, Avatar,
  Tooltip, CircularProgress, Divider, FormControl, InputLabel, Select,
} from '@mui/material';
import {
  Add, Edit, Delete, Search, FilterList, Refresh, CheckCircle, Close,
  Visibility, Assignment, Warning, History, Business, Category, Code,
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

const observationStatusColors = {
  open: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  acknowledged: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  resolved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  closed: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const observationTypeColors = {
  safe_act: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  unsafe_act: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  safe_condition: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  unsafe_condition: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
};

const observationTypes = ['safe_act', 'unsafe_act', 'safe_condition', 'unsafe_condition'];
const observationCategories = ['housekeeping', 'ppe', 'scaffolding', 'electrical', 'fire', 'other'];
const statusOptions = ['open', 'acknowledged', 'resolved', 'closed'];

export default function SafetyObservations() {
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
  const [resolveDialog, setResolveDialog] = useState({ open: false, id: null });
  const [correctiveAction, setCorrectiveAction] = useState('');

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
      const r = await engineeringApi.safetyObservations.listByProject(selectedProjectId);
      setData(r.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { if (selectedProjectId) fetchData(); }, [fetchData, selectedProjectId]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = { ...formData, project_id: Number(selectedProjectId) };
      if (editItem) await engineeringApi.safetyObservations.update(editItem.id, payload);
      else await engineeringApi.safetyObservations.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.safetyObservations.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleAcknowledge = async (id) => {
    try {
      await engineeringApi.safetyObservations.acknowledge(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleResolve = async () => {
    try {
      await engineeringApi.safetyObservations.resolve(resolveDialog.id, { corrective_action: correctiveAction });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setResolveDialog({ open: false, id: null });
      setCorrectiveAction('');
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleClose = async (id) => {
    try {
      await engineeringApi.safetyObservations.close(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'observation_type', headerName: t('observationType'), width: 140,
      renderCell: (params) => {
        const tc = observationTypeColors[params.value] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
        return <Chip label={t(params.value)} size="small" sx={{ backgroundColor: tc.bg, color: tc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'category', headerName: t('category'), width: 120,
      renderCell: (params) => <Chip label={t(params.value)} size="small" variant="outlined" />,
    },
    { field: 'status', headerName: t('status'), width: 120,
      renderCell: (params) => {
        const sc = observationStatusColors[params.value] || observationStatusColors.open;
        return <Chip label={t(`observationStatus_${params.value}`, params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'location', headerName: t('location'), width: 130 },
    { field: 'observed_by', headerName: t('observedBy'), width: 130 },
    { field: 'created_at', headerName: t('date'), width: 110,
      renderCell: (params) => params.value ? formatDate(params.value) : '',
    },
    { field: 'actions', headerName: t('actions'), width: 200, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'open' && (
            <Tooltip title={t('acknowledge')}>
              <IconButton size="small" onClick={() => handleAcknowledge(params.row.id)} sx={{ color: '#3b82f6', bgcolor: 'rgba(59,130,246,0.08)' }}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'acknowledged' && (
            <Tooltip title={t('resolve')}>
              <IconButton size="small" onClick={() => setResolveDialog({ open: true, id: params.row.id })} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                <CheckCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'resolved' && (
            <Tooltip title={t('close')}>
              <IconButton size="small" onClick={() => handleClose(params.row.id)} sx={{ color: '#94a3b8', bgcolor: 'rgba(148,163,184,0.08)' }}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {(params.row.status === 'open' || params.row.status === 'acknowledged') && (
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
    { name: 'title', label: t('title'), required: true },
    { name: 'observation_type', label: t('observationType'), required: true, options: observationTypes.map(m => ({ value: m, label: t(m) })) },
    { name: 'category', label: t('category'), required: true, options: observationCategories.map(m => ({ value: m, label: t(m) })) },
    { name: 'description', label: t('description'), type: 'textarea' },
    { name: 'location', label: t('location') },
    { name: 'observed_by', label: t('observedBy') },
  ];

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('safetyObservations')} subtitle="Manage safety observations" icon={<Assignment />} />
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
        title={t('safetyObservations')}
        subtitle="Manage safety observations with acknowledgment, resolution, and closure workflow"
        icon={<Assignment />}
        action
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Open', value: data.filter(r => r.status === 'open').length },
          { label: 'Acknowledged', value: data.filter(r => r.status === 'acknowledged').length },
          { label: 'Resolved', value: data.filter(r => r.status === 'resolved').length },
          { label: 'Total', value: data.length },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
        </TextField>
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
          <DialogTitle>{editItem ? `${t('edit')} ${t('safetyObservation')}` : `${t('create')} ${t('safetyObservation')}`}</DialogTitle>
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

      <Dialog open={resolveDialog.open} onClose={() => setResolveDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('resolve')} {t('observation')}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t('correctiveAction')} fullWidth multiline minRows={3}
            value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} size="small" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialog({ open: false, id: null })}>{t('cancel')}</Button>
          <Button variant="contained" color="success" onClick={handleResolve}>{t('resolve')}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
    </motion.div>
  );
}
