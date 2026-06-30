import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, CardContent, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Alert, Grid, Avatar,
  Tooltip, CircularProgress, Divider, FormControl, InputLabel, Select,
} from '@mui/material';
import {
  Add, Edit, Delete, Search, FilterList, Refresh, CheckCircle, Close,
  Visibility, Assignment, Warning, History, Business, Category, Code,
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

const branchStatusColors = {
  active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  inactive: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const statusOptions = ['active', 'inactive'];

export default function Branches() {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await engineeringApi.branches.list();
      setData(r.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editItem) await engineeringApi.branches.update(editItem.id, formData);
      else await engineeringApi.branches.create(formData);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.branches.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'code', headerName: t('code'), width: 100 },
    { field: 'name', headerName: t('name'), flex: 1.5, minWidth: 150 },
    { field: 'address', headerName: t('address'), flex: 1.5, minWidth: 150 },
    { field: 'phone', headerName: t('phone'), width: 120 },
    { field: 'email', headerName: t('email'), width: 180 },
    { field: 'manager_name', headerName: t('manager'), width: 140 },
    { field: 'status', headerName: t('status'), width: 110,
      renderCell: (params) => {
        const sc = branchStatusColors[params.value] || branchStatusColors.inactive;
        return <Chip label={t(params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'actions', headerName: t('actions'), width: 100, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: '#D97706', bgcolor: 'rgba(217,119,6,0.08)' }}>
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
    { name: 'code', label: t('code') },
    { name: 'address', label: t('address') },
    { name: 'phone', label: t('phone') },
    { name: 'email', label: t('email') },
    { name: 'manager_name', label: t('manager') },
    { name: 'status', label: t('status'), options: statusOptions.map(s => ({ value: s, label: t(s) })) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('branches')}
        subtitle="Manage company branches"
        icon={<Business />}
        action
        actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: 'Total', value: data.length },
          { label: 'Active', value: data.filter(r => r.status === 'active').length },
        ]}
      />
      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={data} columns={columns} getRowId={(r) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); const data = {}; fields.forEach(f => { data[f.name] = fd.get(f.name); }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} ${t('branch')}` : `${t('create')} ${t('branch')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={f.label} defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    {f.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
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
