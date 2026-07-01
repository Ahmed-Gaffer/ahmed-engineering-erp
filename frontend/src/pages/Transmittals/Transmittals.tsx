import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Card, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, Send, CheckCircle, Cancel, Close, Refresh, Assignment, Warning, History, ForwardToInbox, Markunread, DoneAll } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import LoadingButton from '@mui/lab/LoadingButton';
import { engineeringApi, projectsService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '../../stores/authStore';

const statusColors: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  sent: { bg: 'rgba(15,23,42,0.2)', color: 'secondary.main' },
  received: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  acknowledged: { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
  closed: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const transmittalTypes = ['submittal', 'document', 'drawing', 'correspondence', 'report', 'other'];
const directionOptions = ['outgoing', 'incoming'];

export default function Transmittals() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s: any) => s.user);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>(searchParams.get('project_id') || '');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sendDialog, setSendDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [sendRecipient, setSendRecipient] = useState('');
  const [receiveDialog, setReceiveDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [receiveNotes, setReceiveNotes] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    projectsService.list({ limit: 100 }).then((r: any) => {
      const items = r.data.items || [];
      setProjects(items);
      const urlPid = searchParams.get('project_id');
      if (urlPid && items.some((p: any) => p.id === Number(urlPid))) {
        setSelectedProjectId(Number(urlPid));
      } else if (items.length && !selectedProjectId) {
        setSelectedProjectId(items[0].id);
      }
    });
  }, []);

  const queryKey = ['transmittals', selectedProjectId];

  const { data, isLoading: loading } = useQuery({
    queryKey,
    queryFn: async (): Promise<any[]> => {
      if (!selectedProjectId) return [];
      const r = await engineeringApi.transmittals.listByProject(selectedProjectId);
      return r.data || [];
    },
    enabled: !!selectedProjectId,
    placeholderData: [],
  });

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, any>) => engineeringApi.transmittals.create({ ...formData, project_id: parseInt(selectedProjectId as string) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); setFormLoading(false); },
    onError: (e: any) => { enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }); setFormLoading(false); },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: Record<string, any>) => engineeringApi.transmittals.update(editItem.id, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setFormOpen(false); setFormLoading(false); },
    onError: (e: any) => { enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' }); setFormLoading(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => engineeringApi.transmittals.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setDeleteId(null); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      if (action === 'acknowledge') await engineeringApi.transmittals.acknowledge(id, {});
      else if (action === 'close') await engineeringApi.transmittals.close(id, {});
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const sendMutation = useMutation({
    mutationFn: () => engineeringApi.transmittals.send(sendDialog.id, { recipient: sendRecipient }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setSendDialog({ open: false, id: null }); setSendRecipient(''); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const receiveMutation = useMutation({
    mutationFn: () => engineeringApi.transmittals.markReceived(receiveDialog.id, { notes: receiveNotes }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); enqueueSnackbar(t('operationSuccess'), { variant: 'success' }); setReceiveDialog({ open: false, id: null }); setReceiveNotes(''); },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const handleSubmit = (formData: Record<string, any>) => {
    if (editItem) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  const handleDelete = (id: number) => deleteMutation.mutate(id);

  const handleAction = (id: number, action: string) => actionMutation.mutate({ id, action });

  const handleSend = () => sendMutation.mutate();

  const handleReceive = () => receiveMutation.mutate();

  const columns = [
    { field: 'transmittal_number', headerName: t('transmittalNumber'), width: 110 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'transmittal_type', headerName: t('transmittalType'), width: 130 },
    { field: 'direction', headerName: t('direction'), width: 100,
      renderCell: (params: any) => {
        const isOutgoing = params.value === 'outgoing';
        return <Chip label={t(`direction_${params.value}`, params.value)} size="small"
          sx={{ backgroundColor: isOutgoing ? `${theme.palette.secondary.main}26` : 'rgba(245,158,11,0.15)',
                 color: isOutgoing ? theme.palette.secondary.main : '#f59e0b', fontWeight: 500 }} />;
      },
    },
    { field: 'sender', headerName: t('sender'), width: 130 },
    { field: 'recipient', headerName: t('recipient'), width: 130 },
    { field: 'status', headerName: t('status'), width: 120,
      renderCell: (params: any) => {
        const sc = statusColors[params.value] || statusColors.draft;
        const label = t(`transmittalStatus_${params.value}`, params.value);
        return <Chip label={label} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'sent_date', headerName: t('sentDate'), width: 110, type: 'date' },
    { field: 'actions', headerName: t('actions'), width: 280, sortable: false,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'draft' && (
            <>
              <Tooltip title={t('send')}>
                <IconButton size="small" onClick={() => setSendDialog({ open: true, id: params.row.id })} sx={{ color: theme.palette.secondary.main, bgcolor: `${theme.palette.secondary.main}15` }}>
                  <ForwardToInbox fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: theme.palette.secondary.main, bgcolor: `${theme.palette.secondary.main}15` }}>
                <Edit fontSize="small" />
              </IconButton>
            </>
          )}
          {params.row.status === 'sent' && (
            <Tooltip title={t('markReceived')}>
              <IconButton size="small" onClick={() => setReceiveDialog({ open: true, id: params.row.id })} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' }}>
                <Markunread fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'received' && (
            <Tooltip title={t('acknowledge')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'acknowledge')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                <DoneAll fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'acknowledged' && (
            <Tooltip title={t('close')}>
              <IconButton size="small" onClick={() => handleAction(params.row.id, 'close')} sx={{ color: '#94a3b8', bgcolor: 'rgba(148,163,184,0.08)' }}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {isAdmin && !['sent', 'received', 'acknowledged', 'closed'].includes(params.row.status) && (
            <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'transmittal_number', label: t('transmittalNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'transmittal_type', label: t('transmittalType'), required: true, options: transmittalTypes.map(m => ({ value: m, label: t(`transmittalType_${m}`, m) })) },
    { name: 'direction', label: t('direction'), required: true, options: directionOptions.map(d => ({ value: d, label: t(`direction_${d}`, d) })) },
    { name: 'sender', label: t('sender') },
    { name: 'recipient', label: t('recipient') },
    { name: 'description', label: t('description'), type: 'textarea' },
    { name: 'sent_date', label: t('sentDate'), type: 'date' },
    { name: 'remarks', label: t('remarks'), type: 'textarea' },
  ];

  if (!selectedProjectId) return <DataGridSkeleton />;

  const totalCount = data?.length || 0;
  const sentCount = (data || []).filter((r: any) => r.status === 'sent').length;
  const receivedCount = (data || []).filter((r: any) => r.status === 'received').length;
  const closedCount = (data || []).filter((r: any) => r.status === 'closed').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('transmittals')}
        subtitle="Manage transmittals with send, receive, acknowledge, and close workflow"
        icon={<Send />}
        accentColor="#14b8a6"
        action={!!selectedProjectId}
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Total', value: totalCount },
          { label: 'Sent', value: sentCount },
          { label: 'Received', value: receivedCount },
          { label: 'Closed', value: closedCount },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e: any) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams as any); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
        </TextField>
      </Stack>

      <Card sx={{ borderTop: '4px solid', borderTopColor: 'secondary.main' }}>
        {loading ? <DataGridSkeleton /> : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={data || []} columns={columns} getRowId={(r: any) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data: Record<string, any> = {}; fields.forEach(f => { data[f.name] = fd.get(f.name); }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} Transmittal` : `${t('create')} Transmittal`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f: any) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={f.label} defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    {f.options.map((o: any) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
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
          <Button color="error" variant="contained" onClick={() => handleDelete(deleteId!)}>{t('delete')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={sendDialog.open} onClose={() => setSendDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('send')} Transmittal</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t('recipient')} fullWidth value={sendRecipient}
            onChange={(e: any) => setSendRecipient(e.target.value)} size="small" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialog({ open: false, id: null })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSend}>{t('send')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={receiveDialog.open} onClose={() => setReceiveDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('markReceived')}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t('notes')} fullWidth multiline minRows={3}
            value={receiveNotes} onChange={(e: any) => setReceiveNotes(e.target.value)} size="small" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiveDialog({ open: false, id: null })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleReceive}>{t('markReceived')}</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
