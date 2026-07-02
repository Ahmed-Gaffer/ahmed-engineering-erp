import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, TextField, Button, Stack, IconButton, Chip, Typography, Divider, Link, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, SearchOutlined, FilterList, Visibility } from '@mui/icons-material';
import { statusColors, formatNumber, formatDate } from '../../utils/helpers';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { useSnackbar } from 'notistack';

interface Column {
  field: string;
  headerName?: string;
  type?: string;
  flex?: number;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  linkTo?: string | ((row: any) => string);
  renderCell?: (params: { row: any; value: any }) => React.ReactNode;
  [key: string]: any;
}

interface Service {
  delete: (id: any) => Promise<any>;
  bulkDelete?: (ids: any[]) => Promise<any>;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  onAdd?: () => void;
  onEdit?: (row: any) => void;
  onView?: (row: any) => void;
  onDelete?: () => void;
  onBulkDelete?: () => void;
  service?: Service;
  paginationMode?: 'server' | 'client';
  accentColor?: string;
}

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const ModernChip = ({ value }: { value?: string }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!value) return <Chip label="-" size="small" variant="outlined" sx={{ opacity: 0.5 }} />;
  const color = statusColors[value] || 'default';
  const chipColors: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
    success: { bg: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.12)', text: isDark ? '#6ee7b7' : '#059669', border: isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.25)', shadow: '0 1px 3px rgba(16,185,129,0.15)' },
    primary: { bg: isDark ? 'rgba(217,119,6,0.25)' : 'rgba(217,119,6,0.12)', text: isDark ? '#F59E0B' : '#92400E', border: isDark ? 'rgba(217,119,6,0.35)' : 'rgba(217,119,6,0.25)', shadow: '0 1px 3px rgba(217,119,6,0.15)' },
    warning: { bg: isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.12)', text: isDark ? '#fcd34d' : '#b45309', border: isDark ? 'rgba(245,158,11,0.35)' : 'rgba(245,158,11,0.25)', shadow: '0 1px 3px rgba(245,158,11,0.15)' },
    error: { bg: isDark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.12)', text: isDark ? '#fca5a5' : '#dc2626', border: isDark ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.25)', shadow: '0 1px 3px rgba(239,68,68,0.15)' },
    info: { bg: isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.12)', text: isDark ? '#93c5fd' : '#2563eb', border: isDark ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.25)', shadow: '0 1px 3px rgba(59,130,246,0.15)' },
    default: { bg: isDark ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.12)', text: isDark ? '#cbd5e1' : '#475569', border: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.25)', shadow: '0 1px 3px rgba(100,116,139,0.15)' },
  };
  const cc = chipColors[color] || chipColors.default;
  return (
    <Chip
      label={value}
      size="small"
      sx={{ backgroundColor: cc.bg, color: cc.text, border: `1px solid ${cc.border}`, boxShadow: cc.shadow, fontWeight: 500, borderRadius: 1 }}
    />
  );
};

