import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, TextField, Button, Stack, IconButton, Chip, Typography, Divider, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, SearchOutlined, FilterList, Download } from '@mui/icons-material';
import { statusColors, formatNumber, formatDate } from '../../utils/helpers';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { useSnackbar } from 'notistack';

const ModernChip = ({ value }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!value) return <Chip label="-" size="small" variant="outlined" sx={{ opacity: 0.5 }} />;
  const color = statusColors[value] || 'default';
  const chipColors = {
    success: { bg: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)', text: isDark ? '#6ee7b7' : '#059669', border: isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)' },
    primary: { bg: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)', text: isDark ? '#a5b4fc' : '#4f46e5', border: isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)' },
    warning: { bg: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)', text: isDark ? '#fcd34d' : '#b45309', border: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.2)' },
    error: { bg: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)', text: isDark ? '#fca5a5' : '#dc2626', border: isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)' },
    info: { bg: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', text: isDark ? '#93c5fd' : '#2563eb', border: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)' },
    default: { bg: isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.1)', text: isDark ? '#cbd5e1' : '#475569', border: isDark ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.2)' },
  };
  const cc = chipColors[color] || chipColors.default;
  return (
    <Chip
      label={value}
      size="small"
      sx={{ backgroundColor: cc.bg, color: cc.text, border: `1px solid ${cc.border}`, fontWeight: 500, borderRadius: 1 }}
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
  onDelete,
  onBulkDelete,
  service,
}) {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState({ type: 'include', ids: new Set() });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    ...baseColumns.map((col) => ({
      ...col,
      headerName: t(col.headerName || col.field) || col.headerName,
      flex: col.flex || 1,
      minWidth: col.minWidth || 120,
      renderCell: col.renderCell || ((params) => {
        if (col.type === 'number' && params.value != null) return <Typography variant="body2" fontWeight={500}>{formatNumber(params.value)}</Typography>;
        if (col.type === 'date' && params.value) return <Typography variant="body2">{formatDate(params.value)}</Typography>;
        if (col.field === 'status') {
          return <ModernChip value={params.value} />;
        }
        return <Typography variant="body2">{params.value ?? '-'}</Typography>;
      }),
    })),
    {
      field: 'actions',
      headerName: t('actions'),
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => onEdit?.(params.row)} sx={{ color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', '&:hover': { backgroundColor: 'rgba(99,102,241,0.16)' } }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => { setDeleteId(params.row.id); setDeleteOpen(true); }} sx={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', '&:hover': { backgroundColor: 'rgba(239,68,68,0.16)' } }}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const handleExportCSV = () => {
    const visibleCols = baseColumns.filter(c => c.field !== 'actions');
    const headers = visibleCols.map(c => t(c.headerName || c.field)).join(',');
    const rows = data.map(row =>
      visibleCols.map(c => {
        const val = c.renderCell ? c.renderCell({ value: row[c.field], row }) : row[c.field];
        const str = typeof val?.props?.children === 'string' ? val.props.children : String(val ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    const blob = new Blob([`\uFEFF${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `export-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
  };

  const handleDelete = async () => {
    try {
      if (deleteId) await service.delete(deleteId);
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
      await service.bulkDelete([...selected.ids]);
      setSelected({ type: 'include', ids: new Set() });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      onDelete?.();
    } catch {
      enqueueSnackbar(t('operationFailed'), { variant: 'error' });
    }
  };

  return (
    <Card sx={{ overflow: 'visible' }}>
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
          <Stack direction="row" alignItems="center" spacing={1.5} flex={1}>
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
              sx={{ minWidth: 280, maxWidth: 400 }}
            />
            <Button size="small" variant="text" color="inherit" startIcon={<FilterList fontSize="small" />} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              {t('filter')}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1}>
            {selected.ids.size > 0 && (
              <Button variant="outlined" color="error" size="small" onClick={handleBulkDelete}>
                {t('delete')} ({selected.ids.size})
              </Button>
            )}
            {data.length > 0 && (
              <Button variant="text" startIcon={<Download />} onClick={handleExportCSV} size="small" sx={{ color: 'text.secondary' }}>
                CSV
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
      <Box sx={{ height: 550, px: 0.5 }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          rowCount={total}
          paginationModel={{ page: page - 1, pageSize }}
          paginationMode="server"
          onPaginationModelChange={(m) => {
            onPageChange?.(m.page + 1);
            onPageSizeChange?.(m.pageSize);
          }}
          onRowSelectionModelChange={setSelected}
          rowSelectionModel={selected}
          checkboxSelection
          disableRowSelectionOnClick
          localeText={i18n.language === 'ar' ? arSD.components.MuiDataGrid.defaultProps.localeText : enUS.components.MuiDataGrid.defaultProps.localeText}
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
