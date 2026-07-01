import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Stack, TextField, MenuItem, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import { EntityTable, StatusChip, DeleteDialog, FormPanel } from '../../components/EntityTable';
import Icon from '../../components/SvgIcon/SvgIcon';
import { engineeringApi, projectsService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '../../stores/authStore';

const submittalTypes: string[] = ['material_approval', 'shop_drawing', 'technical_submittal', 'product_data', 'sample', 'other'];
const priorityOptions: string[] = ['low', 'medium', 'high', 'urgent'];

const actionButton = (label: string, iconName: string, color: string, onClick: () => void) => (
  <Tooltip title={label}>
    <IconButton size="small" onClick={onClick}
      sx={{ color, bgcolor: `${color}14`, width: 28, height: 28, '&:hover': { bgcolor: `${color}22` } }}>
      <Icon name={iconName} size={14} />
    </IconButton>
  </Tooltip>
);

const Submittals: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<{ id: number; code: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>(searchParams.get('project_id') || '');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');

  const isAdmin = user?.role === 'admin';
  const queryKey = ['submittals', selectedProjectId];

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

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const r = await engineeringApi.submittals.listByProject(selectedProjectId);
      return r.data || [];
    },
    enabled: !!selectedProjectId,
  });

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, string>) => engineeringApi.submittals.create({ ...formData, project_id: parseInt(selectedProjectId as string) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); },
    onError: (e: { response?: { data?: { detail?: string } } }) => enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: (formData: Record<string, string>) => engineeringApi.submittals.update((editItem as { id: number }).id, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); },
    onError: (e: { response?: { data?: { detail?: string } } }) => enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => engineeringApi.submittals.delete((deleteTarget as { id: number }).id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setDeleteTarget(null); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      const actions: Record<string, (id: number) => Promise<unknown>> = {
        submit: (id: number) => engineeringApi.submittals.submit(id, {}),
        approve: (id: number) => engineeringApi.submittals.approve(id, {}),
        resubmit: (id: number) => engineeringApi.submittals.resubmit(id, {}),
        close: (id: number) => engineeringApi.submittals.close(id, {}),
      };
      await actions[action](id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => engineeringApi.submittals.reject(rejectDialog.id, { rejection_reason: rejectReason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setRejectDialog({ open: false, id: null }); setRejectReason(''); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const handleSubmit = (formData: Record<string, string>) => {
    if (editItem) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  const handleDelete = () => deleteMutation.mutate();

  const handleAction = (id: number, action: string) => actionMutation.mutate({ id, action });

  const handleReject = () => rejectMutation.mutate();

  const columns = [
    { field: 'submittal_number', label: t('submittalNumber'), width: 110 },
    { field: 'title', label: t('title'), minWidth: 150 },
    { field: 'submittal_type', label: t('submittalType'), width: 140,
      renderCell: ({ value }: { value: string }) => t(`submittalType_${value}`, value),
    },
    { field: 'status', label: t('status'), width: 140,
      renderCell: ({ value }: { value: string }) => <StatusChip status={value} label={t(`submittalStatus_${value}`, value)} />,
    },
    { field: 'priority', label: t('priority'), width: 100,
      renderCell: ({ value }: { value: string }) => <StatusChip status={value} type="priority" label={t(`priority_${value}`, value)} />,
    },
    { field: 'submitted_date', label: t('submittedDate'), width: 110, type: 'date' },
    { field: 'required_date', label: t('requiredDate'), width: 110, type: 'date' },
    { field: 'actions', label: '', width: 200, renderCell: ({ value }: { value: unknown }) => value },
  ];

  const fields = [
    { name: 'submittal_number', label: t('submittalNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'submittal_type', label: t('submittalType'), required: true, options: submittalTypes.map(m => ({ value: m, label: t(`submittalType_${m}`, m) })) },
    { name: 'priority', label: t('priority'), options: priorityOptions.map(p => ({ value: p, label: t(`priority_${p}`, p) })) },
    { name: 'description', label: t('description'), type: 'textarea' as const },
    { name: 'submitted_date', label: t('submittedDate'), type: 'date' as const },
    { name: 'required_date', label: t('requiredDate'), type: 'date' as const },
    { name: 'specification_ref', label: t('specificationRef') },
    { name: 'location', label: t('location') },
    { name: 'remarks', label: t('remarks'), type: 'textarea' as const },
  ];

  const rowsArr = rows as Record<string, unknown>[];
  const totalCount = rowsArr.length;
  const pendingCount = rowsArr.filter(r => ['submitted', 'under_review'].includes(r.status as string)).length;
  const approvedCount = rowsArr.filter(r => r.status === 'approved').length;
  const rejectedCount = rowsArr.filter(r => r.status === 'rejected_with_comments').length;

  const renderActions = (row: Record<string, unknown>) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      {row.status === 'draft' && (
        <>
          {actionButton(t('submit'), 'upload', 'var(--clr-amber-500)', () => handleAction(row.id as number, 'submit'))}
          {actionButton(t('edit'), 'edit', 'var(--clr-gold-500)', () => { setEditItem(row); setFormOpen(true); })}
        </>
      )}
      {['submitted', 'under_review'].includes(row.status as string) && (
        <>
          {actionButton(t('approve'), 'check', 'var(--clr-green-500)', () => handleAction(row.id as number, 'approve'))}
          {actionButton(t('reject'), 'close', 'var(--clr-red-500)', () => setRejectDialog({ open: true, id: row.id as number }))}
        </>
      )}
      {row.status === 'rejected_with_comments' && (
        actionButton(t('resubmit'), 'refresh', 'var(--clr-amber-500)', () => handleAction(row.id as number, 'resubmit'))
      )}
      {row.status === 'approved' && (
        actionButton(t('close'), 'close', 'var(--clr-navy-400)', () => handleAction(row.id as number, 'close'))
      )}
      {isAdmin && !['approved', 'rejected_with_comments', 'closed'].includes(row.status as string) && (
        actionButton(t('delete'), 'trash', 'var(--clr-red-500)', () => setDeleteTarget(row))
      )}
    </Stack>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('submittals')}
        subtitle="Manage submittals with submission, review, approval, and resubmission workflow"
        icon={<Icon name="document" />}
        accentColor="#6366f1"
        action={!!selectedProjectId}
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Total', value: totalCount },
          { label: 'Pending', value: pendingCount },
          { label: 'Approved', value: approvedCount },
          { label: 'Rejected', value: rejectedCount },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
        </TextField>
      </Stack>

      <Box sx={{ border: '1px solid var(--clr-border)', borderRadius: 2, overflow: 'hidden', bgcolor: 'var(--clr-surface)', borderTop: '4px solid', borderTopColor: 'secondary.main', boxShadow: '0 0 20px rgba(212,160,48,0.15)', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 0 20px rgba(212,160,48,0.15)' } }}>
        <EntityTable
          columns={columns}
          rows={rowsArr.map(r => ({ ...r, actions: renderActions(r) }))}
          loading={isLoading}
          total={rowsArr.length}
          emptyMessage="No submittals found"
        />
      </Box>

      <FormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        fields={fields}
        initialValues={editItem || {}}
        onSubmit={handleSubmit}
        title={editItem ? `${t('edit')} Submittal` : `${t('create')} Submittal`}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        title="Delete Submittal"
        message="Are you sure you want to delete this submittal?"
      />

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(239,68,68,0.1)' }}>
              <Icon name="alert" size={18} />
            </Box>
            <Typography fontWeight={700}>Reject Submittal</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <TextField autoFocus margin="dense" label={t('rejectionReason')} fullWidth multiline minRows={3}
            value={rejectReason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectReason(e.target.value)} size="small" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog({ open: false, id: null })} variant="outlined" size="small">Cancel</Button>
          <Button color="error" variant="contained" onClick={handleReject} size="small">Reject</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default Submittals;
