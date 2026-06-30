import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Tooltip, CircularProgress, Grid,
} from '@mui/material';
import {
  Add, Delete, Edit, Refresh, CheckCircle, Cancel, Science, Assignment, Close,
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

const testTypeColors = {
  concrete_cube: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  concrete_slump: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  soil_compaction: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  soil_proctor: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  soil_cbr: { bg: 'rgba(139,92,246,0.15)', color: '#D97706' },
  steel_tensile: { bg: 'rgba(34,211,238,0.15)', color: '#F59E0B' },
  steel_bend: { bg: 'rgba(236,72,153,0.15)', color: '#ec4899' },
  other: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const testTypes = ['concrete_cube', 'concrete_slump', 'soil_compaction', 'soil_proctor', 'soil_cbr', 'steel_tensile', 'steel_bend', 'other'];
const statusOptions = ['requested', 'sampled', 'tested', 'completed', 'cancelled'];

export default function MaterialTests() {
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
        engineeringApi.materialTests.listByProject(selectedProjectId),
        engineeringApi.materialTests.stats(selectedProjectId),
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
      if (editItem) await engineeringApi.materialTests.update(editItem.id, payload);
      else await engineeringApi.materialTests.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.materialTests.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleWorkflow = async () => {
    try {
      const { id, action } = actionDialog;
      if (action === 'record_result') await engineeringApi.materialTests.recordResult(id, actionData);
      else if (action === 'verify') await engineeringApi.materialTests.verify(id, actionData);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setActionDialog({ open: false, id: null, action: '' });
      setActionData({});
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'test_number', headerName: t('testNumber'), width: 120 },
    { field: 'test_type', headerName: t('testType'), width: 140,
      renderCell: (params) => {
        const tc = testTypeColors[params.value] || testTypeColors.other;
        return <Chip label={t(params.value)} size="small" sx={{ backgroundColor: tc.bg, color: tc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'sample_description', headerName: t('sample'), flex: 1.5, minWidth: 150 },
    { field: 'standard_ref', headerName: t('standard'), width: 100 },
    { field: 'result_value', headerName: t('result'), width: 100,
      renderCell: (params) => params.value != null ? `${params.value} ${params.row.unit || ''}` : '-',
    },
    { field: 'passed', headerName: t('passed'), width: 90,
      renderCell: (params) => {
        if (params.value === true) return <Chip label={t('yes')} size="small" color="success" />;
        if (params.value === false) return <Chip label={t('no')} size="small" color="error" />;
        return <Chip label={t('pending')} size="small" variant="outlined" />;
      },
    },
    { field: 'status', headerName: t('status'), width: 110,
      renderCell: (params) => {
        const sc = statusColors[`materialTestStatus_${params.value}`] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
        return <Chip label={t(`materialTestStatus_${params.value}`, params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'test_date', headerName: t('testDate'), width: 110, renderCell: (params) => params.value ? formatDate(params.value) : '' },
    { field: 'tested_by', headerName: t('testedBy'), width: 120 },
    { field: 'actions', headerName: t('actions'), width: 200, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'sampled' && (
            <Tooltip title={t('recordResult')}>
              <IconButton size="small" onClick={() => { setActionDialog({ open: true, id: params.row.id, action: 'record_result' }); setActionData({ result_value: '', unit: '', tested_by: '', lab_name: '', certificate_number: '', acceptance_criteria: '', passed: false }); }} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                <CheckCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'tested' && (
            <Tooltip title={t('verify')}>
              <IconButton size="small" onClick={() => { setActionDialog({ open: true, id: params.row.id, action: 'verify' }); setActionData({ passed: true }); }} sx={{ color: '#D97706', bgcolor: 'rgba(139,92,246,0.08)' }}>
                <Assignment fontSize="small" />
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
    { name: 'test_number', label: t('testNumber'), required: true },
    { name: 'test_type', label: t('testType'), required: true, options: testTypes.map(m => ({ value: m, label: t(m) })) },
    { name: 'sample_description', label: t('sample'), type: 'textarea' },
    { name: 'sample_location', label: t('location') },
    { name: 'sample_date', label: t('sampleDate'), type: 'date' },
    { name: 'standard_ref', label: t('standard') },
    { name: 'acceptance_criteria', label: t('acceptanceCriteria'), type: 'textarea' },
    { name: 'notes', label: t('notes'), type: 'textarea' },
  ];

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('materialTests')} subtitle="Quality control material testing" icon={<Science />} />
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
        title={t('materialTests')}
        subtitle="Quality control material testing — concrete, soil, steel"
        icon={<Science />}
        action actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: t('passed'), value: stats?.passed_tests || 0 },
          { label: t('failed'), value: stats?.failed_tests || 0 },
          { label: t('total'), value: stats?.total_tests || 0 },
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
          <DialogTitle>{editItem ? `${t('edit')} ${t('materialTest')}` : `${t('create')} ${t('materialTest')}`}</DialogTitle>
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
          {actionDialog.action === 'record_result' ? t('recordResult') : t('verify')} {t('materialTest')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {actionDialog.action === 'record_result' && (
              <>
                <TextField label={t('resultValue')} type="number" size="small" fullWidth
                  value={actionData.result_value} onChange={(e) => setActionData(prev => ({ ...prev, result_value: e.target.value }))} />
                <TextField label={t('unit')} size="small" fullWidth
                  value={actionData.unit} onChange={(e) => setActionData(prev => ({ ...prev, unit: e.target.value }))} />
                <TextField label={t('acceptanceCriteria')} multiline minRows={2} size="small" fullWidth
                  value={actionData.acceptance_criteria} onChange={(e) => setActionData(prev => ({ ...prev, acceptance_criteria: e.target.value }))} />
                <TextField label={t('testedBy')} size="small" fullWidth
                  value={actionData.tested_by} onChange={(e) => setActionData(prev => ({ ...prev, tested_by: e.target.value }))} />
                <TextField label={t('labName')} size="small" fullWidth
                  value={actionData.lab_name} onChange={(e) => setActionData(prev => ({ ...prev, lab_name: e.target.value }))} />
                <TextField label={t('certificateNumber')} size="small" fullWidth
                  value={actionData.certificate_number} onChange={(e) => setActionData(prev => ({ ...prev, certificate_number: e.target.value }))} />
                <TextField select label={t('passed')} size="small" fullWidth
                  value={actionData.passed} onChange={(e) => setActionData(prev => ({ ...prev, passed: e.target.value === 'true' }))}>
                  <MenuItem value="true">{t('yes')}</MenuItem>
                  <MenuItem value="false">{t('no')}</MenuItem>
                </TextField>
              </>
            )}
            {actionDialog.action === 'verify' && (
              <>
                <TextField select label={t('passed')} size="small" fullWidth defaultValue="true"
                  onChange={(e) => setActionData(prev => ({ ...prev, passed: e.target.value === 'true' }))}>
                  <MenuItem value="true">{t('yes')}</MenuItem>
                  <MenuItem value="false">{t('no')}</MenuItem>
                </TextField>
                <TextField label={t('notes')} multiline minRows={2} size="small" fullWidth
                  value={actionData.notes || ''} onChange={(e) => setActionData(prev => ({ ...prev, notes: e.target.value }))} />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, id: null, action: '' })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleWorkflow}>
            {actionDialog.action === 'record_result' ? t('recordResult') : t('verify')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
    </motion.div>
  );
}
