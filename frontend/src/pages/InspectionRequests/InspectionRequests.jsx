import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Card, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, Send, CheckCircle, Cancel, Close, Refresh, Assignment, Warning, History, Visibility, Search } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import LoadingButton from '@mui/lab/LoadingButton';
import { engineeringApi, projectsService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  planned: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  submitted: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  inspected: { bg: 'rgba(99,102,241,0.2)', color: '#6366f1' },
  passed: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
  failed: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  re_inspection: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
};

const inspectionTypes = ['incoming_material', 'concrete_pouring', 'steel_fixing', 'waterproofing', 'finishing', 'mep', 'soil_test', 'other'];

export default function InspectionRequests() {
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
  const [inspectDialog, setInspectDialog] = useState({ open: false, id: null });
  const [inspectFindings, setInspectFindings] = useState('');
  const [inspectResult, setInspectResult] = useState('passed');
  const [reinspectDialog, setReinspectDialog] = useState({ open: false, id: null });
  const [reinspectDate, setReinspectDate] = useState('');

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
      const r = await engineeringApi.inspections.listByProject(selectedProjectId);
      setData(r.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editItem) await engineeringApi.inspections.update(editItem.id, formData);
      else await engineeringApi.inspections.create({ ...formData, project_id: parseInt(selectedProjectId) });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.inspections.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'submit') await engineeringApi.inspections.submit(id, {});
      else if (action === 'pass') await engineeringApi.inspections.pass(id, {});
      else if (action === 'fail') await engineeringApi.inspections.fail(id, {});
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleInspect = async () => {
    try {
      await engineeringApi.inspections.inspect(inspectDialog.id, { findings: inspectFindings, result: inspectResult });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setInspectDialog({ open: false, id: null });
      setInspectFindings('');
      setInspectResult('passed');
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleReinspect = async () => {
    try {
      await engineeringApi.inspections.scheduleReinspection(reinspectDialog.id, { scheduled_date: reinspectDate });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setReinspectDialog({ open: false, id: null });
      setReinspectDate('');
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'inspection_number', headerName: t('inspectionNumber'), width: 110 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'inspection_type', headerName: t('inspectionType'), width: 140 },
    { field: 'location', headerName: t('location'), width: 130 },
    { field: 'status', headerName: t('status'), width: 120,
      renderCell: (params) => {
        const sc = statusColors[params.value] || statusColors.planned;
        const label = t(`inspectionStatus_${params.value}`, params.value);
        return <Chip label={label} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'scheduled_date', headerName: t('scheduledDate'), width: 110, type: 'date' },
    { field: 'inspector_name', headerName: t('inspectorName'), width: 130 },
    { field: 'actions', headerName: t('actions'), width: 300, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'planned' && (
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
            <Tooltip title={t('inspect')}>
              <IconButton size="small" onClick={() => setInspectDialog({ open: true, id: params.row.id })} sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)' }}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'inspected' && (
            <>
              <Tooltip title={t('pass')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'pass')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('fail')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'fail')} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.status === 'failed' && (
            <Tooltip title={t('scheduleReinspection')}>
              <IconButton size="small" onClick={() => setReinspectDialog({ open: true, id: params.row.id })} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 're_inspection' && (
            <Tooltip title={t('submit')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'submit')} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' }}>
                <Send fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {isAdmin && !['passed', 'failed'].includes(params.row.status) && (
            <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'inspection_number', label: t('inspectionNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'inspection_type', label: t('inspectionType'), required: true, options: inspectionTypes.map(m => ({ value: m, label: t(`inspectionType_${m}`, m) })) },
    { name: 'location', label: t('location') },
    { name: 'description', label: t('description'), type: 'textarea' },
    { name: 'scheduled_date', label: t('scheduledDate'), type: 'date' },
    { name: 'inspector_name', label: t('inspectorName') },
    { name: 'contractor_name', label: t('contractorName') },
    { name: 'remarks', label: t('remarks'), type: 'textarea' },
  ];

  if (!selectedProjectId) return <DataGridSkeleton />;

  const totalCount = data.length;
  const pendingCount = data.filter(r => ['planned', 'submitted', 'inspected'].includes(r.status)).length;
  const passedCount = data.filter(r => r.status === 'passed').length;
  const failedCount = data.filter(r => r.status === 'failed').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('inspectionRequests')}
        subtitle="Manage inspection requests with planning, inspection, pass/fail, and re-inspection workflow"
        icon={<Search />}
        action={!!selectedProjectId}
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Total', value: totalCount },
          { label: 'Pending', value: pendingCount },
          { label: 'Passed', value: passedCount },
          { label: 'Failed', value: failedCount },
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
          <DialogTitle>{editItem ? `${t('edit')} Inspection Request` : `${t('create')} Inspection Request`}</DialogTitle>
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

      <Dialog open={inspectDialog.open} onClose={() => setInspectDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('inspect')} Inspection</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label={t('result')} value={inspectResult} onChange={(e) => setInspectResult(e.target.value)} size="small" fullWidth>
              <MenuItem value="passed">{t('passed')}</MenuItem>
              <MenuItem value="failed">{t('failed')}</MenuItem>
            </TextField>
            <TextField label={t('findings')} multiline minRows={3} value={inspectFindings}
              onChange={(e) => setInspectFindings(e.target.value)} size="small" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInspectDialog({ open: false, id: null })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleInspect}>{t('submit')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reinspectDialog.open} onClose={() => setReinspectDialog({ open: false, id: null })}>
        <DialogTitle>{t('scheduleReinspection')}</DialogTitle>
        <DialogContent>
          <TextField label={t('scheduledDate')} type="date" value={reinspectDate}
            onChange={(e) => setReinspectDate(e.target.value)} size="small" fullWidth sx={{ mt: 1 }}
            slotProps={{ inputLabel: { shrink: true } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReinspectDialog({ open: false, id: null })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleReinspect}>{t('schedule')}</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
