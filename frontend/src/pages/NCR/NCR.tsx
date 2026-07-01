import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box, Card, Stack, Button, IconButton, Tooltip, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Send, CheckCircle, Cancel, Flag, Warning } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import { engineeringApi, projectsService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '../../stores/authStore';

const severityColors: Record<string, string> = { minor: 'info', major: 'warning', critical: 'error' };

const statusFlow: Record<string, string[]> = {
  open: ['investigate', 'reject'],
  investigation: ['apply_action', 'reject'],
  corrective_action: ['close'],
  closed: [],
  rejected: [],
};

const NCR: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const statusColors: Record<string, { bg: string; color: string }> = {
    open: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
    investigation: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
    corrective_action: { bg: alpha(theme.palette.secondary.main, 0.15), color: theme.palette.secondary.main },
    closed: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
    rejected: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<{ id: number; code?: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>(searchParams.get('project_id') || '');
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; ncr: Record<string, unknown> | null }>({ open: false, ncr: null });
  const [actionText, setActionText] = useState<{ corrective: string; preventive: string }>({ corrective: '', preventive: '' });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    projectsService.list({ limit: 100 }).then((r: { data: { items: { id: number; code?: string; name: string }[] } }) => {
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

  const queryKey = ['ncr', selectedProjectId];

  const { data: rows, isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const r = await engineeringApi.ncr.listByProject(selectedProjectId);
      return r.data || [];
    },
    enabled: !!selectedProjectId,
    placeholderData: [],
  });

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, string>) => engineeringApi.ncr.create({ ...formData, project_id: parseInt(selectedProjectId as string) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); },
    onError: (e: { response?: { data?: { detail?: string } } }) => enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: (formData: Record<string, string>) => engineeringApi.ncr.update((editRow as { id: number }).id, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); },
    onError: (e: { response?: { data?: { detail?: string } } }) => enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => engineeringApi.ncr.delete(deleteId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setDeleteId(null); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ ncrId, action }: { ncrId: number; action: string }) => {
      if (action === 'investigate') await engineeringApi.ncr.investigate(ncrId);
      else if (action === 'close') await engineeringApi.ncr.close(ncrId, { closed_date: new Date().toISOString().split('T')[0] });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ ncrId, reason }: { ncrId: number; reason: string }) => engineeringApi.ncr.reject(ncrId, { rejection_reason: reason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const applyActionMutation = useMutation({
    mutationFn: () => engineeringApi.ncr.applyAction((actionDialog.ncr as { id: number }).id, {
      corrective_action: actionText.corrective,
      preventive_action: actionText.preventive,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setActionDialog({ open: false, ncr: null }); setActionText({ corrective: '', preventive: '' }); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const handleSubmit = (formData: Record<string, string>) => {
    if (editRow) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  const handleDelete = () => deleteMutation.mutate();

  const handleAction = (ncrId: number, action: string) => {
    if (action === 'reject') {
      const reason = prompt(t('rejectionReason'));
      if (!reason) return;
      rejectMutation.mutate({ ncrId, reason });
    } else {
      actionMutation.mutate({ ncrId, action });
    }
  };

  const handleApplyAction = () => applyActionMutation.mutate();

  const openCount = (rows as Record<string, unknown>[]).filter(r => r.status === 'open').length;
  const criticalCount = (rows as Record<string, unknown>[]).filter(r => r.severity === 'critical' && r.status !== 'closed' && r.status !== 'rejected').length;

  const columns = [
    { field: 'ncr_number', headerName: 'ncrNumber', width: 110 },
    { field: 'title', headerName: 'title', flex: 1.5, minWidth: 150 },
    {
      field: 'severity', headerName: 'severity', width: 90,
      renderCell: (params: { value: string }) => <Chip label={t(params.value)} size="small" color={(severityColors[params.value] as 'info' | 'warning' | 'error') || 'default'} />,
    },
    {
      field: 'status', headerName: 'status', width: 120,
      renderCell: (params: { value: string }) => {
        const sc = statusColors[params.value] || statusColors.open;
        return <Chip label={t(`ncrStatus_${params.value}`)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500, borderRadius: 1 }} />;
      },
    },
    { field: 'source', headerName: 'source', width: 90 },
    { field: 'identified_date', headerName: 'identifiedDate', width: 110, type: 'date' },
    { field: 'location', headerName: 'location', width: 120 },
    {
      field: 'actions', headerName: 'actions', width: 200, sortable: false,
      renderCell: (params: { row: { id: number; status: string; corrective_action?: string; preventive_action?: string } }) => {
        const actions = statusFlow[params.row.status] || [];
        return (
          <Stack direction="row" spacing={0.5}>
            {actions.includes('investigate') && (
              <Tooltip title={t('investigate')}>
                <IconButton size="small" sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.12)', '&:hover': { bgcolor: 'rgba(245,158,11,0.2)' } }} onClick={() => handleAction(params.row.id, 'investigate')}>
                  <Send fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {actions.includes('apply_action') && (
              <Tooltip title={t('applyAction')}>
                <IconButton size="small" sx={{ color: theme.palette.secondary.main, bgcolor: alpha(theme.palette.secondary.main, 0.12), '&:hover': { bgcolor: alpha(theme.palette.common?.dark || '#0a0f1e', 0.2) } }} onClick={() => {
                  setActionDialog({ open: true, ncr: params.row });
                  setActionText({ corrective: params.row.corrective_action || '', preventive: params.row.preventive_action || '' });
                }}>
                  <Flag fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {actions.includes('close') && (
              <Tooltip title={t('close')}>
                <IconButton size="small" sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.12)', '&:hover': { bgcolor: 'rgba(16,185,129,0.2)' } }} onClick={() => handleAction(params.row.id, 'close')}>
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {actions.includes('reject') && (
              <Tooltip title={t('reject')}>
                <IconButton size="small" sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.12)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }} onClick={() => handleAction(params.row.id, 'reject')}>
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isAdmin && (
              <IconButton size="small" color="error" onClick={() => setDeleteId(params.row.id)}>
                <Cancel fontSize="small" />
              </IconButton>
            )}
          </Stack>
        );
      },
    },
  ];

  const formFields = [
    { name: 'ncr_number', label: 'ncrNumber', required: true },
    { name: 'title', label: 'title', required: true },
    { name: 'description', label: 'description', type: 'textarea' as const },
    { name: 'location', label: 'location' },
    { name: 'category', label: 'category', options: [{ value: 'material', label: 'material' }, { value: 'workmanship', label: 'workmanship' }, { value: 'design', label: 'design' }, { value: 'safety', label: 'safety' }, { value: 'other', label: 'other' }] },
    { name: 'severity', label: 'severity', required: true, options: [{ value: 'minor', label: 'minor' }, { value: 'major', label: 'major' }, { value: 'critical', label: 'critical' }] },
    { name: 'source', label: 'source', options: [{ value: 'inspection', label: 'inspection' }, { value: 'test', label: 'test' }, { value: 'client', label: 'client' }, { value: 'internal', label: 'internal' }] },
    { name: 'identified_date', label: 'identifiedDate', type: 'date' as const },
    { name: 'identified_by', label: 'identifiedBy' },
  ];

  if (!selectedProjectId) return <DataGridSkeleton />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('ncr')}
        subtitle="Track and resolve non-conformance reports with corrective/preventive actions"
        icon={<Warning />}
        accentColor="#ef4444"
        action
        actionLabel={t('createNcr')}
        onAction={() => { setEditRow(null); setFormOpen(true); }}
        stats={[
          { label: 'Open', value: openCount },
          { label: 'Critical', value: criticalCount },
          { label: 'Total', value: (rows as Record<string, unknown>[]).length },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }} sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code || p.name} — {p.name}</MenuItem>)}
        </TextField>
        {openCount > 0 && (
          <Chip label={`${openCount} open NCRs`} color="warning" size="small" variant="outlined" />
        )}
        {criticalCount > 0 && (
          <Chip label={`${criticalCount} critical`} color="error" size="small" variant="outlined" />
        )}
      </Stack>
      <Card sx={{ borderTop: '4px solid', borderTopColor: 'secondary.main', boxShadow: '0 0 20px rgba(212,160,48,0.15)', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 0 20px rgba(212,160,48,0.15)' } }}>
        {loading ? <DataGridSkeleton /> : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={rows as Record<string, unknown>[]} columns={columns} getRowId={(r: Record<string, unknown>) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
              sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const fd = new FormData(e.target as HTMLFormElement);
          const data: Record<string, string> = {};
          formFields.forEach(f => { data[f.name] = fd.get(f.name) as string; });
          handleSubmit(data);
        }}>
          <DialogTitle>{editRow ? t('editNcr') : t('createNcr')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {formFields.map((f) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={t(f.label)} defaultValue={(editRow as Record<string, string>)?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    {f.options.map((o: { value: string; label: string }) => <MenuItem key={o.value} value={o.value}>{t(o.label)}</MenuItem>)}
                  </TextField>
                ) : (
                  <TextField key={f.name} name={f.name} label={t(f.label)} type={f.type === 'date' ? 'date' : 'text'}
                    defaultValue={(editRow as Record<string, string>)?.[f.name] || ''} required={f.required} size="small" fullWidth
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionText({ ...actionText, corrective: e.target.value })} />
            <TextField label={t('preventiveAction')} multiline minRows={3} fullWidth value={actionText.preventive}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionText({ ...actionText, preventive: e.target.value })} />
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
};

export default NCR;