export default function DataTable({
  columns: baseColumns,
  data,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onBulkDelete,
  service,
  paginationMode = 'server',
  accentColor = '#D97706',
}: DataTableProps) {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selected, setSelected] = useState<any[]>([]);
  const [clientPage, setClientPage] = useState(0);
  const [clientPageSize, setClientPageSize] = useState(20);
  const selectionModel = useMemo(() => ({ type: 'include' as const, ids: new Set(selected) }), [selected]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);

  const columns = [
    ...baseColumns.map((col) => ({
      ...col,
      ...(col.type === 'date' ? { valueGetter: (value: any) => value ? new Date(value) : null } : {}),
      headerName: t(col.headerName || col.field) || col.headerName,
      flex: col.flex || (col.width ? undefined : 1),
      minWidth: col.minWidth || (col.width ? undefined : 120),
      renderCell: col.renderCell || ((params: { row: any; value: any }) => {
        if (col.type === 'number' && params.value != null) return <Typography variant="body2" fontWeight={500}>{formatNumber(params.value)}</Typography>;
        if (col.type === 'date' && params.value) return <Typography variant="body2">{formatDate(params.value)}</Typography>;
        if (col.field === 'status') {
          return <ModernChip value={params.value} />;
        }
        if (col.linkTo && params.value != null) {
          const url = typeof col.linkTo === 'function' ? col.linkTo(params.row) : col.linkTo;
          return <Link component="button" variant="body2" underline="hover" fontWeight={500}
            onClick={() => navigate(url)}>{params.value}</Link>;
        }
        return <Typography variant="body2">{params.value ?? '-'}</Typography>;
      }),
    })),
    {
      field: 'actions',
      headerName: t('actions'),
      width: 150,
      sortable: false,
      renderCell: (params: { row: any }) => (
        <Stack direction="row" spacing={0.5}>
          {onView && (
            <Tooltip title={t('view')}>
              <IconButton size="medium" onClick={() => onView(params.row)} sx={{ color: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', '&:hover': { backgroundColor: 'rgba(59,130,246,0.16)' } }}>
                <Visibility fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('edit')}>
            <IconButton size="medium" onClick={() => onEdit?.(params.row)} sx={{ color: '#D97706', backgroundColor: 'rgba(217,119,6,0.08)', '&:hover': { backgroundColor: 'rgba(217,119,6,0.16)' } }}>
              <Edit fontSize="medium" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton size="medium" onClick={() => { setDeleteId(params.row.id); setDeleteOpen(true); }} sx={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', '&:hover': { backgroundColor: 'rgba(239,68,68,0.16)' } }}>
              <Delete fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleDelete = async () => {
    try {
      if (deleteId && service) await service.delete(deleteId);
      setDeleteOpen(false);
      setDeleteId(null);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      onDelete?.();
    } catch {
      enqueueSnackbar(t('operationFailed'), { variant: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (service?.bulkDelete) await service.bulkDelete(selected);
      setSelected([]);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      onDelete?.();
    } catch {
      enqueueSnackbar(t('operationFailed'), { variant: 'error' });
    }
  };

  return (
    <Card sx={{ overflow: 'visible', borderTop: `2px solid ${accentColor}` }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2 }, pb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
          <Stack direction="row" alignItems="center" spacing={2} flex={1}>
            <TextField
              size="small"
              placeholder={t('search')}
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                },
              }}
              sx={{ minWidth: { xs: '100%', sm: 280 }, maxWidth: { xs: '100%', sm: 400 } }}
            />
            <Button size="small" variant="text" color="inherit" startIcon={<FilterList fontSize="small" />} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              {t('filter')}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1}>
            {selected.length > 0 && (
              <Button variant="outlined" color="error" size="small" onClick={handleBulkDelete}>
                {t('delete')} ({selected.length})
              </Button>
            )}

            {onAdd && (
              <Button variant="contained" startIcon={<Add />} onClick={onAdd} size="small">
                {t('create')}
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
      <Divider />
      <Box sx={{ height: { xs: isMobile ? 400 : 380, sm: 550 }, px: 0.5 }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          density="compact"
          rowCount={paginationMode === 'server' ? total : undefined}
          getRowId={(r) => r.id}
          pageSizeOptions={[10, 20, 50, 100]}
          sx={{
            '& .MuiDataGrid-row.Mui-selected': { backgroundColor: hexToRgba(accentColor, isDark ? 0.25 : 0.12), '&:hover': { backgroundColor: hexToRgba(accentColor, isDark ? 0.35 : 0.18) } },
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
          paginationModel={paginationMode === 'server' ? { page: page - 1, pageSize } : { page: clientPage, pageSize: clientPageSize }}
          paginationMode={paginationMode}
          onPaginationModelChange={(m) => {
            if (paginationMode === 'server') {
              onPageChange?.(m.page + 1);
              onPageSizeChange?.(m.pageSize);
            } else {
              setClientPage(m.page);
              setClientPageSize(m.pageSize);
            }
          }}
          onRowSelectionModelChange={(model) => {
            if (model?.type === 'include') setSelected(Array.from(model.ids));
            else setSelected([]);
          }}
          rowSelectionModel={selectionModel}
          checkboxSelection
          disableRowSelectionOnClick
          localeText={i18n.language === 'ar' ? arSD : enUS}
        />
      </Box>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t('confirmDelete')}
      />
    </Card>
  );
}
