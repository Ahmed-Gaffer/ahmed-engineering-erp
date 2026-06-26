import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, CheckCircle, PictureAsPdf } from '@mui/icons-material';
import { motion } from 'framer-motion';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import LoadingButton from '@mui/lab/LoadingButton';
import { engineeringApi } from '../../services/api';
import { useSnackbar } from 'notistack';
import { formatDate } from '../../utils/helpers';

const statusColors = {
  draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  final: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
};

const meetingTypes = [
  { value: 'regular', label: 'regular' },
  { value: 'emergency', label: 'emergency' },
  { value: 'progress', label: 'progress' },
  { value: 'technical', label: 'technical' },
  { value: 'site', label: 'site' },
];

export default function MeetingMinutes() {
  const { projectId } = useParams();
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await engineeringApi.meetingMinutes.listByProject(projectId);
      setData(r.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editItem) await engineeringApi.meetingMinutes.update(editItem.id, formData);
      else await engineeringApi.meetingMinutes.create({ ...formData, project_id: Number(projectId) });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.meetingMinutes.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleFinalize = async (id) => {
    try {
      await engineeringApi.meetingMinutes.finalize(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const downloadPdf = async (id) => {
    try {
      const r = await engineeringApi.meetingMinutes.exportPdf(id);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting_minutes_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'meeting_title', headerName: t('meetingTitle'), flex: 1.5, minWidth: 180 },
    { field: 'meeting_date', headerName: t('meetingDate'), width: 110, type: 'date',
      valueGetter: (value) => value ? new Date(value) : null,
      renderCell: (params) => <Typography variant="body2">{formatDate(params.value)}</Typography>,
    },
    { field: 'meeting_type', headerName: t('meetingType'), width: 110,
      renderCell: (params) => <Chip label={t(params.value)} size="small" variant="outlined" />,
    },
    { field: 'chairperson', headerName: t('chairperson'), width: 130 },
    { field: 'status', headerName: t('status'), width: 100,
      renderCell: (params) => {
        const sc = statusColors[params.value] || statusColors.draft;
        const label = t(`mmStatus_${params.value}`, params.value);
        return <Chip label={label} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'actions', headerName: t('actions'), width: 200, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'draft' && (
            <>
              <Tooltip title={t('edit')}>
                <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)' }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('finalize')}>
                <IconButton size="small" onClick={() => handleFinalize(params.row.id)} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
            <Delete fontSize="small" />
          </IconButton>
          <Tooltip title={t('downloadPdf')}>
            <IconButton size="small" onClick={() => downloadPdf(params.row.id)} sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)' }}>
              <PictureAsPdf fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'meeting_title', label: t('meetingTitle'), required: true },
    { name: 'meeting_date', label: t('meetingDate'), type: 'date', required: true },
    { name: 'meeting_type', label: t('meetingType'), options: meetingTypes.map(m => ({ value: m.value, label: t(m.label) })) },
    { name: 'location', label: t('location') },
    { name: 'chairperson', label: t('chairperson') },
    { name: 'attendees', label: t('attendees'), type: 'textarea' },
    { name: 'agenda', label: t('agenda'), type: 'textarea' },
    { name: 'discussion', label: t('discussion'), type: 'textarea' },
    { name: 'decisions', label: t('decisions'), type: 'textarea' },
    { name: 'action_items', label: t('actionItems'), type: 'textarea' },
    { name: 'next_meeting_date', label: t('nextMeetingDate'), type: 'date' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>{t('meetingMinutes')}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditItem(null); setFormOpen(true); }} size="small">
          {t('createMeeting')}
        </Button>
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
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const data = {};
          fields.forEach(f => { data[f.name] = fd.get(f.name); });
          handleSubmit(data);
        }}>
          <DialogTitle>{editItem ? t('editMeeting') : t('createMeeting')}</DialogTitle>
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
    </motion.div>
  );
}
