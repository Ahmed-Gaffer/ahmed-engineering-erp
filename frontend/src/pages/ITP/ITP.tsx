import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Tooltip, CircularProgress,
  Checkbox, FormControlLabel, FormGroup, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add, Delete, Edit, Refresh, CheckCircle, Cancel, Send, RateReview,
  ThumbUp, ThumbDown,
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

const itpStatusColors: Record<string, { bg: string; color: string }> = {
  itpStatus_draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  itpStatus_submitted: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  itpStatus_review: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  itpStatus_approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  itpStatus_rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  itpStatus_archived: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const statusOptions: string[] = ['draft', 'submitted', 'review', 'approved', 'rejected', 'archived'];

const ITP: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<{ id: number; code: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>(searchParams.get('project_id') || '');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; id: number | null; action: string }>({ open: false, id: null, action: '' });
  const [actionData, setActionData] = useState<Record<string, unknown>>({});
  const [itpItems, setItpItems] = useState<Record<string, unknown>[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    engineeringApi.projects.list().then((r: { data: { id: number; code: string; name: string }[] }) => {
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
        engineeringApi.itps.listByProject(selectedProjectId),
        engineeringApi.itps.stats(selectedProjectId),
      ]);
      setData(listRes.data || []);
      setStats(statsRes.data || null);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { if (selectedProjectId) fetchData(); }, [fetchData, selectedProjectId]);

  const handleSubmit = async (formData: Record<string, string>) => {
    setFormLoading(true);
    try {
      const payload = { ...formData, project_id: Number(selectedProjectId) };
      if (editItem) await engineeringApi.itps.update((editItem as { id: number }).id, payload);
      else await engineeringApi.itps.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e: { response?: { data?: { detail?: string } } }) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await engineeringApi.itps.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleWorkflow = async () => {
    try {
      const { id, action } = actionDialog;
      if (action === 'submit') await engineeringApi.itps.submit(id as number);
      else if (action === 'review') {
        const payload = { approved_item_ids: (actionData.approved_item_ids as number[]) || [], comments: (actionData.comments as string) || '' };
        await engineeringApi.itps.review(id as number, payload);
      } else if (action === 'approve') await engineeringApi.itps.approve(id as number);
      else if (action === 'reject') await engineeringApi.itps.reject(id as number);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setActionDialog({ open: false, id: null, action: '' });
      setActionData({});
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const openActionDialog = (id: number, action: string) => {
    setActionDialog({ open: true, id, action });
    if (action === 'review') {
      engineeringApi.itps.get(id).then((r: { data?: { items?: Record<string, unknown>[] } }) => {
        const items = r.data?.items || [];
        setItpItems(items);
        setActionData({ approved_item_ids: items.map((i: { id: number }) => i.id), comments: '' });
      }).catch(() => setItpItems([]));
    } else {
      setActionData({});
    }
  };

  const handleToggleItem = (itemId: number) => {
    setActionData((prev: Record<string, unknown>) => {
      const ids = (prev.approved_item_ids as number[]) || [];
      return {
        ...prev,
        approved_item_ids: ids.includes(itemId) ? ids.filter(i => i !== itemId) : [...ids, itemId],
      };
    });
  };

  const columns = [
    { field: 'itp_number', headerName: t('itpNumber'), width: 130 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'location', headerName: t('location'), width: 160 },
    {
      field: 'status', headerName: t('status'), width: 120,
      renderCell: (params: { value: string }) => {
        const sc = itpStatusColors[`itpStatus_${params.value}`] || itpStatusColors.itpStatus_draft;
        return <Chip label={t(`itpStatus_${params.value}`, params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'version', headerName: t('version'), width: 80 },
    { field: 'prepared_by', headerName: t('preparedBy'), width: 130 },
    {
      field: 'actions', headerName: t('actions'), width: 240, sortable: false,
      renderCell: (params: { row: { id: number; status: string } }) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'draft' && (
            <Tooltip title={t('submit')}>
              <IconButton size="small" onClick={() => openActionDialog(params.row.id, 'submit')} sx={{ color: '#3b82f6', bgcolor: 'rgba(59,130,246,0.08)' }}>
                <Send fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'submitted' && (
            <Tooltip title={t('review')}>
              <IconButton size="small" onClick={() => openActionDialog(params.row.id, 'review')} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.12)' }}>
                <RateReview fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'review' && (
            <>
              <Tooltip title={t('approve')}>
                <IconButton size="small" onClick={() => openActionDialog(params.row.id, 'approve')} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
                  <ThumbUp fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('reject')}>
                <IconButton size="small" onClick={() => openActionDialog(params.row.id, 'reject')} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
                  <ThumbDown fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.status === 'draft' && (
            <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: theme.palette.secondary.main, bgcolor: alpha(theme.palette.secondary.main, 0.08) }}>
              <Edit fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'itp_number', label: t('itpNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'description', label: t('description'), type: 'textarea' as const },
    { name: 'location', label: t('location') },
    { name: 'prepared_by', label: t('preparedBy') },
  ];

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('itp')} subtitle="Inspection Test Plan management" icon={<Assignment />} />
        <Stack direction="row" spacing={1.5} mb={2.5}>
          <TextField select size="small" value={selectedProjectId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
            sx={{ minWidth: 240 }}>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
          </TextField>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('itp')}
        subtitle="Inspection Test Plan — ITP management"
        icon={<Assignment />}
        action actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: t('total'), value: (stats as { total?: number })?.total || 0 },
          { label: t('approved'), value: ((stats as { by_status?: Record<string, number> })?.by_status?.approved) || 0 },
          { label: t('rejected'), value: ((stats as { by_status?: Record<string, number> })?.by_status?.rejected) || 0 },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
        </TextField>
        <Button variant="outlined" startIcon={<Refresh />} size="small" onClick={fetchData}>{t('refresh')}</Button>
      </Stack>

      <Card sx={{ borderTop: '4px solid', borderTopColor: 'secondary.main', boxShadow: '0 0 20px rgba(212,160,48,0.15)', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 0 20px rgba(212,160,48,0.15)' } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={data} columns={columns} getRowId={(r: Record<string, unknown>) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data: Record<string, string> = {}; fields.forEach(f => { data[f.name] = fd.get(f.name) as string; }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} ${t('itp')}` : `${t('create')} ${t('itp')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f) => (
                <TextField key={f.name} name={f.name} label={f.label}
                  defaultValue={(editItem as Record<string, string>)?.[f.name] || ''} required={f.required} size="small" fullWidth
                  multiline={f.type === 'textarea'} minRows={f.type === 'textarea' ? 3 : undefined}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="contained" disabled={formLoading}>{formLoading ? t('saving') : t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, id: null, action: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.action === 'submit' && t('submit')}
          {actionDialog.action === 'review' && t('review')}
          {actionDialog.action === 'approve' && t('approve')}
          {actionDialog.action === 'reject' && t('reject')}
          {' '}{t('itp')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {actionDialog.action === 'review' && (
              <>
                <Typography variant="subtitle2">{t('reviewItems')}</Typography>
                <FormGroup>
                  {itpItems.map((item: { id: number; item_number?: string; description?: string }) => (
                    <FormControlLabel key={item.id}
                      control={<Checkbox checked={((actionData.approved_item_ids as number[]) || []).includes(item.id)} onChange={() => handleToggleItem(item.id)} size="small" />}
                      label={<Typography variant="body2">{item.item_number} — {item.description}</Typography>}
                    />
                  ))}
                </FormGroup>
                <TextField label={t('comments')} multiline minRows={2} size="small" fullWidth
                  value={actionData.comments as string || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionData((prev: Record<string, unknown>) => ({ ...prev, comments: e.target.value }))} />
              </>
            )}
            {(actionDialog.action === 'approve' || actionDialog.action === 'reject') && (
              <Typography>{t('confirmWorkflowAction', { action: t(actionDialog.action) })}</Typography>
            )}
            {actionDialog.action === 'submit' && (
              <Typography>{t('confirmSubmit')}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, id: null, action: '' })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleWorkflow}>
            {actionDialog.action === 'submit' && t('submit')}
            {actionDialog.action === 'review' && t('review')}
            {actionDialog.action === 'approve' && t('approve')}
            {actionDialog.action === 'reject' && t('reject')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId as number)} />
    </motion.div>
  );
};

export default ITP;
