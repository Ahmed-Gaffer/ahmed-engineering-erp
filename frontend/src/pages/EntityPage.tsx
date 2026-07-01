import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, SxProps, Theme } from '@mui/material';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader/PageHeader';
import DataTable from '../components/DataTable/DataTable';
import FormDialog from '../components/FormDialog/FormDialog';
import DataGridSkeleton from '../components/Skeleton/DataGridSkeleton';
import EmptyState from '../components/EmptyState/EmptyState';
import { Inbox } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface ColumnField {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  minWidth?: number;
  type?: string;
  sortable?: boolean;
  renderCell?: (params: any) => React.ReactNode;
  valueFormatter?: (value: any) => string;
  valueGetter?: (value: any) => any;
  linkTo?: (row: any) => string;
}

interface FieldOption {
  value: string;
  label: string;
}

interface FieldDefinition {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: FieldOption[];
  rows?: number;
}

interface StatsItem {
  label: string;
  value: number;
}

interface ApiService {
  list: (params: any) => Promise<any>;
  create: (data: any) => Promise<any>;
  update: (id: number, data: any) => Promise<any>;
  delete: (id: number) => Promise<any>;
}

interface EntityPageProps {
  service: ApiService;
  columns: ColumnField[];
  fields: FieldDefinition[];
  title: string;
  subtitle?: string;
  stats?: StatsItem[];
  icon?: React.ReactNode;
  accentColor?: string;
}

export default function EntityPage({ service, columns, fields, title, subtitle, stats, icon, accentColor = '#D97706' }: EntityPageProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('project_id');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const queryKey = title ? ['entity', title, { page, pageSize, search, projectFilter }] : ['entity'];

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: pageSize, search: search || undefined };
      if (projectFilter && !isNaN(Number(projectFilter))) params.project_id = Number(projectFilter);
      const res = await service.list(params);
      return { items: res.data.items || [], total: res.data.total || 0 };
    },
    placeholderData: (prev) => prev,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const mutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      if (editItem) await service.update(editItem.id, formData);
      else await service.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setFormOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
    },
    onError: () => enqueueSnackbar(t('operationFailed'), { variant: 'error' }),
  });

  const handleAdd = () => { setEditItem(null); setFormOpen(true); };
  const handleEdit = (row: any) => { setEditItem(row); setFormOpen(true); };
  const handleSubmit = (formData: Record<string, any>) => mutation.mutate(formData);

  const isEmpty = !isLoading && items.length === 0 && !search;

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
          accentColor={accentColor}
        />
        {isLoading ? (
          <DataGridSkeleton />
        ) : isEmpty ? (
          <EmptyState
            title={t('noData')}
            description={t('noDataDescription')}
            action
            onAction={handleAdd}
            actionLabel={t('create')}
            icon={icon}
            accentColor={accentColor}
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            loading={isFetching}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            search={search}
            onSearchChange={handleSearchChange}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={() => queryClient.invalidateQueries({ queryKey })}
            service={service}
            entityName={title}
            accentColor={accentColor}
          />
        )}
        <FormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          fields={fields}
          initialValues={editItem}
          title={editItem ? `${t('edit')} ${t(title)}` : `${t('create')} ${t(title)}`}
          loading={mutation.isPending}
          accentColor={accentColor}
          icon={icon}
        />
      </Box>
    </motion.div>
  );
}
