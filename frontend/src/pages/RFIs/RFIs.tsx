import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, TextField, Button, Stack, MenuItem, Chip, Card, Dialog, DialogTitle,
  DialogContent, DialogActions, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Add, Edit, Delete, Visibility, QuestionAnswer } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import { engineeringApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../components/EmptyState/EmptyState';

const STATUS_CHIP: Record<string, React.ReactElement> = {
  new: <Chip label="New" size="small" color="info" />,
  answered: <Chip label="Answered" size="small" color="success" />,
  closed: <Chip label="Closed" size="small" sx={{ bgcolor: 'rgba(148,163,184,0.15)', color: '#94a3b8' }} />,
};

const PRIORITY_CHIP: Record<string, React.ReactElement> = {
  low: <Chip label="Low" size="small" color="default" />,
  medium: <Chip label="Medium" size="small" color="warning" />,
  high: <Chip label="High" size="small" color="error" />,
};

const RFIs: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>(searchParams.get('project_id') || '');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ rfi_number: '', title: '', description: '', priority: 'medium', status: 'new', due_date: '' });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    engineeringApi.projects.list().then((r: { data: { id: number; name: string }[] }) => {
      const items = r.data || [];
      setProjects(items);
      const urlPid = searchParams.get('project_id');
      if (urlPid && items.some((p) => p.id === Number(urlPid))) setSelectedProjectId(Number(urlPid));
    });
  }, []);

  const queryKey = ['rfis', selectedProjectId];

  const { data, isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const r = await engineeringApi.rfis.listByProject(selectedProjectId);
      return r.data || [];
    },
    enabled: !!selectedProjectId,
    placeholderData: [],
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ rfi_number: '', title: '', description: '', priority: 'medium', status: 'new', due_date: '' });
    setFormOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditItem(row);
    setForm({ rfi_number: (row.rfi_number as string) || '', title: (row.title as string) || '', description: (row.description as string) || '', priority: (row.priority as string) || 'medium', status: (row.status as string) || 'new', due_date: (row.due_date as string) || '' });
    setFormOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => engineeringApi.rfis.create(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => engineeringApi.rfis.update((editItem as { id: number }).id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => engineeringApi.rfis.delete(deleteId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); setDeleteOpen(false); },
    onError: () => {},
  });

  const handleSubmit = () => {
    const payload = { project_id: Number(selectedProjectId), rfi_number: form.rfi_number, title: form.title, description: form.description || null, priority: form.priority, status: form.status, due_date: form.due_date || null };
    if (editItem) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const handleDelete = () => deleteMutation.mutate();

  const columns = [
    { field: 'rfi_number', headerName: 'RFI #', width: 110 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'priority', headerName: 'Priority', width: 100, renderCell: (p: { value: string }) => PRIORITY_CHIP[p.value] || PRIORITY_CHIP.medium },
    { field: 'status', headerName: t('status'), width: 110, renderCell: (p: { value: string }) => STATUS_CHIP[p.value] || STATUS_CHIP.new },
    { field: 'due_date', headerName: 'Due Date', width: 110, renderCell: (p: { value: string }) => formatDate(p.value) },
    { field: 'response_date', headerName: 'Response', width: 110, renderCell: (p: { value: string }) => formatDate(p.value) },
    { field: 'actions', headerName: t('actions'), width: 120, sortable: false,
      renderCell: (p: { row: { id: number } }) => (
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
        <PageHeader
          title="RFIs"
          subtitle="Submit and track Requests for Information across projects"
          icon={<QuestionAnswer />}
          accentColor="#8b5cf6"
          action={!!selectedProjectId}
          actionLabel={t('create')}
          onAction={openCreate}
          stats={[
            { label: 'Open', value: (data as Record<string, unknown>[]).filter(r => r.status === 'new').length },
            { label: 'Total', value: (data as Record<string, unknown>[]).length },
          ]}
        />
        <TextField select value={selectedProjectId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {!selectedProjectId ? <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} /> : (
          <Card sx={{ borderTop: '4px solid', borderTopColor: 'secondary.main', boxShadow: '0 0 20px rgba(212,160,48,0.15)', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 0 20px rgba(212,160,48,0.15)' } }}><Box sx={{ height: 500 }}><DataGrid rows={data as Record<string, unknown>[]} columns={columns} loading={loading} pageSizeOptions={[20]} /></Box></Card>
        )}

        <Dialog open={!!detailItem} onClose={() => setDetailItem(null)} maxWidth="sm" fullWidth>
          <DialogTitle>{(detailItem as Record<string, string>)?.rfi_number}</DialogTitle>
          <DialogContent>
            <Stack spacing={1}>
              <Typography variant="h6">{(detailItem as Record<string, string>)?.title}</Typography>
              <Typography variant="body2" color="text.secondary">{(detailItem as Record<string, string>)?.description}</Typography>
            </Stack>
          </DialogContent>
          <DialogActions><Button onClick={() => setDetailItem(null)}>{t('close')}</Button></DialogActions>
        </Dialog>

        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editItem ? 'Edit RFI' : 'Create RFI'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="RFI Number" required size="small" value={form.rfi_number} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, rfi_number: e.target.value }))} />
              <TextField label="Title" required size="small" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, title: e.target.value }))} />
              <TextField label="Description" multiline rows={2} size="small" value={form.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, description: e.target.value }))} />
              <Stack direction="row" spacing={2}>
                <TextField select label="Priority" size="small" fullWidth value={form.priority} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
                <TextField select label="Status" size="small" fullWidth value={form.status} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, status: e.target.value }))}>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="answered">Answered</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </TextField>
              </Stack>
              <TextField label="Due Date" type="date" size="small" fullWidth value={form.due_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, due_date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
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
};

export default RFIs;
