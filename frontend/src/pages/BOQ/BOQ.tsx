import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, Card, TextField, Button, Stack, MenuItem, IconButton, Chip, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Alert, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { Add, Edit, Delete, FileDownload, FileUpload, SearchOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import FormDialog from '../../components/FormDialog/FormDialog';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../components/EmptyState/EmptyState';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import { engineeringApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';

const UNIT_OPTIONS = [
  { value: 'm3', label: 'm3' },
  { value: 'm2', label: 'm2' },
  { value: 'ml', label: 'ml' },
  { value: 'ea', label: 'ea' },
  { value: 'ton', label: 'ton' },
  { value: 'kg', label: 'kg' },
  { value: 'hour', label: 'hour' },
  { value: 'day', label: 'day' },
  { value: 'lump_sum', label: 'lumpSum' },
  { value: 'nr', label: 'nr' },
];

export default function BOQ() {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState('');
  const [search, setSearch] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{ headers: string[]; rows: unknown[][] } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<Record<string, unknown> | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await engineeringApi.projects.list();
      setProjects(res.data || []);
    } catch {}
  };

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) {
      setRows([]);
      setLoading(false);
      setInitialLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await engineeringApi.boqItems.listByProject(selectedProjectId);
      setRows(res.data || []);
    } catch {
      enqueueSnackbar(t('operationFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [selectedProjectId, t, enqueueSnackbar]);

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const idMap = useMemo(() => {
    const map: Record<string, Record<string, unknown>> = {};
    rows.forEach(item => { map[item.id as string] = item; });
    return map;
  }, [rows]);

  const displayRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    const included = new Set<number>();
    const match = (item: Record<string, unknown>) =>
      (item.item_code as string || '').toLowerCase().includes(q) ||
      (item.description as string || '').toLowerCase().includes(q) ||
      (item.unit as string || '').toLowerCase().includes(q) ||
      (item.category as string || '').toLowerCase().includes(q);

    rows.forEach(item => {
      if (match(item)) {
        let cur: Record<string, unknown> | undefined = item;
        while (cur) {
          included.add(cur.id as number);
          cur = cur.parent_id ? idMap[cur.parent_id as string] : null;
        }
      }
    });
    return rows.filter(item => included.has(item.id as number));
  }, [rows, search, idMap]);

  const processedData = useMemo(() => {
    if (!displayRows.length) return [];
    return displayRows.map(item => {
      const path: number[] = [];
      let cur: Record<string, unknown> | undefined = item;
      const visited = new Set<number>();
      while (cur && cur.parent_id && !visited.has(cur.parent_id as number)) {
        visited.add(cur.parent_id as number);
        const parent = idMap[cur.parent_id as string];
        if (parent) { path.unshift(parent.id as number); cur = parent; }
        else break;
      }
      return { ...item, _path: path };
    });
  }, [displayRows, idMap]);

  const getTreeDataPath = useCallback((row: Record<string, unknown>) => (row as { _path: number[] })._path || [], []);

  const handleAdd = () => { setEditItem(null); setFormOpen(true); };
  const handleEdit = (row: Record<string, unknown>) => { setEditItem(row); setFormOpen(true); };

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      const payload: Record<string, unknown> = {
        project_id: selectedProjectId,
        item_code: formData.item_code,
        description: formData.description,
        unit: formData.unit,
        quantity: formData.quantity ? Number(formData.quantity) : null,
        unit_price: formData.unit_price ? Number(formData.unit_price) : null,
        category: formData.category || null,
        is_group: formData.is_group === 'yes',
        parent_id: formData.parent_id || null,
      };
      if (editItem) {
        await engineeringApi.boqItems.update(editItem.id as number, payload);
      } else {
        await engineeringApi.boqItems.create(payload);
      }
      setFormOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { detail?: string } } };
      enqueueSnackbar(errorResponse.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await engineeringApi.boqItems.delete(deleteId!);
      setDeleteOpen(false);
      setDeleteId(null);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch {
      enqueueSnackbar(t('operationFailed'), { variant: 'error' });
    }
  };

  const handleExport = async () => {
    try {
      const res = await engineeringApi.boqItems.exportExcel(selectedProjectId);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `boq_${selectedProjectId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('operationFailed'), { variant: 'error' });
    }
  };

  const total = useMemo(() => {
    if (!rows.length) return 0;
    return rows.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);
  }, [rows]);

  const parentOptions = useMemo(() => {
    if (!rows.length) return [];
    return rows
      .filter(item => editItem ? item.id !== editItem.id : true)
      .map(item => ({
        value: item.id,
        label: `${item.item_code} - ${item.description}`,
      }));
  }, [rows, editItem]);

  const formInitialValues = useMemo(() => {
    if (!editItem) return null;
    return {
      ...editItem,
      is_group: editItem.is_group ? 'yes' : 'no',
    };
  }, [editItem]);

  const columns = useMemo(() => [
    { field: 'item_code', headerName: t('itemCode'), width: 130 },
    { field: 'description', headerName: t('description'), flex: 2, minWidth: 200 },
    { field: 'unit', headerName: t('unit'), width: 80 },
    {
      field: 'quantity', headerName: t('quantity'), type: 'number', width: 100,
      renderCell: (params: { value: number }) => (
        <Typography variant="body2" fontWeight={500}>{formatNumber(params.value)}</Typography>
      ),
    },
    {
      field: 'unit_price', headerName: t('unitPrice'), type: 'number', width: 110,
      renderCell: (params: { value: number }) => (
        <Typography variant="body2" fontWeight={500}>{formatNumber(params.value)}</Typography>
      ),
    },
    {
      field: 'total_price', headerName: t('totalPrice'), type: 'number', width: 120,
      renderCell: (params: { value: number }) => (
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {formatNumber(params.value)}
        </Typography>
      ),
    },
    {
      field: 'category', headerName: t('category'), width: 120,
      renderCell: (params: { value: string }) => params.value
        ? <Chip label={params.value} size="small" variant="outlined" />
        : '-',
    },
    {
      field: 'actions', headerName: t('actions'), width: 100, sortable: false,
      renderCell: (params: { row: Record<string, unknown> }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{ color: theme.palette.secondary.main, backgroundColor: `${theme.palette.secondary.main}14`, '&:hover': { backgroundColor: `${theme.palette.secondary.main}29` } }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => { setDeleteId(params.row.id as number); setDeleteItemName(params.row.item_code + ' - ' + params.row.description); setDeleteOpen(true); }}
            sx={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', '&:hover': { backgroundColor: 'rgba(239,68,68,0.16)' } }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], [t, theme]);

  const fields = useMemo(() => [
    { name: 'item_code', label: 'itemCode', required: true },
    { name: 'description', label: 'description', required: true },
    { name: 'unit', label: 'unit', required: true, options: UNIT_OPTIONS },
    { name: 'quantity', label: 'quantity', type: 'number' },
    { name: 'unit_price', label: 'unitPrice', type: 'number' },
    { name: 'category', label: 'category' },
    {
      name: 'is_group', label: 'group',
      options: [{ value: 'yes', label: 'yes' }, { value: 'no', label: 'no' }],
    },
    { name: 'parent_id', label: 'parent', options: parentOptions },
  ], [parentOptions]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('boq')}</Typography>
          {selectedProjectId && (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<FileUpload />} onClick={() => setImportOpen(true)} size="small">
                {t('importExcel')}
              </Button>
              <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExport} size="small">
                {t('export')}
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={handleAdd} size="small">
                {t('addItem')}
              </Button>
            </Stack>
          )}
        </Stack>

        <Card sx={{ mb: 3, px: 2.5, py: 2, borderTop: '3px solid', borderTopColor: 'secondary.main', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" gap={1.5}>
            <TextField
              select
              size="small"
              label={t('project')}
              value={selectedProjectId}
              onChange={(e) => { setSelectedProjectId(e.target.value); setSearch(''); }}
              sx={{ minWidth: 260 }}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id as number} value={p.id as number}>{p.name as string}</MenuItem>
              ))}
            </TextField>
            {selectedProjectId && (
              <TextField
                size="small"
                placeholder={t('search')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <SearchOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  },
                }}
                sx={{ minWidth: 260, maxWidth: 400 }}
              />
            )}
          </Stack>
        </Card>

        {initialLoading ? (
          <DataGridSkeleton />
        ) : !selectedProjectId ? (
          <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} />
        ) : (
          <Card sx={{ overflow: 'visible', borderTop: '3px solid', borderTopColor: 'secondary.main', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <Box sx={{ height: 600, px: 0.5 }}>
               <DataGrid
                 treeData
                 getTreeDataPath={getTreeDataPath}
                 rows={processedData}
                 columns={columns}
                 loading={loading}
                 getRowId={(row: Record<string, unknown>) => row.id}
                 disableRowSelectionOnClick
                 pageSizeOptions={[20, 50, 100]}
                 paginationModel={{ page: 0, pageSize: 20 }}
                 initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
                 localeText={i18n.language === 'ar' ? arSD : enUS}
                 sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
               />
            </Box>
            {rows.length > 0 && (
              <Box sx={{ px: 3, py: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {t('total')}: {formatNumber(total)}
                </Typography>
              </Box>
            )}
          </Card>
        )}

        {!loading && rows.length === 0 && selectedProjectId && !search && (
          <EmptyState title={t('noData')} description={t('noDataDescription')} action onAction={handleAdd} actionLabel={t('addItem')} />
        )}

        <FormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          fields={fields}
          initialValues={formInitialValues}
          title={editItem ? `${t('edit')} ${t('boqItem')}` : `${t('create')} ${t('boqItem')}`}
          loading={formLoading}
        />

        <ConfirmDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title={t('confirmDelete') + (deleteItemName ? ': ' + deleteItemName : '')}
        />

        <Dialog open={importOpen} onClose={() => { setImportOpen(false); setImportFile(null); setImportPreview(null); setImportResult(null); }} maxWidth="md" fullWidth>
          <DialogTitle>{t('importExcel')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {!importPreview && !importResult && (
                <Box sx={{ border: '2px dashed', borderColor: 'secondary.main', borderRadius: 2, p: 4, textAlign: 'center' }}>
                  <input
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    id="import-file-input"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImportFile(file);
                      setImportLoading(true);
                      try {
                        const buffer = await file.arrayBuffer();
                        const XLSX = await import('xlsx');
                        const wb = XLSX.read(buffer, { type: 'array' });
                        const ws = wb.Sheets[wb.SheetNames[0]];
                        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
                        if (data.length > 1) {
                          setImportPreview({ headers: data[0] as string[], rows: data.slice(1, 11) });
                        } else {
                          setImportPreview(null);
                        }
                      } catch {
                        setImportPreview(null);
                      } finally {
                        setImportLoading(false);
                      }
                    }}
                  />
                  <label htmlFor="import-file-input">
                    <Button variant="contained" component="span" startIcon={<FileUpload />}>
                      {t('chooseFile')}
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    .xlsx / .xls
                  </Typography>
                </Box>
              )}
              {importLoading && <LinearProgress />}
              {importPreview && !importResult && (
                <>
                  <Typography variant="subtitle2">{t('preview')} ({importFile?.name})</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {importPreview.headers.map((h, i) => (
                            <TableCell key={i} sx={{ fontWeight: 700 }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importPreview.rows.map((row, ri) => (
                          <TableRow key={ri}>
                            {(row as unknown[]).map((cell, ci) => (
                              <TableCell key={ci}>{cell ?? ''}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              {importResult && (
                <>
                  <Alert severity={(importResult.errors as unknown[])?.length ? 'warning' : 'success'}>
                    {t('importComplete')}: {importResult.created as number} {t('items')}
                    {(importResult.errors as unknown[])?.length > 0 && `, ${(importResult.errors as unknown[]).length} ${t('errors')}`}
                  </Alert>
                  {(importResult.errors as string[])?.length > 0 && (
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {(importResult.errors as string[]).map((err: string, i: number) => (
                        <Typography component="li" key={i} variant="caption" color="error">{err}</Typography>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setImportOpen(false); setImportFile(null); setImportPreview(null); setImportResult(null); }}>
              {importResult ? t('close') : t('cancel')}
            </Button>
            {importPreview && !importResult && (
              <Button
                variant="contained"
                onClick={async () => {
                  if (!importFile) return;
                  setImportLoading(true);
                  try {
                    const res = await engineeringApi.boqItems.importExcel(selectedProjectId, importFile);
                    setImportResult(res.data);
                    fetchData();
                  } catch {
                    setImportResult({ created: 0, errors: [t('operationFailed')] });
                  } finally {
                    setImportLoading(false);
                  }
                }}
                disabled={importLoading}
              >
                {t('confirm')}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}
