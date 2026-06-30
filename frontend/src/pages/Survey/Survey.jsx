import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Tooltip, CircularProgress, Grid,
} from '@mui/material';
import {
  Add, Delete, Edit, Refresh, LocationOn, Close, Visibility,
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

const pointTypeColors = {
  benchmark: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  tbm: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  control: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  detail: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  other: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const pointTypes = ['benchmark', 'tbm', 'control', 'detail', 'other'];
const pointStatuses = ['active', 'destroyed', 'replaced'];

export default function Survey() {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project_id') || '');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [readings, setReadings] = useState([]);
  const [readingsLoading, setReadingsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [stats, setStats] = useState(null);
  const [readingFormOpen, setReadingFormOpen] = useState(false);
  const [editReading, setEditReading] = useState(null);
  const [readingFormLoading, setReadingFormLoading] = useState(false);
  const [deleteReadingId, setDeleteReadingId] = useState(null);

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
        engineeringApi.surveyPoints.listByProject(selectedProjectId),
        engineeringApi.surveyPoints.stats(selectedProjectId),
      ]);
      setPoints(listRes.data || []);
      setStats(statsRes.data || null);
    } catch { setPoints([]); }
    finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { if (selectedProjectId) fetchData(); }, [fetchData, selectedProjectId]);

  const fetchReadings = useCallback(async (pointId) => {
    if (!pointId) { setReadings([]); return; }
    setReadingsLoading(true);
    try {
      const res = await engineeringApi.surveyPoints.listReadings(selectedProjectId, pointId);
      setReadings(res.data || []);
    } catch { setReadings([]); }
    finally { setReadingsLoading(false); }
  }, [selectedProjectId]);

  const handlePointClick = (point) => {
    setSelectedPoint(point);
    fetchReadings(point.id);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = { ...formData, project_id: Number(selectedProjectId) };
      if (editItem) await engineeringApi.surveyPoints.update(editItem.id, payload);
      else await engineeringApi.surveyPoints.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.surveyPoints.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      if (selectedPoint?.id === id) { setSelectedPoint(null); setReadings([]); }
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleReadingSubmit = async (formData) => {
    setReadingFormLoading(true);
    try {
      const payload = { ...formData };
      if (editReading) await engineeringApi.surveyPoints.updateReading(editReading.id, payload);
      else await engineeringApi.surveyPoints.createReading(selectedPoint.id, payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setReadingFormOpen(false);
      fetchReadings(selectedPoint.id);
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setReadingFormLoading(false); }
  };

  const handleDeleteReading = async (id) => {
    try {
      await engineeringApi.surveyPoints.deleteReading(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteReadingId(null);
      fetchReadings(selectedPoint.id);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const pointColumns = [
    { field: 'point_number', headerName: t('pointNumber'), width: 120 },
    { field: 'description', headerName: t('description'), flex: 1.5, minWidth: 150 },
    { field: 'point_type', headerName: t('pointType'), width: 120,
      renderCell: (params) => {
        const tc = pointTypeColors[params.value] || pointTypeColors.other;
        return <Chip label={t(params.value)} size="small" sx={{ backgroundColor: tc.bg, color: tc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'northing', headerName: t('northing'), width: 110, renderCell: (params) => params.value ?? '-' },
    { field: 'easting', headerName: t('easting'), width: 110, renderCell: (params) => params.value ?? '-' },
    { field: 'elevation', headerName: t('elevation'), width: 110, renderCell: (params) => params.value ?? '-' },
    { field: 'status', headerName: t('status'), width: 110,
      renderCell: (params) => {
        const sc = statusColors[`surveyStatus_${params.value}`] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
        return <Chip label={t(`surveyStatus_${params.value}`, params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'actions', headerName: t('actions'), width: 180, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('viewReadings')}>
            <IconButton size="small" onClick={() => handlePointClick(params.row)} sx={{ color: '#D97706', bgcolor: 'rgba(217,119,6,0.08)' }}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: '#D97706', bgcolor: 'rgba(217,119,6,0.08)' }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const readingColumns = [
    { field: 'reading_date', headerName: t('readingDate'), width: 120, renderCell: (params) => params.value ? formatDate(params.value) : '' },
    { field: 'northing_reading', headerName: t('northing'), width: 110, renderCell: (params) => params.value ?? '-' },
    { field: 'easting_reading', headerName: t('easting'), width: 110, renderCell: (params) => params.value ?? '-' },
    { field: 'elevation_reading', headerName: t('elevation'), width: 110, renderCell: (params) => params.value ?? '-' },
    { field: 'equipment_used', headerName: t('equipmentUsed'), width: 140 },
    { field: 'operator', headerName: t('operator'), width: 130 },
    { field: 'actions', headerName: t('actions'), width: 120, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => { setEditReading(params.row); setReadingFormOpen(true); }} sx={{ color: '#D97706', bgcolor: 'rgba(217,119,6,0.08)' }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleteReadingId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const pointFields = [
    { name: 'point_number', label: t('pointNumber'), required: true },
    { name: 'description', label: t('description') },
    { name: 'point_type', label: t('pointType'), required: true, options: pointTypes.map(m => ({ value: m, label: t(m) })) },
    { name: 'northing', label: t('northing'), type: 'number' },
    { name: 'easting', label: t('easting'), type: 'number' },
    { name: 'elevation', label: t('elevation'), type: 'number' },
    { name: 'coordinate_system', label: t('coordinateSystem') },
    { name: 'benchmark_ref', label: t('benchmarkRef') },
    { name: 'date_established', label: t('dateEstablished'), type: 'date' },
    { name: 'established_by', label: t('establishedBy') },
    { name: 'location_description', label: t('locationDescription'), type: 'textarea' },
  ];

  const readingFields = [
    { name: 'reading_date', label: t('readingDate'), type: 'date', required: true },
    { name: 'northing_reading', label: t('northing'), type: 'number' },
    { name: 'easting_reading', label: t('easting'), type: 'number' },
    { name: 'elevation_reading', label: t('elevation'), type: 'number' },
    { name: 'equipment_used', label: t('equipmentUsed') },
    { name: 'operator', label: t('operator') },
    { name: 'notes', label: t('notes'), type: 'textarea' },
  ];

  const projectSelector = (
    <Stack direction="row" spacing={1.5} mb={2.5}>
      <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedPoint(null); setReadings([]); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
        sx={{ minWidth: 240 }}>
        {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
      </TextField>
      <Button variant="outlined" startIcon={<Refresh />} size="small" onClick={fetchData}>{t('refresh')}</Button>
    </Stack>
  );

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('survey')} subtitle="Survey control points and readings" icon={<LocationOn />} />
        {projectSelector}
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('survey')}
        subtitle="Survey control points and readings"
        icon={<LocationOn />}
        action actionLabel={t('createPoint')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: t('active'), value: stats?.active || 0 },
          { label: t('destroyed'), value: stats?.destroyed || 0 },
          { label: t('total'), value: stats?.total || 0 },
        ]}
      />
      {projectSelector}

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={points} columns={pointColumns} getRowId={(r) => r.id}
                pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
                onRowClick={(params) => handlePointClick(params.row)}
                localeText={i18n.language === 'ar' ? arSD : enUS}
                sx={{
                  '& .MuiDataGrid-row': { cursor: 'pointer' },
                  '& .MuiDataGrid-row.selected': { bgcolor: 'rgba(217,119,6,0.08)' },
                }}
              />
            </Box>

            {selectedPoint && (
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t('readingsFor')} {selectedPoint.point_number}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({readings.length} {t('records')})
                    </Typography>
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" startIcon={<Add />}
                      onClick={() => { setEditReading(null); setReadingFormOpen(true); }}>
                      {t('addReading')}
                    </Button>
                    <IconButton size="small" onClick={() => { setSelectedPoint(null); setReadings([]); }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
                <Box sx={{ height: 260 }}>
                  {readingsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
                  ) : (
                    <DataGrid
                      rows={readings} columns={readingColumns} getRowId={(r) => r.id}
                      pageSizeOptions={[5, 10, 25]} disableRowSelectionOnClick
                      localeText={i18n.language === 'ar' ? arSD : enUS}
                    />
                  )}
                </Box>
              </Box>
            )}
          </>
        )}
      </Card>

      {/* Point Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); const data = {}; pointFields.forEach(f => { data[f.name] = fd.get(f.name); }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} ${t('surveyPoint')}` : `${t('create')} ${t('surveyPoint')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {pointFields.map((f) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={f.label} defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    {f.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                ) : (
                  <TextField key={f.name} name={f.name} label={f.label} type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
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

      {/* Reading Form Dialog */}
      <Dialog open={readingFormOpen} onClose={() => setReadingFormOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); const data = {}; readingFields.forEach(f => { data[f.name] = fd.get(f.name); }); handleReadingSubmit(data); }}>
          <DialogTitle>{editReading ? `${t('edit')} ${t('reading')}` : `${t('create')} ${t('reading')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {readingFields.map((f) => (
                <TextField key={f.name} name={f.name} label={f.label} type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                  defaultValue={editReading?.[f.name] || ''} required={f.required} size="small" fullWidth
                  multiline={f.type === 'textarea'} minRows={f.type === 'textarea' ? 3 : undefined}
                  slotProps={f.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReadingFormOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="contained" disabled={readingFormLoading}>{readingFormLoading ? t('saving') : t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
      <ConfirmDialog open={Boolean(deleteReadingId)} onClose={() => setDeleteReadingId(null)} onConfirm={() => handleDeleteReading(deleteReadingId)} />
    </motion.div>
  );
}
