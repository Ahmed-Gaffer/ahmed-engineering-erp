import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Tooltip, CircularProgress, Grid, Divider,
} from '@mui/material';
import {
  Add, Delete, Edit, Refresh, Close, Send, RateReview, ThumbUp, ThumbDown, Article,
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

const msStatusColors = {
  draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  submitted: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  under_review: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

export default function MethodStatements() {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project_id') || '');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, id: null, action: '' });
  const [actionData, setActionData] = useState({});
  const [detailItem, setDetailItem] = useState(null);
  const [stats, setStats] = useState(null);

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
        engineeringApi.methodStatements.listByProject(selectedProjectId),
        engineeringApi.methodStatements.stats(selectedProjectId),
      ]);
      setData(listRes.data || []);
      setStats(statsRes.data || null);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { if (selectedProjectId) fetchData(); }, [fetchData, selectedProjectId]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = { ...formData, project_id: Number(selectedProjectId) };
      if (editItem) await engineeringApi.methodStatements.update(editItem.id, payload);
      else await engineeringApi.methodStatements.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.methodStatements.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleWorkflow = async () => {
    try {
      const { id, action } = actionDialog;
      if (action === 'submit') await engineeringApi.methodStatements.submit(id);
      else if (action === 'review') await engineeringApi.methodStatements.review(id, actionData);
      else if (action === 'approve') await engineeringApi.methodStatements.approve(id);
      else if (action === 'reject') await engineeringApi.methodStatements.reject(id, actionData);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setActionDialog({ open: false, id: null, action: '' });
      setActionData({});
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'ms_number', headerName: t('msNumber'), width: 120 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 150 },
    { field: 'status', headerName: t('status'), width: 130,
      renderCell: (params) => {
        const sc = msStatusColors[params.value] || msStatusColors.draft;
        return <Chip label={t(`methodStatementStatus_${params.value}`, params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'version', headerName: t('version'), width: 80 },
    { field: 'prepared_by', headerName: t('preparedBy'), width: 130 },
    { field: 'reviewed_by', headerName: t('reviewedBy'), width: 130 },
    { field: 'approved_by', headerName: t('approvedBy'), width: 130 },
    { field: 'actions', headerName: t('actions'), width: 280, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status === 'draft' && (
            <Tooltip title={t('submit')}>
              <IconButton size="small" onClick={() => { setActionDialog({ open: true, id: params.row.id, action: 'submit' }); }} sx={{ color: '#3b82f6', bgcolor: 'rgba(59,130,246,0.08)' }}>
                <Send fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'submitted' && (
            <Tooltip title={t('review')}>
              <IconButton size="small" onClick={() => { setActionDialog({ open: true, id: params.row.id, action: 'review' }); setActionData({ reviewed_by: '', comments: '' }); }} sx={{ color: '#f59e0b', bgcolor: 'rgba(245,158,11,0.15)' }}>
                <RateReview fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'under_review' && (
            <>
              <Tooltip title={t('approve')}>
                <IconButton size="small" onClick={() => { setActionDialog({ open: true, id: params.row.id, action: 'approve' }); }} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.12)' }}>
                  <ThumbUp fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('reject')}>
                <IconButton size="small" onClick={() => { setActionDialog({ open: true, id: params.row.id, action: 'reject' }); setActionData({ rejection_reason: '' }); }} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
                  <ThumbDown fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {(params.row.status === 'draft' || params.row.status === 'rejected') && (
            <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)' }}>
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
    { name: 'ms_number', label: t('msNumber'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'scope_of_work', label: t('scopeOfWork'), type: 'textarea' },
    { name: 'methodology', label: t('methodology'), type: 'textarea' },
    { name: 'resources_required', label: t('resourcesRequired') },
    { name: 'risks_identified', label: t('risksIdentified'), type: 'textarea' },
    { name: 'referenced_documents', label: t('referencedDocuments'), type: 'textarea' },
  ];

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('methodStatements')} subtitle="Method statements for construction activities" icon={<Article />} />
        <Stack direction="row" spacing={1.5} mb={2.5}>
          <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
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
        title={t('methodStatements')}
        subtitle="Method statements for construction activities"
        icon={<Article />}
        action actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: t('total'), value: stats?.total || 0 },
          { label: t('draft'), value: stats?.by_status?.draft || 0 },
          { label: t('submitted'), value: stats?.by_status?.submitted || 0 },
          { label: t('approved'), value: stats?.by_status?.approved || 0 },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
        </TextField>
        <Button variant="outlined" startIcon={<Refresh />} size="small" onClick={fetchData}>{t('refresh')}</Button>
      </Stack>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={data} columns={columns} getRowId={(r) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
              onRowClick={(params) => setDetailItem(params.row)}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); const data = {}; fields.forEach(f => { data[f.name] = fd.get(f.name); }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} ${t('methodStatement')}` : `${t('create')} ${t('methodStatement')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f) => (
                <TextField key={f.name} name={f.name} label={f.label}
                  defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth
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
          {actionDialog.action === 'submit' ? t('submit') : 
           actionDialog.action === 'review' ? t('review') :
           actionDialog.action === 'approve' ? t('approve') : t('reject')} {t('methodStatement')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {actionDialog.action === 'submit' && (
              <Typography variant="body2" color="text.secondary">{t('confirmSubmit')}</Typography>
            )}
            {actionDialog.action === 'review' && (
              <>
                <TextField label={t('reviewedBy')} size="small" fullWidth
                  value={actionData.reviewed_by || ''} onChange={(e) => setActionData(prev => ({ ...prev, reviewed_by: e.target.value }))} />
                <TextField label={t('comments')} multiline minRows={2} size="small" fullWidth
                  value={actionData.comments || ''} onChange={(e) => setActionData(prev => ({ ...prev, comments: e.target.value }))} />
              </>
            )}
            {actionDialog.action === 'approve' && (
              <Typography variant="body2" color="text.secondary">{t('confirmApprove')}</Typography>
            )}
            {actionDialog.action === 'reject' && (
              <TextField label={t('rejectionReason')} multiline minRows={2} size="small" fullWidth required
                value={actionData.rejection_reason || ''} onChange={(e) => setActionData(prev => ({ ...prev, rejection_reason: e.target.value }))} />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, id: null, action: '' })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleWorkflow}
            color={actionDialog.action === 'reject' ? 'error' : 'primary'}>
            {actionDialog.action === 'submit' ? t('submit') : 
             actionDialog.action === 'review' ? t('review') :
             actionDialog.action === 'approve' ? t('approve') : t('reject')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(detailItem)} onClose={() => setDetailItem(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{detailItem?.ms_number} — {detailItem?.title}</Typography>
            <IconButton size="small" onClick={() => setDetailItem(null)}><Close fontSize="small" /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {detailItem && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">{t('status')}</Typography>
                  <Box mt={0.5}>
                    <Chip label={t(`methodStatementStatus_${detailItem.status}`, detailItem.status)} size="small"
                      sx={{ backgroundColor: (msStatusColors[detailItem.status] || msStatusColors.draft).bg, color: (msStatusColors[detailItem.status] || msStatusColors.draft).color, fontWeight: 500 }} />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">{t('version')}</Typography>
                  <Typography variant="body2">{detailItem.version || '-'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">{t('preparedBy')}</Typography>
                  <Typography variant="body2">{detailItem.prepared_by || '-'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">{t('reviewedBy')}</Typography>
                  <Typography variant="body2">{detailItem.reviewed_by || '-'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">{t('approvedBy')}</Typography>
                  <Typography variant="body2">{detailItem.approved_by || '-'}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>{t('scopeOfWork')}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detailItem.scope_of_work || '-'}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>{t('methodology')}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detailItem.methodology || '-'}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>{t('risksIdentified')}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detailItem.risks_identified || '-'}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>{t('resourcesRequired')}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detailItem.resources_required || '-'}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>{t('referencedDocuments')}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detailItem.referenced_documents || '-'}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailItem(null)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
    </motion.div>
  );
}
