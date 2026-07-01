import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import {
  Box, Typography, Stack, Card, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, CircularProgress,
} from '@mui/material';
import {
  Edit, Delete, Category,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { engineeringApi } from '../../services/api';
import { formatDate, statusColors } from '../../utils/helpers';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import PageHeader from '../../components/PageHeader/PageHeader';

const typeOptions = ['sector', 'region', 'division'];

const typeColors: Record<string, { bg: string; color: string }> = {
  sector: { bg: 'rgba(217,119,6,0.15)', color: 'secondary.main' },
  region: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  division: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
};

export default function Categories() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await engineeringApi.categories.list(typeFilter || undefined);
      setData(r.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (formData: Record<string, any>) => {
    setFormLoading(true);
    try {
      if (editItem) await engineeringApi.categories.update(editItem.id, formData);
      else await engineeringApi.categories.create(formData);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e: any) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await engineeringApi.categories.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'name', headerName: t('name'), flex: 1.5, minWidth: 150 },
    { field: 'type', headerName: t('type'), width: 120,
      renderCell: (params: any) => {
        const tc = typeColors[params.value] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
        return <Chip label={t(params.value)} size="small" sx={{ backgroundColor: tc.bg, color: tc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'color', headerName: t('color'), width: 80,
      renderCell: (params: any) => params.value ? (
        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: params.value, border: '2px solid', borderColor: 'divider' }} />
      ) : null,
    },
    { field: 'description', headerName: t('description'), flex: 2, minWidth: 200 },
    { field: 'actions', headerName: t('actions'), width: 100, sortable: false,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: theme.palette.secondary.main, bgcolor: `${theme.palette.secondary.main}15` }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'name', label: t('name'), required: true },
    { name: 'type', label: t('type'), options: typeOptions.map(s => ({ value: s, label: t(s) })) },
    { name: 'color', label: t('color'), type: 'color' },
    { name: 'description', label: t('description'), type: 'textarea' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('categories')}
        subtitle="Manage project categories (sectors, regions, divisions)"
        icon={<Category />}
        action
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Total', value: data.length },
          ...typeOptions.map(tp => ({ label: tp, value: data.filter(r => r.type === tp).length })),
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={typeFilter} onChange={(e: any) => setTypeFilter(e.target.value)} sx={{ minWidth: 200 }} label={t('filterByType')}>
          <MenuItem value="">{t('all')}</MenuItem>
          {typeOptions.map((tp) => <MenuItem key={tp} value={tp}>{t(tp)}</MenuItem>)}
        </TextField>
      </Stack>
      <Card sx={{ borderTop: '4px solid', borderTopColor: 'secondary.main' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={data} columns={columns} getRowId={(r: any) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data: Record<string, any> = {}; fields.forEach(f => { data[f.name] = fd.get(f.name); }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} ${t('category')}` : `${t('create')} ${t('category')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f: any) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={f.label} defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    {f.options.map((o: any) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                ) : f.type === 'color' ? (
                  <TextField key={f.name} name={f.name} label={f.label} type="color"
                    defaultValue={editItem?.[f.name] || '#D97706'} size="small" fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
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

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId!)} />
    </motion.div>
  );
}
