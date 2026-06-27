import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader/PageHeader';
import DataTable from '../components/DataTable/DataTable';
import FormDialog from '../components/FormDialog/FormDialog';
import DataGridSkeleton from '../components/Skeleton/DataGridSkeleton';
import EmptyState from '../components/EmptyState/EmptyState';
import StatsCard from '../components/StatsCard/StatsCard';
import { Inbox } from '@mui/icons-material';

export default function EntityPage({ service, columns, fields, title, subtitle, stats, icon }) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('project_id');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const debounceRef = useRef(null);
  const searchRef = useRef('');

  const fetchData = async (s) => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize, search: s || undefined };
      if (projectFilter && !isNaN(Number(projectFilter))) params.project_id = Number(projectFilter);
      const res = await service.list(params);
      setData(res.data.items);
      setTotal(res.data.total);
    } catch {
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    searchRef.current = val;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchData(val);
    }, 400);
  };

  useEffect(() => { fetchData(search); }, [page, pageSize, projectFilter]);

  const handleAdd = () => { setEditItem(null); setFormOpen(true); };
  const handleEdit = (row) => { setEditItem(row); setFormOpen(true); };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editItem) await service.update(editItem.id, formData);
      else await service.create(formData);
      setFormOpen(false);
      fetchData();
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Box>
        <PageHeader
          title={t(title)}
          subtitle={subtitle}
          icon={icon}
          action
          actionLabel={t('create')}
          onAction={handleAdd}
          stats={stats}
        />
        {initialLoading ? (
          <DataGridSkeleton />
        ) : (
          <>
            {!loading && data.length === 0 && !search ? (
              <EmptyState
                title={t('noData')}
                description={t('noDataDescription')}
                action
                onAction={handleAdd}
                actionLabel={t('create')}
              />
            ) : (
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                total={total}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                search={search}
                onSearchChange={handleSearchChange}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={fetchData}
                service={service}
                entityName={title}
              />
            )}
          </>
        )}
        <FormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          fields={fields}
          initialValues={editItem}
          title={editItem ? `${t('edit')} ${t(title)}` : `${t('create')} ${t(title)}`}
          loading={formLoading}
        />
      </Box>
    </motion.div>
  );
}
