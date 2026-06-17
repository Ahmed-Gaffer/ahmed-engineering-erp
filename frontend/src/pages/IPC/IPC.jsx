import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, Card, TextField, Button, Stack, Divider, MenuItem, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Fade, Checkbox,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import {
  Add, Edit, Delete, Visibility, SearchOutlined, Receipt, CheckCircle, Download,
  Send, Close as CloseIcon, AttachMoney, Print,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../components/EmptyState/EmptyState';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import { engineeringApi } from '../../services/api';
import { formatNumber, formatDate } from '../../utils/helpers';

const chipStatus = (value) => {
  const colors = {
    draft: { bg: 'rgba(148,163,184,0.15)', text: '#cbd5e1' },
    submitted: { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
    approved: { bg: 'rgba(16,185,129,0.2)', text: '#34d399' },
    rejected: { bg: 'rgba(239,68,68,0.2)', text: '#fca5a5' },
    paid: { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa' },
  };
  const c = colors[value] || colors.draft;
  return <Chip label={value} size="small" sx={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border || c.bg}`, fontWeight: 500, borderRadius: 1 }} />;
};

export default function IPC() {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [boqItems, setBoqItems] = useState([]);
  const [createForm, setCreateForm] = useState({
    project_id: '', contract_id: '', ipc_number: '', ipc_period: '', start_date: '', end_date: '',
  });
  const [selectedBoqItems, setSelectedBoqItems] = useState({});
  const [search, setSearch] = useState('');
  const searchRef = useRef('');

  const fetchProjects = async () => {
    try {
      const res = await engineeringApi.projects.list();
      setProjects(res.data || []);
    } catch {}
  };

  const fetchData = async (s) => {
    if (!selectedProjectId) { setData([]); setLoading(false); setInitialLoading(false); return; }
    setLoading(true);
    try {
      const res = await engineeringApi.ipcs.listByProject(selectedProjectId);
      const items = res.data || [];
      setData(s ? items.filter((i) =>
        (i.ipc_number || '').toLowerCase().includes(s.toLowerCase())
      ) : items);
    } catch {} finally { setLoading(false); setInitialLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchData(searchRef.current); }, [selectedProjectId]);

  const handleSearchChange = (val) => {
    setSearch(val);
    searchRef.current = val;
  };

  const handleViewDetail = async (row) => {
    setDetailItem(row);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await engineeringApi.ipcs.get(row.id);
      setDetailItem(res.data);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); } finally { setDetailLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await engineeringApi.ipcs.approve(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData(searchRef.current);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleSubmit = async (id) => {
    try {
      await engineeringApi.ipcs.submit(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData(searchRef.current);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleReject = async (id) => {
    try {
      await engineeringApi.ipcs.reject(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData(searchRef.current);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handlePay = async (id) => {
    try {
      await engineeringApi.ipcs.pay(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData(searchRef.current);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handlePrint = (id) => {
    window.open(`/engineering/ipc/${id}/print`, '_blank');
  };

  const handleExport = async (id) => {
    try {
      const res = await engineeringApi.ipcs.exportExcel(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `ipc-${id}.xlsx`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleDelete = async () => {
    try {
      if (deleteId) await engineeringApi.ipcs.delete(deleteId);
      setDeleteOpen(false);
      setDeleteId(null);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData(searchRef.current);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleCreateOpen = () => {
    setCreateForm({
      project_id: selectedProjectId || '', contract_id: '', ipc_number: '', ipc_period: '', start_date: '', end_date: '',
    });
    setSelectedBoqItems({});
    setContracts([]);
    setBoqItems([]);
    setCreateOpen(true);
  };

  const handleCreateFormChange = (field) => (e) => {
    const val = e.target.value;
    setCreateForm((prev) => ({ ...prev, [field]: val }));
    if (field === 'project_id' && val) {
      engineeringApi.contracts.listByProject(val).then((r) => setContracts(r.data || [])).catch(() => {});
      engineeringApi.boqItems.listByProject(val).then((r) => setBoqItems(r.data || [])).catch(() => {});
      setCreateForm((prev) => ({ ...prev, contract_id: '' }));
      setSelectedBoqItems({});
    }
  };

  const handleBoqItemToggle = (itemId) => {
    setSelectedBoqItems((prev) => {
      if (prev[itemId]) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: '' };
    });
  };

  const handleBoqItemQtyChange = (itemId) => (e) => {
    setSelectedBoqItems((prev) => ({ ...prev, [itemId]: Number(e.target.value) || 0 }));
  };

  const handleCreateSubmit = async () => {
    if (!createForm.project_id || !createForm.ipc_number || !createForm.ipc_period) {
      enqueueSnackbar(t('fieldRequired'), { variant: 'warning' });
      return;
    }
    const details = Object.entries(selectedBoqItems)
      .filter(([_, qty]) => qty > 0)
      .map(([boq_item_id, current_quantity]) => ({ boq_item_id, current_quantity }));
    if (details.length === 0) {
      enqueueSnackbar(t('fieldRequired'), { variant: 'warning' });
      return;
    }
    setCreateLoading(true);
    try {
      await engineeringApi.ipcs.create({
        project_id: createForm.project_id,
        contract_id: createForm.contract_id || undefined,
        ipc_number: createForm.ipc_number,
        ipc_period: Number(createForm.ipc_period),
        start_date: createForm.start_date || undefined,
        end_date: createForm.end_date || undefined,
        details,
      });
      setCreateOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData(searchRef.current);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setCreateLoading(false); }
  };

  const columns = [
    { field: 'ipc_number', headerName: t('ipcNumber'), width: 140 },
    { field: 'ipc_period', headerName: t('ipcPeriod'), width: 90 },
    { field: 'status', headerName: t('status'), width: 130,
      renderCell: (params) => chipStatus(params.value),
    },
    { field: 'total_amount', headerName: t('total'), type: 'number', width: 130,
      renderCell: (params) => <Typography variant="body2" fontWeight={500}>{formatNumber(params.value)}</Typography>,
    },
    { field: 'retention_amount', headerName: t('retention'), type: 'number', width: 130,
      renderCell: (params) => <Typography variant="body2" fontWeight={500}>{formatNumber(params.value)}</Typography>,
    },
    { field: 'net_amount', headerName: t('netAmount'), type: 'number', width: 130,
      renderCell: (params) => <Typography variant="body2" fontWeight={600}>{formatNumber(params.value)}</Typography>,
    },
    {
      field: 'actions', headerName: t('actions'), width: 300, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => handleViewDetail(params.row)} sx={{ color: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.08)', '&:hover': { backgroundColor: 'rgba(6,182,212,0.16)' } }}>
            <Visibility fontSize="small" />
          </IconButton>
          {params.row.status === 'draft' && (
            <>
              <IconButton size="small" onClick={() => handleSubmit(params.row.id)} sx={{ color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', '&:hover': { backgroundColor: 'rgba(245,158,11,0.16)' } }}>
                <Send fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleApprove(params.row.id)} sx={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', '&:hover': { backgroundColor: 'rgba(16,185,129,0.16)' } }}>
                <CheckCircle fontSize="small" />
              </IconButton>
            </>
          )}
          {params.row.status === 'submitted' && (
            <>
              <IconButton size="small" onClick={() => handleApprove(params.row.id)} sx={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', '&:hover': { backgroundColor: 'rgba(16,185,129,0.16)' } }}>
                <CheckCircle fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleReject(params.row.id)} sx={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', '&:hover': { backgroundColor: 'rgba(239,68,68,0.16)' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          )}
          {params.row.status === 'approved' && (
            <IconButton size="small" onClick={() => handlePay(params.row.id)} sx={{ color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', '&:hover': { backgroundColor: 'rgba(99,102,241,0.16)' } }}>
              <AttachMoney fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={() => handlePrint(params.row.id)} sx={{ color: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.08)', '&:hover': { backgroundColor: 'rgba(139,92,246,0.16)' } }}>
            <Print fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleExport(params.row.id)} sx={{ color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', '&:hover': { backgroundColor: 'rgba(99,102,241,0.16)' } }}>
            <Download fontSize="small" />
          </IconButton>
          {params.row.status === 'draft' && (
            <IconButton size="small" onClick={() => { setDeleteId(params.row.id); setDeleteOpen(true); }} sx={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', '&:hover': { backgroundColor: 'rgba(239,68,68,0.16)' } }}>
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('ipc')}</Typography>
          {selectedProjectId && (
            <Button variant="contained" startIcon={<Add />} onClick={handleCreateOpen} size="small">
              {t('create')}
            </Button>
          )}
        </Stack>

        <Card sx={{ mb: 3, px: 2.5, py: 2 }}>
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
                <MenuItem key={p.id} value={p.id}>{p.name || p.code}</MenuItem>
              ))}
            </TextField>
            {selectedProjectId && (
              <TextField
                size="small"
                placeholder={t('search')}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                slotProps={{
                  input: { startAdornment: <SearchOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> },
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
          <Card sx={{ overflow: 'visible' }}>
            <Box sx={{ height: 550, px: 0.5 }}>
              <DataGrid
                rows={data}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                pageSizeOptions={[20, 50, 100]}
                paginationModel={{ page: 0, pageSize: 20 }}
                initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
                getRowId={(row) => row.id}
                localeText={i18n.language === 'ar' ? arSD : enUS}
                sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
              />
            </Box>
          </Card>
        )}

        {!loading && data.length === 0 && selectedProjectId && !search && (
          <EmptyState title={t('noData')} description={t('noDataDescription')} action onAction={handleCreateOpen} actionLabel={t('create')} />
        )}

        <ConfirmDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title={t('confirmDelete')}
        />

        <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="lg" fullWidth
          TransitionComponent={Fade} transitionDuration={250}
        >
          <DialogTitle sx={{ pb: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Receipt color="primary" />
              <Typography variant="h6" fontWeight={700}>
                {t('ipc')} - {detailItem?.ipc_number || ''}
              </Typography>
            </Stack>
          </DialogTitle>
          <Divider sx={{ my: 1.5 }} />
          <DialogContent>
            {detailItem && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Typography variant="body2"><strong>{t('ipcNumber')}:</strong> {detailItem.ipc_number}</Typography>
                <Typography variant="body2"><strong>{t('ipcPeriod')}:</strong> {detailItem.ipc_period}</Typography>
                <Typography variant="body2"><strong>{t('status')}:</strong> {chipStatus(detailItem.status)}</Typography>
                <Typography variant="body2"><strong>{t('total')}:</strong> {formatNumber(detailItem.total_amount)}</Typography>
                <Typography variant="body2"><strong>{t('retention')}:</strong> {formatNumber(detailItem.retention_amount)}</Typography>
                <Typography variant="body2"><strong>{t('advanceRecovery')}:</strong> {formatNumber(detailItem.advance_recovery)}</Typography>
                <Typography variant="body2"><strong>{t('netAmount')}:</strong> {formatNumber(detailItem.net_amount)}</Typography>
                {detailItem.start_date && <Typography variant="body2"><strong>{t('startDate')}:</strong> {formatDate(detailItem.start_date)}</Typography>}
                {detailItem.end_date && <Typography variant="body2"><strong>{t('endDatePlanned')}:</strong> {formatDate(detailItem.end_date)}</Typography>}
              </Box>
            )}

            <Typography variant="subtitle2" fontWeight={600} mb={2}>{t('lineItems')}</Typography>

            {detailLoading ? (
              <Typography variant="body2" color="text.secondary">{t('loading')}</Typography>
            ) : !detailItem?.details || detailItem.details.length === 0 ? (
              <Typography variant="body2" color="text.secondary">{t('noLineItems')}</Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('itemCode')}</TableCell>
                      <TableCell>{t('description')}</TableCell>
                      <TableCell align="right">{t('unit')}</TableCell>
                      <TableCell align="right">{t('previousQuantity')}</TableCell>
                      <TableCell align="right">{t('currentQuantity')}</TableCell>
                      <TableCell align="right">{t('cumulativeQuantity')}</TableCell>
                      <TableCell align="right">{t('percentage')}</TableCell>
                      <TableCell align="right">{t('amount')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailItem.details.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.boq_item_code || '-'}</TableCell>
                        <TableCell>{item.boq_item_description || '...'}</TableCell>
                        <TableCell align="right">{item.boq_item_unit || '-'}</TableCell>
                        <TableCell align="right">{formatNumber(item.previous_quantity)}</TableCell>
                        <TableCell align="right">{formatNumber(item.current_quantity)}</TableCell>
                        <TableCell align="right">{formatNumber(item.cumulative_quantity)}</TableCell>
                        <TableCell align="right">{formatNumber(item.percentage)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatNumber(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => handlePrint(detailItem?.id)} size="small" startIcon={<Print />}>{t('printIpc')}</Button>
            <Button onClick={() => setDetailOpen(false)} size="small">{t('close')}</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth
          TransitionComponent={Fade} transitionDuration={250}
        >
          <DialogTitle sx={{ pb: 0 }}>
            <Typography variant="h6" fontWeight={700}>{`${t('create')} ${t('ipc')}`}</Typography>
            <Typography variant="caption" color="text.secondary">{t('createDescription')}</Typography>
          </DialogTitle>
          <Divider sx={{ my: 1.5 }} />
          <DialogContent>
            <Stack spacing={2} mb={3}>
              <TextField
                select label={t('project')} size="small" required fullWidth
                value={createForm.project_id}
                onChange={handleCreateFormChange('project_id')}
              >
                <MenuItem value="">{t('selectProject')}</MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name || p.code}</MenuItem>
                ))}
              </TextField>
              <TextField
                select label={t('contract')} size="small" fullWidth
                value={createForm.contract_id}
                onChange={handleCreateFormChange('contract_id')}
                disabled={!createForm.project_id}
              >
                <MenuItem value="">{t('contract')}</MenuItem>
                {contracts.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name || c.contract_number}</MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={2}>
                <TextField label={t('ipcNumber')} size="small" required fullWidth
                  value={createForm.ipc_number}
                  onChange={handleCreateFormChange('ipc_number')}
                />
                <TextField label={t('ipcPeriod')} type="number" size="small" required fullWidth
                  value={createForm.ipc_period}
                  onChange={handleCreateFormChange('ipc_period')}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label={t('startDate')} type="date" size="small" fullWidth
                  value={createForm.start_date}
                  onChange={handleCreateFormChange('start_date')}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField label={t('endDatePlanned')} type="date" size="small" fullWidth
                  value={createForm.end_date}
                  onChange={handleCreateFormChange('end_date')}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
            </Stack>

            {createForm.project_id && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} mb={2}>{t('selectBoqItem')}</Typography>
                {boqItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">{t('noBoqItems')}</Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox" />
                          <TableCell>{t('itemCode')}</TableCell>
                          <TableCell>{t('description')}</TableCell>
                          <TableCell align="right">{t('unit')}</TableCell>
                          <TableCell align="right">{t('currentQuantity')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {boqItems.map((item) => (
                          <TableRow key={item.id} hover selected={item.id in selectedBoqItems}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={item.id in selectedBoqItems}
                                onChange={() => handleBoqItemToggle(item.id)}
                              />
                            </TableCell>
                            <TableCell>{item.item_code || '-'}</TableCell>
                            <TableCell>{item.description || '-'}</TableCell>
                            <TableCell align="right">{item.unit || '-'}</TableCell>
                            <TableCell align="right" sx={{ maxWidth: 120 }}>
                              {item.id in selectedBoqItems ? (
                                <TextField
                                  type="number" size="small" autoFocus
                                  value={selectedBoqItems[item.id]}
                                  onChange={handleBoqItemQtyChange(item.id)}
                                  slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                                  sx={{ width: 100 }}
                                />
                              ) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setCreateOpen(false)} size="small" disabled={createLoading}>{t('cancel')}</Button>
            <Button onClick={handleCreateSubmit} variant="contained" size="small" disableElevation disabled={createLoading}>
              {createLoading ? t('loading') : t('save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}
