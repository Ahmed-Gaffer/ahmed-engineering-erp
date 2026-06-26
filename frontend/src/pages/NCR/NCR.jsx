import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, Stack, Button, IconButton, Tooltip, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Send, CheckCircle, Cancel, PictureAsPdf, UploadFile, Flag } from '@mui/icons-material';
import { motion } from 'framer-motion';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import { engineeringApi, projectsService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';

const severityColors = { minor: 'info', major: 'warning', critical: 'error' };
const statusColors = {
  open: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  investigation: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  corrective_action: { bg: 'rgba(99,102,241,0.2)', color: '#818cf8' },
  closed: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
  rejected: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

export default function NCR() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, ncr: null });
  const [actionText, setActionText] = useState({ corrective: '', preventive: '' });
  const [deleteId, setDeleteId] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    projectsService.list({ limit: 100 }).then((r) => {
      const items = r.data.items || [];
      setProjects(items);
      if (items.length && !selectedProjectId) setSelectedProjectId(items[0].id);
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const res = await engineeringApi.ncr.listByProject(selectedProjectId);
      setRows(res.data || []);
    } catch { setRows([]); }
    setLoading(false);
  }, [selectedProjectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (ncrId, action) => {
    try {
      if (action === 'investigate') await engineeringApi.ncr.investigate(ncrId);
      else if (action === 'close') await engineeringApi.ncr.close(ncrId, { closed_date: new Date().toISOString().split('T')[0] });
      else if (action === 'reject') {
        const reason = prompt(t('rejectionReason'));
        if (!reason) return;
        await engineeringApi.ncr.reject(ncrId, { rejection_reason: reason });
      }
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleApplyAction = async () => {
    try {
      await engineeringApi.ncr.applyAction(actionDialog.ncr.id, {
        corrective_action: actionText.corrective,
        preventive_action: actionText.preventive,
      });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setActionDialog({ open: false, ncr: null });
      setActionText({ corrective: '', preventive: '' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleUpload = async (ncrId, file) => {
    if (!file) return;
    try {
      await engineeringApi.ncr.upload(ncrId, file);
      enqueueSnackbar(t('uploadSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const downloadPdf = async (ncrId) => {
    try {
      const res = await engineeringApi.ncr.exportPdf(ncrId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'ncr_report.pdf'; a.click();
      window.URL.revokeObjectURL(url);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editRow) await engineeringApi.ncr.update(editRow.id, formData);
      else await engineeringApi.ncr.create({ ...formData, project_id: parseInt(selectedProjectId) });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await engineeringApi.ncr.delete(deleteId);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'ncr_number', headerName: t('ncrNumber'), width: 110, sortable: true },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150, sortable: true },
    { field: 'severity', headerName: t('severity'), width: 90,
      renderCell: (params) => <Chip label={t(params.value)} size="small" color={severityColors[params.value] || 'default'} />,
    },
    { field: 'status', headerName: t('status'), width: 120,
      renderCell: (params) => {
        const sc = statusColors[params.value] || statusColors.open;
        return <Chip label={t(`ncrStatus_${params.value}`)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'source', headerName: t('source'), width: 100 },
    { field: 'identified_date', headerName: t('identifiedDate'), width: 110, type: 'date' },
    { field: 'actions', headerName: t('actions'), width: 280, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'open' && (
            <Tooltip title={t('investigate')}>
              <IconButton size="small" color="warning" onClick={() => handleAction(params.row.id, 'investigate')}>
                <Send fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'investigation' && (
            <Tooltip title={t('applyAction')}>
              <IconButton size="small" color="info" onClick={() => {
                setActionDialog({ open: true, ncr: params.row });
                setActionText({ corrective: params.row.corrective_action || '', preventive: params.row.preventive_action || '' });
              }}>
                <Flag fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'corrective_action' && (
            <Tooltip title={t('close')}>
              <IconButton size="small" color="success" onClick={() => handleAction(params.row.id, 'close')}>
                <CheckCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {(params.row.status === 'open' || params.row.status === 'investigation') && (
            <Tooltip title={t('reject')}>
              <IconButton size="small" color="error" onClick={() => handleAction(params.row.id, 'reject')}>
                <Cancel fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('downloadPdf')}>
            <IconButton size="small" onClick={() => downloadPdf(params.row.id)}>
              <PictureAsPdf fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('uploadFile')}>
            <IconButton size="small" component="label">
              <UploadFile fontSize="small" />
              <input type="file" hidden onChange={(e) => { handleUpload(params.row.id, e.target.files[0]); e.target.value = ''; }} />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <IconButton size="small" color="error" onClick={() => setDeleteId(params.row.id)}>
              <Cancel fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  const formFields = [
    { name: 'ncr_number', label: 'ncrNumber', required: true },
    { name: 'title', label: 'title', required: true },
    { name: 'description', label: 'description', type: 'textarea' },
    { name: 'location', label: 'location' },
    { name: 'category', label: 'category', options: [{ value: 'material', label: 'material' }, { value: 'workmanship', label: 'workmanship' }, { value: 'design', label: 'design' }, { value: 'safety', label: 'safety' }, { value: 'other', label: 'other' }] },
    { name: 'severity', label: 'severity', required: true, options: [{ value: 'minor', label: 'minor' }, { value: 'major', label: 'major' }, { value: 'critical', label: 'critical' }] },
    { name: 'source', label: 'source', options: [{ value: 'inspection', label: 'inspection' }, { value: 'test', label: 'test' }, { value: 'client', label: 'client' }, { value: 'internal', label: 'internal' }] },
    { name: 'identified_date', label: 'identifiedDate', type: 'date' },
    { name: 'identified_by', label: 'identifiedBy' },
  ];

  if (!selectedProjectId) return <DataGridSkeleton />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>{t('ncr')}</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField select size="small" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} sx={{ minWidth: 200 }}>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
          </TextField>
          <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setEditRow(null); setFormOpen(true); }}>
            {t('createNcr')}
          </Button>
        </Stack>
      </Stack>

      <Card>
        {loading ? <DataGridSkeleton /> : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={rows} columns={columns} getRowId={(r) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const data = {};
          formFields.forEach(f => { data[f.name] = fd.get(f.name); });
          handleSubmit(data);
        }}>
          <DialogTitle>{editRow ? t('editNcr') : t('createNcr')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {formFields.map((f) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={t(f.label)} defaultValue={editRow?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    {f.options.map((o) => <MenuItem key={o.value} value={o.value}>{t(o.label)}</MenuItem>)}
                  </TextField>
                ) : (
                  <TextField key={f.name} name={f.name} label={t(f.label)} type={f.type === 'date' ? 'date' : 'text'}
                    defaultValue={editRow?.[f.name] || ''} required={f.required} size="small" fullWidth
                    multiline={f.type === 'textarea'} minRows={f.type === 'textarea' ? 3 : undefined}
                    slotProps={f.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
                  />
                )
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="contained">{t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, ncr: null })} maxWidth="md" fullWidth>
        <DialogTitle>{t('correctivePreventiveAction')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label={t('correctiveAction')} multiline minRows={3} fullWidth value={actionText.corrective}
              onChange={(e) => setActionText({ ...actionText, corrective: e.target.value })} />
            <TextField label={t('preventiveAction')} multiline minRows={3} fullWidth value={actionText.preventive}
              onChange={(e) => setActionText({ ...actionText, preventive: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, ncr: null })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleApplyAction}>{t('save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>{t('cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>{t('delete')}</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
