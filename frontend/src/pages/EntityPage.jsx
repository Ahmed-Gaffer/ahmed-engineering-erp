import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable/DataTable';
import FormDialog from '../components/FormDialog/FormDialog';
import DataGridSkeleton from '../components/Skeleton/DataGridSkeleton';
import EmptyState from '../components/EmptyState/EmptyState';

export default function EntityPage({ service, columns, fields, title }) {
  const { t } = useTranslation();
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
      const res = await service.list({ page, limit: pageSize, search: s || undefined });
      setData(res.data.items);
      setTotal(res.data.total);
    } catch { } finally { setLoading(false); setInitialLoading(false); }
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

  useEffect(() => { fetchData(search); }, [page, pageSize]);

  const handleAdd = () => { setEditItem(null); setFormOpen(true); };
  const handleEdit = (row) => { setEditItem(row); setFormOpen(true); };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editItem) await service.update(editItem.id, formData);
      else await service.create(formData);
      setFormOpen(false);
      fetchData();
    } finally { setFormLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={3}>{t(title)}</Typography>
        {initialLoading ? (
          <DataGridSkeleton />
        ) : (
          <>
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
            {!loading && data.length === 0 && !search && (
              <EmptyState
                title={t('noData')}
                description={t('noDataDescription')}
                action
                onAction={handleAdd}
                actionLabel={t('create')}
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
