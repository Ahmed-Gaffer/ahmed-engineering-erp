import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Card, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Tooltip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, Send, CheckCircle, Cancel, Close, Refresh, Assignment, Warning, History, Visibility } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import LoadingButton from '@mui/lab/LoadingButton';
import { engineeringApi, projectsService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '../../stores/authStore';

const inspectionTypes: string[] = ['incoming_material', 'concrete_pouring', 'steel_fixing', 'waterproofing', 'finishing', 'mep', 'soil_test', 'other'];

const InspectionRequests: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const statusColors: Record<string, { bg: string; color: string }> = {
    planned: { bg: alpha(theme.palette.secondary.main, 0.15), color: theme.palette.secondary.main },
    submitted: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
    inspected: { bg: alpha(theme.palette.secondary.main, 0.15), color: theme.palette.secondary.main },
    passed: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
    failed: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
    re_inspection: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<{ id: number; code: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>(searchParams.get('project_id') || '');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [inspectDialog, setInspectDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [inspectFindings, setInspectFindings] = useState('');
  const [inspectResult, setInspectResult] = useState('passed');
  const [reinspectDialog, setReinspectDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [reinspectDate, setReinspectDate] = useState('');

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

  const queryKey = ['inspections', selectedProjectId];

  const { data, isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const r = await engineeringApi.inspections.listByProject(selectedProjectId);
      return r.data || [];
    },
    enabled: !!selectedProjectId,
    placeholderData: [],
  });

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, string>) => engineeringApi.inspections.create({ ...formData, project_id: parseInt(selectedProjectId as string) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); setFormLoading(false); },
    onError: (e: { response?: { data?: { detail?: string } } }) => { enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }); setFormLoading(false); },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: Record<string, string>) => engineeringApi.inspections.update((editItem as { id: number }).id, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); setFormLoading(false); },
    onError: (e: { response?: { data?: { detail?: string } } }) => { enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }); setFormLoading(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => engineeringApi.inspections.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setDeleteId(null); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      if (action === 'submit') await engineeringApi.inspections.submit(id, {});
      else if (action === 'pass') await engineeringApi.inspections.pass(id, {});
      else if (action === 'fail') await engineeringApi.inspections.fail(id, {});
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const inspectMutation = useMutation({
    mutationFn: () => engineeringApi.inspections.inspect(inspectDialog.id, { findings: inspectFindings, result: inspectResult }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setInspectDialog({ open: false, id: null }); setInspectFindings(''); setInspectResult('passed'); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const reinspectMutation = useMutation({
    mutationFn: () => engineeringApi.inspections.scheduleReinspection(reinspectDialog.id, { scheduled_date: reinspectDate }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setReinspectDialog({ open: false, id: null }); setReinspectDate(''); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const handleSubmit = (formData: Record<string, string>) => {
    if (editItem) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  const handleDelete = (id: number) => deleteMutation.mutate(id);

  const handleAction = (id: number, action: string) => actionMutation.mutate({ id, action });

  const handleInspect = () => inspectMutation.mutate();

  const handleReinspect = () => reinspectMutation.mutate();

  const columns = [
    { field: 'inspection_number', headerName: t('inspectionNumber'), width: 110 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'inspection_type', headerName: t('inspectionType'), width: 140 },
    { field: 'location', headerName: t('location'), width: 130 },
    { field: 'status', headerName: t('status'), width: 120,
      renderCell: (params: { value: string }) => {
        const sc = statusColors[params.value] || statusColors.planned;
        const label = t(`inspectionStatus_${params.value}`, params.value);
        return <Chip label={label} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'scheduled_date', headerName: t('scheduledDate'), width: 110, type: 'date' },
    { field: 'inspector_name', headerName: t('inspectorName'), width: 130 },
    { field: 'actions', headerName: t('actions'), width: 300, sortable: false,
      renderCell: (params: { row: { id: number; status: string } }) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'planned' && (
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
            <Tooltip title={t('inspect')}>
              <IconButton size="small" onClick={() => setInspectDialog({ open: true, id: params.row.id })} sx={{ color: theme.palette.secondary.main, bgcolor: alpha(theme.palette.secondary.main, 0.08) }}>
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
    { name: 'description', label: t('description'), type: 'textarea' as const },
    { name: 'scheduled_date', label: t('scheduledDate'), type: 'date' as const },
    { name: 'inspector_name', label: t('inspectorName') },
    { name: 'contractor_name', label: t('contractorName') },
    { name: 'remarks', label: t('remarks'), type: 'textarea' as const },
  ];

  if (!selectedProjectId) return <DataGridSkeleton />;

  const dataArr = data as Record<string, unknown>[];
  const totalCount = dataArr.length;
  const pendingCount = dataArr.filter(r => ['planned', 'submitted', 'inspected'].includes(r.status as string)).length;
  const passedCount = dataArr.filter(r => r.status === 'passed').length;
  const failedCount = dataArr.filter(r => r.status === 'failed').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('inspectionRequests')}
        subtitle="Manage inspection requests with planning, inspection, pass/fail, and re-inspection workflow"
        icon={<CheckCircle />}
        accentColor="#0891b2"
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
          <DialogTitle>{editItem ? `${t('edit')} Inspection Request` : `${t('create')} Inspection Request`}</DialogTitle>
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

      <Dialog open={inspectDialog.open} onClose={() => setInspectDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('inspect')} Inspection</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label={t('result')} value={inspectResult} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInspectResult(e.target.value)} size="small" fullWidth>
              <MenuItem value="passed">{t('passed')}</MenuItem>
              <MenuItem value="failed">{t('failed')}</MenuItem>
            </TextField>
            <TextField label={t('findings')} multiline minRows={3} value={inspectFindings}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInspectFindings(e.target.value)} size="small" fullWidth />
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReinspectDate(e.target.value)} size="small" fullWidth sx={{ mt: 1 }}
            slotProps={{ inputLabel: { shrink: true } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReinspectDialog({ open: false, id: null })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleReinspect}>{t('schedule')}</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default InspectionRequests;
