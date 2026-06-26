import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, TextField, Button, Stack, MenuItem, Chip, Card, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import { engineeringApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../components/EmptyState/EmptyState';

const STATUS_CHIP = {
  new: <Chip label="New" size="small" color="info" />,
  answered: <Chip label="Answered" size="small" color="success" />,
  closed: <Chip label="Closed" size="small" sx={{ bgcolor: 'rgba(148,163,184,0.15)', color: '#94a3b8' }} />,
};

const PRIORITY_CHIP = {
  low: <Chip label="Low" size="small" color="default" />,
  medium: <Chip label="Medium" size="small" color="warning" />,
  high: <Chip label="High" size="small" color="error" />,
};

export default function RFIs() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ rfi_number: '', title: '', description: '', priority: 'medium', status: 'new', due_date: '' });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => { engineeringApi.projects.list().then(r => setProjects(r.data || [])); }, []);

  const fetchData = async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); return; }
    setLoading(true);
    try { const r = await engineeringApi.rfis.listByProject(selectedProjectId); setData(r.data || []); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ rfi_number: '', title: '', description: '', priority: 'medium', status: 'new', due_date: '' });
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    setForm({ rfi_number: row.rfi_number || '', title: row.title || '', description: row.description || '', priority: row.priority || 'medium', status: row.status || 'new', due_date: row.due_date || '' });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { project_id: Number(selectedProjectId), rfi_number: form.rfi_number, title: form.title, description: form.description || null, priority: form.priority, status: form.status, due_date: form.due_date || null };
      if (editItem) await engineeringApi.rfis.update(editItem.id, payload);
      else await engineeringApi.rfis.create(payload);
      setFormOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleDelete = async () => {
    try { await engineeringApi.rfis.delete(deleteId); setDeleteOpen(false); fetchData(); } catch {}
  };

  const columns = [
    { field: 'rfi_number', headerName: 'RFI #', width: 110 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'priority', headerName: 'Priority', width: 100, renderCell: (p) => PRIORITY_CHIP[p.value] || PRIORITY_CHIP.medium },
    { field: 'status', headerName: t('status'), width: 110, renderCell: (p) => STATUS_CHIP[p.value] || STATUS_CHIP.new },
    { field: 'due_date', headerName: 'Due Date', width: 110, renderCell: (p) => formatDate(p.value) },
    { field: 'response_date', headerName: 'Response', width: 110, renderCell: (p) => formatDate(p.value) },
    { field: 'actions', headerName: t('actions'), width: 120, sortable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Button size="small" onClick={() => setDetailItem(p.row)}><Visibility fontSize="small" /></Button>
          <Button size="small" onClick={() => openEdit(p.row)}><Edit fontSize="small" /></Button>
          <Button size="small" onClick={() => { setDeleteId(p.row.id); setDeleteOpen(true); }}><Delete fontSize="small" /></Button>
        </Stack>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>RFIs</Typography>
          {selectedProjectId && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>{t('create')}</Button>}
        </Stack>
        <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {!selectedProjectId ? <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} /> : (
          <Card><Box sx={{ height: 500 }}><DataGrid rows={data} columns={columns} loading={loading} pageSizeOptions={[20]} /></Box></Card>
        )}

        <Dialog open={!!detailItem} onClose={() => setDetailItem(null)} maxWidth="sm" fullWidth>
          <DialogTitle>{detailItem?.rfi_number}</DialogTitle>
          <DialogContent>
            <Stack spacing={1}>
              <Typography variant="h6">{detailItem?.title}</Typography>
              <Typography variant="body2" color="text.secondary">{detailItem?.description}</Typography>
            </Stack>
          </DialogContent>
          <DialogActions><Button onClick={() => setDetailItem(null)}>{t('close')}</Button></DialogActions>
        </Dialog>

        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editItem ? 'Edit RFI' : 'Create RFI'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="RFI Number" required size="small" value={form.rfi_number} onChange={(e) => setForm(f => ({ ...f, rfi_number: e.target.value }))} />
              <TextField label="Title" required size="small" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              <TextField label="Description" multiline rows={2} size="small" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              <Stack direction="row" spacing={2}>
                <TextField select label="Priority" size="small" fullWidth value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
                <TextField select label="Status" size="small" fullWidth value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="answered">Answered</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </TextField>
              </Stack>
              <TextField label="Due Date" type="date" size="small" fullWidth value={form.due_date} onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <Button variant="contained" onClick={handleSubmit}>{t('save')}</Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title={t('confirmDelete')} />
      </Box>
    </motion.div>
  );
}
