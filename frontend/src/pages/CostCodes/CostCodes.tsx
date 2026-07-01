import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, useTheme,
  CircularProgress, Divider,
} from '@mui/material';
import {
  Add, Edit, Delete, Code,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { engineeringApi } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import PageHeader from '../../components/PageHeader/PageHeader';

const costCodeStatusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  inactive: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const statusOptions = ['active', 'inactive'];

export default function CostCodes() {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | string>(searchParams.get('project_id') || '');
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [parentOptions, setParentOptions] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    engineeringApi.projects.list().then((r) => {
      const items = r.data || [];
      setProjects(items);
      const urlPid = searchParams.get('project_id');
      if (urlPid && items.some((p: Record<string, unknown>) => p.id === Number(urlPid))) {
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
      const r = await engineeringApi.costCodes.listByProject(selectedProjectId);
      setData(r.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { if (selectedProjectId) fetchData(); }, [fetchData, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      engineeringApi.costCodes.listByProject(selectedProjectId).then(r => setParentOptions(r.data || [])).catch(() => {});
    }
  }, [selectedProjectId]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      const payload: Record<string, unknown> = { ...formData, project_id: Number(selectedProjectId), level: Number(formData.level) || 0, budget_amount: Number(formData.budget_amount) || 0, parent_id: formData.parent_id ? Number(formData.parent_id) : null };
      if (editItem) await engineeringApi.costCodes.update(editItem.id as number, payload);
      else await engineeringApi.costCodes.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e: unknown) {
      const errorResponse = e as { response?: { data?: { detail?: string } } };
      enqueueSnackbar(errorResponse.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    try {
      await engineeringApi.costCodes.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'code', headerName: t('code'), width: 110 },
    { field: 'name', headerName: t('name'), flex: 1.5, minWidth: 150 },
    { field: 'description', headerName: t('description'), flex: 1.5, minWidth: 150 },
    { field: 'parent_id', headerName: t('parent'), width: 120,
      renderCell: (params: { value: number }) => {
        if (!params.value) return null;
        const parent = data.find(d => d.id === params.value);
        return parent ? <Chip label={parent.code as string} size="small" variant="outlined" sx={{ fontWeight: 500 }} /> : null;
      },
    },
    { field: 'level', headerName: t('level'), width: 70, type: 'number' },
    { field: 'budget_amount', headerName: t('budgetAmount'), width: 130, type: 'number',
      renderCell: (params: { value: number }) => params.value != null ? <Typography variant="body2" fontWeight={600}>{Number(params.value).toLocaleString()}</Typography> : null,
    },
    { field: 'status', headerName: t('status'), width: 110,
      renderCell: (params: { value: string }) => {
        const sc = costCodeStatusColors[params.value] || costCodeStatusColors.inactive;
        return <Chip label={t(params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'actions', headerName: t('actions'), width: 100, sortable: false,
      renderCell: (params: { row: Record<string, unknown> }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: theme.palette.secondary.main, bgcolor: `${theme.palette.secondary.main}14` }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleteId(params.row.id as number)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'code', label: t('code'), required: true },
    { name: 'name', label: t('name'), required: true },
    { name: 'description', label: t('description'), type: 'textarea' },
    { name: 'parent_id', label: t('parent'), options: parentOptions.filter(p => p.id !== editItem?.id).map(p => ({ value: p.id, label: `${p.code} - ${p.name}` })) },
    { name: 'level', label: t('level'), type: 'number' },
    { name: 'budget_amount', label: t('budgetAmount'), type: 'number' },
    { name: 'status', label: t('status'), options: statusOptions.map(s => ({ value: s, label: t(s) })) },
  ];

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('costCodes')} subtitle="Manage cost codes per project" icon={<Code />} />
        <Stack direction="row" spacing={1.5} mb={2.5}>
          <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value as string); setSearchParams(p, { replace: true }); }}
            sx={{ minWidth: 240 }}>
            {projects.map((p) => <MenuItem key={p.id as number} value={p.id as number}>{p.code as string} — {p.name as string}</MenuItem>)}
          </TextField>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('costCodes')}
        subtitle="Manage cost codes per project"
        icon={<Code />}
        action
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Total', value: data.length },
          { label: 'Active', value: data.filter(r => r.status === 'active').length },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value as string); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id as number} value={p.id as number}>{p.code as string} — {p.name as string}</MenuItem>)}
        </TextField>
      </Stack>

      <Card sx={{ borderTop: '3px solid', borderTopColor: 'secondary.main', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
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
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const data: Record<string, unknown> = {}; fields.forEach(f => { data[f.name] = fd.get(f.name); }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} ${t('costCode')}` : `${t('create')} ${t('costCode')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={f.label} defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    <MenuItem value="">{t('none')}</MenuItem>
                    {(f.options as Array<{ value: unknown; label: string }>).map((o) => <MenuItem key={String(o.value)} value={o.value as string}>{o.label}</MenuItem>)}
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
            <Button type="submit" variant="contained" disabled={formLoading}>{formLoading ? t('saving') : t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
    </motion.div>
  );
}
