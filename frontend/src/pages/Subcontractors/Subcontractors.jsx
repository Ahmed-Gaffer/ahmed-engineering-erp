import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, TextField, Button, Stack, MenuItem } from '@mui/material';
import { Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable/DataTable';
import FormDialog from '../../components/FormDialog/FormDialog';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import EmptyState from '../../components/EmptyState/EmptyState';
import { engineeringApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';

export default function Subcontractors() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ name: '', trade: '', contract_value: '', status: 'active' });

  useEffect(() => { engineeringApi.projects.list().then(r => setProjects(r.data || [])).catch(() => {}); }, []);

  const fetchData = async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); return; }
    setLoading(true);
    try { const r = await engineeringApi.subcontractors.listByProject(selectedProjectId); setData(r.data || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', trade: '', contract_value: '', status: 'active' });
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    setForm({
      name: row.name || '',
      trade: row.trade || '',
      contract_value: row.contract_value?.toString() || '',
      status: row.status || 'active',
    });
    setFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = {
        project_id: Number(selectedProjectId),
        name: formData.name,
        trade: formData.trade || null,
        contract_value: Number(formData.contract_value) || 0,
        status: formData.status,
      };
      if (editItem) await engineeringApi.subcontractors.update(editItem.id, payload);
      else await engineeringApi.subcontractors.create(payload);
      setFormOpen(false);
      fetchData();
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    await engineeringApi.subcontractors.delete(id);
    fetchData();
  };

  const columns = [
    { field: 'name', headerName: t('name'), flex: 1, minWidth: 160 },
    { field: 'trade', headerName: t('trade'), width: 130 },
    { field: 'contract_value', headerName: t('contractValue'), type: 'number', width: 140, renderCell: (p) => <Typography variant="body2" fontWeight={600}>{formatNumber(p.value)}</Typography> },
    { field: 'status', headerName: t('status'), width: 110 },
  ];

  const fields = [
    { name: 'name', label: t('name'), type: 'text', required: true },
    { name: 'trade', label: t('trade'), type: 'text' },
    { name: 'contract_value', label: t('contractValue'), type: 'number' },
    { name: 'status', label: t('status'), type: 'select', options: [{ value: 'active', label: t('active') }, { value: 'suspended', label: t('suspended') }, { value: 'terminated', label: t('terminated') }] },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('subcontractorsPage')}</Typography>
          {selectedProjectId && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>{t('create')}</Button>}
        </Stack>
        <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {!selectedProjectId ? <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} /> : loading ? <DataGridSkeleton /> : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            total={data.length}
            page={1}
            pageSize={20}
            paginationMode="client"
            search=""
            onSearchChange={() => {}}
            onAdd={openCreate}
            onEdit={openEdit}
            onDelete={handleDelete}
            service={{ delete: handleDelete }}
            entityName="subcontractorsPage"
          />
        )}
        <FormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          fields={fields}
          initialValues={editItem}
          title={editItem ? `${t('edit')} ${t('subcontractorsPage')}` : `${t('create')} ${t('subcontractorsPage')}`}
          loading={formLoading}
        />
      </Box>
    </motion.div>
  );
}