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

const incidentStatusColors = {
  reported: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  investigating: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  action_taken: { bg: 'rgba(139,92,246,0.15)', color: '#D97706' },
  closed: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const severityColors = {
  minor: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  moderate: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  serious: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  fatal: { bg: 'rgba(0,0,0,0.2)', color: '#000000' },
};

const incidentTypes = ['injury', 'near_miss', 'property_damage', 'environmental', 'fire', 'other'];
const severityOptions = ['minor', 'moderate', 'serious', 'fatal'];
const statusOptions = ['reported', 'investigating', 'action_taken', 'closed'];

export default function SafetyIncidents() {
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
  const [actionData, setActionData] = useState({ description: '', action_taken: '', findings: '', corrective_actions: '' });

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
      const r = await engineeringApi.safetyIncidents.listByProject(selectedProjectId);
      setData(r.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { if (selectedProjectId) fetchData(); }, [fetchData, selectedProjectId]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = { ...formData, project_id: Number(selectedProjectId) };
      if (editItem) await engineeringApi.safetyIncidents.update(editItem.id, payload);
      else await engineeringApi.safetyIncidents.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.safetyIncidents.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleWorkflow = async () => {
    try {
      const { id, action } = actionDialog;
      if (action === 'investigate') await engineeringApi.safetyIncidents.investigate(id, actionData);
      else if (action === 'take_action') await engineeringApi.safetyIncidents.takeAction(id, actionData);
      else if (action === 'close') await engineeringApi.safetyIncidents.close(id, actionData);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setActionDialog({ open: false, id: null, action: '' });
      setActionData({ description: '', action_taken: '', findings: '', corrective_actions: '' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'incident_number', headerName: t('incidentNumber'), width: 120 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'incident_type', headerName: t('incidentType'), width: 130,
      renderCell: (params) => <Chip label={t(params.value)} size="small" variant="outlined" />,
    },
    { field: 'severity', headerName: t('severity'), width: 100,
      renderCell: (params) => {
        const sc = severityColors[params.value] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
        return <Chip label={t(params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }} />;
      },
    },
    { field: 'status', headerName: t('status'), width: 120,
      renderCell: (params) => {
        const sc = incidentStatusColors[params.value] || incidentStatusColors.reported;
        return <Chip label={t(`incidentStatus_${params.value}`, params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'incident_date', headerName: t('incidentDate'), width: 110, type: 'date',
      renderCell: (params) => params.value ? formatDate(params.value) : '',
    },
    { field: 'location', headerName: t('location'), width: 130 },
    { field: 'actions', headerName: t('actions'), width: 200, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'reported' && (
            <Tooltip title={t('investigate')}>
              <IconButton size="small" onClick={() => { setActionDialog({ open: true, id: params.row.id, action: 'investigate' }); setActionData({ description: '', action_taken: '', findings: '', corrective_actions: '' }); }} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' }}>
                <Assignment fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'investigating' && (
            <Tooltip title={t('takeAction')}>
              <IconButton size="small" onClick={() => { setActionDialog({ open: true, id: params.row.id, action: 'take_action' }); setActionData({ description: '', action_taken: '', findings: '', corrective_actions: '' }); }} sx={{ color: '#D97706', bgcolor: 'rgba(139,92,246,0.08)' }}>
                <CheckCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'action_taken' && (
            <Tooltip title={t('close')}>
              <IconButton size="small" onClick={() => { setActionDialog({ open: true, id: params.row.id, action: 'close' }); setActionData({ description: '', action_taken: '', findings: '', corrective_actions: '' }); }} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'reported' && (
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
    { name: 'incident_number', label: t('incidentNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'incident_type', label: t('incidentType'), required: true, options: incidentTypes.map(m => ({ value: m, label: t(m) })) },
    { name: 'severity', label: t('severity'), required: true, options: severityOptions.map(m => ({ value: m, label: t(m) })) },
    { name: 'incident_date', label: t('incidentDate'), type: 'date' },
    { name: 'location', label: t('location') },
    { name: 'description', label: t('description'), type: 'textarea' },
    { name: 'reported_by', label: t('reportedBy') },
  ];

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('safetyIncidents')} subtitle="Manage safety incident reports" icon={<Warning />} />
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
        title={t('safetyIncidents')}
        subtitle="Manage safety incident reports with investigation and action workflow"
        icon={<Warning />}
        action
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Reported', value: data.filter(r => r.status === 'reported').length },
          { label: 'Investigating', value: data.filter(r => r.status === 'investigating').length },
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
          <DialogTitle>{editItem ? `${t('edit')} ${t('safetyIncident')}` : `${t('create')} ${t('safetyIncident')}`}</DialogTitle>
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
        <DialogTitle>
          {actionDialog.action === 'investigate' ? t('investigate') : actionDialog.action === 'take_action' ? t('takeAction') : t('close')} {t('incident')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('findings')} multiline minRows={3} size="small" fullWidth
              value={actionData.findings} onChange={(e) => setActionData(prev => ({ ...prev, findings: e.target.value }))} />
            {actionDialog.action !== 'investigate' && (
              <TextField label={t('correctiveActions')} multiline minRows={3} size="small" fullWidth
                value={actionData.corrective_actions} onChange={(e) => setActionData(prev => ({ ...prev, corrective_actions: e.target.value }))} />
            )}
            <TextField label={t('description')} multiline minRows={2} size="small" fullWidth
              value={actionData.description} onChange={(e) => setActionData(prev => ({ ...prev, description: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, id: null, action: '' })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleWorkflow}>
            {actionDialog.action === 'investigate' ? t('investigate') : actionDialog.action === 'take_action' ? t('takeAction') : t('close')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
    </motion.div>
  );
}
