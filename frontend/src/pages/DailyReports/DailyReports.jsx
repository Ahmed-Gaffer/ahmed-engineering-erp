import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, TextField, Button, Stack, MenuItem } from '@mui/material';
import { Add, EventNote } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import DataTable from '../../components/DataTable/DataTable';
import FormDialog from '../../components/FormDialog/FormDialog';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import EmptyState from '../../components/EmptyState/EmptyState';
import { engineeringApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';

export default function DailyReports() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ report_date: '', weather: '', manpower_count: '', equipment_count: '', work_description: '', issues: '' });

  useEffect(() => { engineeringApi.projects.list().then(r => setProjects(r.data || [])).catch(() => {}); }, []);

  const fetchData = async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); return; }
    setLoading(true);
    try { const r = await engineeringApi.dailyReports.listByProject(selectedProjectId); setData(r.data || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ report_date: '', weather: '', manpower_count: '', equipment_count: '', work_description: '', issues: '' });
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    setForm({
      report_date: row.report_date || '',
      weather: row.weather || '',
      manpower_count: row.manpower_count?.toString() || '',
      equipment_count: row.equipment_count?.toString() || '',
      work_description: row.work_description || '',
      issues: row.issues || '',
    });
    setFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = {
        project_id: Number(selectedProjectId),
        report_date: formData.report_date,
        weather: formData.weather || null,
        manpower_count: Number(formData.manpower_count) || 0,
        equipment_count: Number(formData.equipment_count) || 0,
        work_description: formData.work_description || null,
        issues: formData.issues || null,
      };
      if (editItem) await engineeringApi.dailyReports.update(editItem.id, payload);
      else await engineeringApi.dailyReports.create(payload);
      setFormOpen(false);
      fetchData();
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    await engineeringApi.dailyReports.delete(id);
    fetchData();
  };

  const columns = [
    { field: 'report_date', headerName: t('reportDate'), width: 120, renderCell: (p) => formatDate(p.value) },
    { field: 'weather', headerName: t('weather'), width: 100 },
    { field: 'manpower_count', headerName: t('manpowerCount'), width: 120, type: 'number' },
    { field: 'equipment_count', headerName: t('equipmentCount'), width: 120, type: 'number' },
    { field: 'work_description', headerName: t('workDescription'), flex: 1, minWidth: 200 },
    { field: 'issues', headerName: t('issues'), flex: 0.7, minWidth: 140 },
  ];

  const fields = [
    { name: 'report_date', label: t('reportDate'), type: 'date', required: true },
    { name: 'weather', label: t('weather'), type: 'text' },
    { name: 'manpower_count', label: t('manpowerCount'), type: 'number' },
    { name: 'equipment_count', label: t('equipmentCount'), type: 'number' },
    { name: 'work_description', label: t('workDescription'), type: 'textarea', rows: 3 },
    { name: 'issues', label: t('issues'), type: 'textarea', rows: 2 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <PageHeader
          title={t('dailyReportsPage')}
          subtitle="Record daily site activities, manpower, equipment, and site conditions"
          icon={<EventNote />}
          action={!!selectedProjectId}
          actionLabel={t('create')}
          onAction={openCreate}
          stats={[
            { label: 'Reports', value: data.length },
          ]}
        />
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
            entityName="dailyReportsPage"
          />
        )}
        <FormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          fields={fields}
          initialValues={editItem}
          title={editItem ? `${t('edit')} ${t('dailyReportsPage')}` : `${t('create')} ${t('dailyReportsPage')}`}
          loading={formLoading}
        />
      </Box>
    </motion.div>
  );
}
