import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Card, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Tooltip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, Send, CheckCircle, Cancel, UploadFile, PictureAsPdf, Assignment } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import LoadingButton from '@mui/lab/LoadingButton';
import { engineeringApi, projectsService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '../../stores/authStore';

const materialTypes: string[] = ['structural', 'finishing', 'mechanical', 'electrical', 'plumbing', 'other'];
const units: string[] = ['m', 'm2', 'm3', 'kg', 'ton', 'unit'];

const MAR: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const statusColors: Record<string, { bg: string; color: string }> = {
    draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
    submitted: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
    reviewed: { bg: alpha(theme.palette.secondary.main, 0.15), color: theme.palette.secondary.main },
    approved: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
    rejected: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<{ id: number; code: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>(searchParams.get('project_id') || '');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    projectsService.list({ limit: 100 }).then((r: { data: { items: { id: number; code: string; name: string }[] } }) => {
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

  const queryKey = ['mar', selectedProjectId];

  const { data, isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const r = await engineeringApi.mar.listByProject(selectedProjectId);
      return r.data || [];
    },
    enabled: !!selectedProjectId,
    placeholderData: [],
  });

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, string>) => engineeringApi.mar.create({ ...formData, project_id: parseInt(selectedProjectId as string) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); setFormLoading(false); },
    onError: (e: { response?: { data?: { detail?: string } } }) => { enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }); setFormLoading(false); },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: Record<string, string>) => engineeringApi.mar.update((editItem as { id: number }).id, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); setFormLoading(false); },
    onError: (e: { response?: { data?: { detail?: string } } }) => { enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }); setFormLoading(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => engineeringApi.mar.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setDeleteId(null); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      const actions: Record<string, (id: number) => Promise<unknown>> = {
        submit: (id: number) => engineeringApi.mar.submit(id),
        approve: (id: number) => engineeringApi.mar.approve(id),
      };
      await actions[action](id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => engineeringApi.mar.reject(rejectDialog.id, { rejection_reason: rejectReason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setRejectDialog({ open: false, id: null }); setRejectReason(''); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => engineeringApi.mar.upload(id, file),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('uploadSuccess'), { variant: 'success' }); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const handleSubmit = (formData: Record<string, string>) => {
    if (editItem) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  const handleDelete = (id: number) => deleteMutation.mutate(id);

  const handleAction = (id: number, action: string) => actionMutation.mutate({ id, action });

  const handleReject = () => rejectMutation.mutate();

  const uploadFile = (id: number, file: File) => {
    if (!file) return;
    uploadMutation.mutate({ id, file });
  };

  const downloadPdf = async (id: number) => {
    try {
      const r = await engineeringApi.mar.exportPdf(id);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `mar_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'mar_number', headerName: t('marNumber'), width: 110 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'material_type', headerName: t('materialType'), width: 120 },
    { field: 'manufacturer', headerName: t('manufacturer'), width: 130 },
    { field: 'quantity_requested', headerName: t('quantity'), width: 90, type: 'number' },
    { field: 'unit', headerName: t('unit'), width: 60 },
    { field: 'submitted_date', headerName: t('submittedDate'), width: 110, type: 'date' },
    { field: 'required_date', headerName: t('requiredDate'), width: 110, type: 'date' },
    { field: 'status', headerName: t('status'), width: 120,
      renderCell: (params: { value: string }) => {
        const sc = statusColors[params.value] || statusColors.draft;
        const label = t(`marStatus_${params.value}`, params.value);
        return <Chip label={label} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'actions', headerName: t('actions'), width: 280, sortable: false,
      renderCell: (params: { row: { id: number; status: string } }) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'draft' && (
            <>
              <Tooltip title={t('submit')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'submit')} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' }}>
                  <Send fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: theme.palette.secondary.main, bgcolor: alpha(theme.palette.secondary.main, 0.08) }}>
                <Edit fontSize="small" />
              </IconButton>
            </>
          )}
          {params.row.status === 'submitted' && (
            <>
              <Tooltip title={t('approve')}>
                <IconButton size="small" onClick={() => handleAction(params.row.id, 'approve')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('reject')}>
                <IconButton size="small" onClick={() => setRejectDialog({ open: true, id: params.row.id })} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {isAdmin && params.row.status !== 'approved' && params.row.status !== 'rejected' && (
            <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
              <Delete fontSize="small" />
            </IconButton>
          )}
          <Tooltip title={t('downloadPdf')}>
            <IconButton size="small" onClick={() => downloadPdf(params.row.id)} sx={{ color: theme.palette.secondary.main, bgcolor: alpha(theme.palette.secondary.main, 0.08) }}>
              <PictureAsPdf fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('upload')}>
            <IconButton size="small" component="label" sx={{ color: '#0891b2', bgcolor: 'rgba(8,145,178,0.08)' }}>
              <UploadFile fontSize="small" />
              <input type="file" hidden onChange={(e: React.ChangeEvent<HTMLInputElement>) => { uploadFile(params.row.id, (e.target.files as FileList)[0]); e.target.value = ''; }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'mar_number', label: t('marNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'specification_ref', label: t('specificationRef') },
    { name: 'manufacturer', label: t('manufacturer') },
    { name: 'material_type', label: t('materialType'), required: true, options: materialTypes.map(m => ({ value: m, label: m })) },
    { name: 'quantity_requested', label: t('quantity'), type: 'number' as const },
    { name: 'unit', label: t('unit'), options: units.map(u => ({ value: u, label: u })) },
    { name: 'submitted_date', label: t('submittedDate'), type: 'date' as const },
    { name: 'required_date', label: t('requiredDate'), type: 'date' as const },
    { name: 'submitted_by', label: t('submittedBy') },
    { name: 'remarks', label: t('remarks'), type: 'textarea' as const },
    { name: 'suppliers', label: t('suppliers') },
  ];

  if (!selectedProjectId) return <DataGridSkeleton />;

  const dataArr = data as Record<string, unknown>[];
  const draftCount = dataArr.filter(r => r.status === 'draft').length;
  const submittedCount = dataArr.filter(r => r.status === 'submitted').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('mar')}
        subtitle="Manage Material Approval Requests with submission, review, and approval workflow"
        icon={<Assignment />}
        accentColor="#f59e0b"
        action={!!selectedProjectId}
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Draft', value: draftCount },
          { label: 'Submitted', value: submittedCount },
          { label: 'Total', value: dataArr.length },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
        </TextField>
      </Stack>

      <Card sx={{ borderTop: '4px solid', borderTopColor: 'secondary.main', boxShadow: '0 0 20px rgba(212,160,48,0.15)', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 0 20px rgba(212,160,48,0.15)' } }}>
        {loading ? <DataGridSkeleton /> : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={dataArr} columns={columns} getRowId={(r: Record<string, unknown>) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data: Record<string, string> = {}; fields.forEach(f => { data[f.name] = fd.get(f.name) as string; }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} MAR` : `${t('create')} MAR`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={f.label} defaultValue={(editItem as Record<string, string>)?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    {f.options.map((o: { value: string; label: string }) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                ) : (
                  <TextField key={f.name} name={f.name} label={f.label} type={f.type === 'date' ? 'date' : 'text'}
                    defaultValue={(editItem as Record<string, string>)?.[f.name] || ''} required={f.required} size="small" fullWidth
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
          <Button color="error" variant="contained" onClick={() => handleDelete(deleteId as number)}>{t('delete')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null })}>
        <DialogTitle>{t('reject')} MAR</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t('rejectionReason')} fullWidth multiline minRows={3}
            value={rejectReason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectReason(e.target.value)} size="small" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, id: null })}>{t('cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleReject}>{t('reject')}</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default MAR;
