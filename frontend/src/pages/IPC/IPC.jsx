import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, Card, TextField, Button, Stack, Divider, MenuItem, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Fade, Checkbox, Tabs, Tab, Grid,
  LinearProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import {
  Add, Edit, Delete, Visibility, SearchOutlined, Receipt, CheckCircle, Download,
  Send, Close as CloseIcon, AttachMoney, Print, PictureAsPdf,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../components/EmptyState/EmptyState';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';
import { engineeringApi, workflowApi } from '../../services/api';
import { formatNumber, formatDate } from '../../utils/helpers';
import ApprovalDialog from '../../components/ApprovalDialog/ApprovalDialog';
import WorkflowTimeline from '../../components/WorkflowTimeline/WorkflowTimeline';

const chipStatus = (value) => {
  const colors = {
    draft: { bg: 'rgba(148,163,184,0.15)', text: '#cbd5e1' },
    submitted: { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
    approved: { bg: 'rgba(16,185,129,0.2)', text: '#34d399' },
    rejected: { bg: 'rgba(239,68,68,0.2)', text: '#fca5a5' },
    paid: { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa' },
  };
  const c = colors[value] || colors.draft;
  return <Chip label={value} size="small" sx={{ backgroundColor: c.bg, color: c.text, fontWeight: 500, borderRadius: 1 }} />;
};

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ mt: 2 }}>{children}</Box>;
}

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
  const [detailTab, setDetailTab] = useState(0);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [approvalId, setApprovalId] = useState(null);
  const [wfRefresh, setWfRefresh] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [boqItems, setBoqItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [createForm, setCreateForm] = useState({
    project_id: '', contract_id: '', ipc_number: '', ipc_period: '', start_date: '', end_date: '',
    materials_on_site: '', advance_recovery: '', fines: '', insurance: '', other_deductions: '',
  });
  const [selectedBoqItems, setSelectedBoqItems] = useState({});
  const [search, setSearch] = useState('');
  const [filterModel, setFilterModel] = useState({ items: [] });

  const fetchProjects = async () => {
    try {
      const res = await engineeringApi.projects.list();
      setProjects(res.data || []);
    } catch {}
  };

  const fetchSummary = async (projectId) => {
    if (!projectId) { setSummary(null); return; }
    try {
      const res = await engineeringApi.ipcs.projectSummary(projectId);
      setSummary(res.data);
    } catch {}
  };

  const fetchData = async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); setInitialLoading(false); return; }
    setLoading(true);
    try {
      const res = await engineeringApi.ipcs.listByProject(selectedProjectId);
      setData(res.data || []);
    } catch {} finally { setLoading(false); setInitialLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchData(); fetchSummary(selectedProjectId); }, [selectedProjectId]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setFilterModel(val
      ? { items: [{ field: 'ipc_number', operatorValue: 'contains', value: val }] }
      : { items: [] }
    );
  };

  const handleViewDetail = async (row) => {
    setDetailItem(row);
    setDetailOpen(true);
    setDetailTab(0);
    setDetailLoading(true);
    try {
      const res = await engineeringApi.ipcs.get(row.id);
      setDetailItem(res.data);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); } finally { setDetailLoading(false); }
  };

  const handleWorkflowAction = (id, action) => {
    setApprovalId(id);
    setApprovalAction(action);
    setApprovalOpen(true);
  };

  const handleApprove = (id) => handleWorkflowAction(id, 'approve');
  const handleSubmit = (id) => handleWorkflowAction(id, 'submit');
  const handleReject = (id) => handleWorkflowAction(id, 'reject');
  const handlePay = (id) => handleWorkflowAction(id, 'pay');

  const handleApprovalConfirm = async (comment, assignedTo) => {
    try {
      const params = {};
      if (comment) params.comment = comment;
      if (assignedTo) params.assigned_to = assignedTo;
      await engineeringApi.ipcs[approvalAction](approvalId, params);
      setApprovalOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setWfRefresh(v => v + 1);
      fetchData(); fetchSummary(selectedProjectId);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handlePrint = (id) => {
    window.open(`/engineering/ipc/${id}/print`, '_blank');
  };

  const handleExportExcel = async (id) => {
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

  const handleExportPdf = async (id) => {
    try {
      const res = await engineeringApi.ipcs.exportPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `ipc-${id}.pdf`);
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
      fetchData(); fetchSummary(selectedProjectId);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleCreateOpen = () => {
    setCreateForm({
      project_id: selectedProjectId || '', contract_id: '', ipc_number: '', ipc_period: '', start_date: '', end_date: '',
      materials_on_site: '', advance_recovery: '', fines: '', insurance: '', other_deductions: '',
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
        project_id: Number(createForm.project_id),
        contract_id: Number(createForm.contract_id) || undefined,
        ipc_number: createForm.ipc_number,
        ipc_period: Number(createForm.ipc_period),
        start_date: createForm.start_date || undefined,
        end_date: createForm.end_date || undefined,
        advance_recovery: Number(createForm.advance_recovery) || 0,
        materials_on_site: Number(createForm.materials_on_site) || 0,
        fines: Number(createForm.fines) || 0,
        insurance: Number(createForm.insurance) || 0,
        other_deductions: Number(createForm.other_deductions) || 0,
        details,
      });
      setCreateOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData(); fetchSummary(selectedProjectId);
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
    { field: 'total_works', headerName: 'Works', type: 'number', width: 120,
      renderCell: (params) => <Typography variant="body2">{formatNumber(params.value)}</Typography>,
    },
    { field: 'gross_amount', headerName: 'Gross', type: 'number', width: 120,
      renderCell: (params) => <Typography variant="body2" fontWeight={500}>{formatNumber(params.value)}</Typography>,
    },
    { field: 'net_amount', headerName: t('netAmount'), type: 'number', width: 120,
      renderCell: (params) => <Typography variant="body2" fontWeight={600} color="primary.main">{formatNumber(params.value)}</Typography>,
    },
    { field: 'total_to_date', headerName: 'Total to Date', type: 'number', width: 130,
      renderCell: (params) => <Typography variant="body2" fontWeight={600} color="success.main">{formatNumber(params.value)}</Typography>,
    },
    {
      field: 'actions', headerName: t('actions'), width: 360, sortable: false,
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
          <IconButton size="small" onClick={() => handleExportPdf(params.row.id)} sx={{ color: '#dc2626', backgroundColor: 'rgba(220,38,38,0.08)', '&:hover': { backgroundColor: 'rgba(220,38,38,0.16)' } }}>
            <PictureAsPdf fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleExportExcel(params.row.id)} sx={{ color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', '&:hover': { backgroundColor: 'rgba(99,102,241,0.16)' } }}>
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

        {summary && (
          <Card sx={{ mb: 3, px: 2.5, py: 2, background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">Total IPCs</Typography>
                <Typography variant="h5" color="white" fontWeight={700}>{summary.total_ipcs}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">Total Billed</Typography>
                <Typography variant="h6" color="white" fontWeight={600}>{formatNumber(summary.total_billed)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">Total Paid</Typography>
                <Typography variant="h6" color="#34d399" fontWeight={600}>{formatNumber(summary.total_paid)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">Contract Ceiling</Typography>
                <Typography variant="h6" color="white" fontWeight={600}>{formatNumber(summary.contract_ceiling)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">Remaining</Typography>
                <Typography variant="h6" color="#fbbf24" fontWeight={600}>{formatNumber(summary.remaining)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">Progress</Typography>
                <Typography variant="h6" color="white" fontWeight={700}>{formatNumber(summary.progress_percent)}%</Typography>
                <LinearProgress variant="determinate" value={Number(summary.progress_percent)} sx={{ mt: 0.5, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { backgroundColor: '#34d399' } }} />
              </Grid>
            </Grid>
          </Card>
        )}

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
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
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
            <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 2 }} variant="scrollable">
              <Tab label="Summary" />
              <Tab label="Line Items" />
              <Tab label="Deductions" />
              <Tab label="Workflow" />
            </Tabs>

            <TabPanel value={detailTab} index={0}>
              {detailItem && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Typography variant="body1" fontWeight={600}>{chipStatus(detailItem.status)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Period</Typography>
                    <Typography variant="body1">{detailItem.start_date && formatDate(detailItem.start_date)} to {detailItem.end_date && formatDate(detailItem.end_date)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">{t('totalWorks')}</Typography>
                    <Typography variant="h6">{formatNumber(detailItem.total_works)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">{t('materialsOnSite')}</Typography>
                    <Typography variant="h6">{formatNumber(detailItem.materials_on_site)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">{t('grossAmount')}</Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={700}>{formatNumber(detailItem.gross_amount)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">{t('totalDeductions')}</Typography>
                    <Typography variant="h6" color="error.main">{formatNumber(detailItem.total_deductions)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">Net Amount</Typography>
                    <Typography variant="h6" color="success.main" fontWeight={700}>{formatNumber(detailItem.net_amount)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">{t('totalToDate')}</Typography>
                    <Typography variant="h6" color="info.main" fontWeight={700}>{formatNumber(detailItem.total_to_date)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={4} flexWrap="wrap">
                      <Box><Typography variant="caption" color="text.secondary">{t('contractCeiling')}</Typography><Typography>{formatNumber(detailItem.contract_ceiling)}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">{t('totalBilled')}</Typography><Typography>{formatNumber(detailItem.total_billed)}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">Remaining</Typography><Typography color="warning.main">{formatNumber(detailItem.contract_ceiling - detailItem.total_billed)}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">{t('previousTotal')}</Typography><Typography>{formatNumber(detailItem.previous_total)}</Typography></Box>
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </TabPanel>

            <TabPanel value={detailTab} index={1}>
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
            </TabPanel>

            <TabPanel value={detailTab} index={2}>
              {detailItem && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} color="error.main" gutterBottom>Deductions</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between"><Typography>{t('retention')} ({detailItem.retention_percent}%)</Typography><Typography>{formatNumber(detailItem.retention_amount)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography>{t('advanceRecovery')}</Typography><Typography>{formatNumber(detailItem.advance_recovery)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography>{t('fines')}</Typography><Typography color="error.main">{formatNumber(detailItem.fines)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography>{t('insurance')}</Typography><Typography>{formatNumber(detailItem.insurance)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography>{t('otherDeductions')}</Typography><Typography>{formatNumber(detailItem.other_deductions)}</Typography></Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>{t('totalDeductions')}</Typography><Typography fontWeight={700} color="error.main">{formatNumber(detailItem.total_deductions)}</Typography></Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} color="success.main" gutterBottom>Cumulative Summary</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between"><Typography>{t('previousTotal')}</Typography><Typography>{formatNumber(detailItem.previous_total)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography fontWeight={600}>{t('currentDue')}</Typography><Typography fontWeight={600} color="primary.main">{formatNumber(detailItem.current_due)}</Typography></Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>{t('totalToDate')}</Typography><Typography fontWeight={700} color="success.main">{formatNumber(detailItem.total_to_date)}</Typography></Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between"><Typography>{t('contractCeiling')}</Typography><Typography>{formatNumber(detailItem.contract_ceiling)}</Typography></Stack>
                      <Stack direction="row" justifyContent="space-between"><Typography>Remaining</Typography><Typography color="warning.main">{formatNumber(detailItem.contract_ceiling - detailItem.total_billed)}</Typography></Stack>
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </TabPanel>

            <TabPanel value={detailTab} index={3}>
              <WorkflowTimeline entityType="ipc" entityId={detailItem?.id} refreshTrigger={wfRefresh} />
            </TabPanel>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => handleExportPdf(detailItem?.id)} size="small" startIcon={<PictureAsPdf />} color="error">PDF</Button>
            <Button onClick={() => handlePrint(detailItem?.id)} size="small" startIcon={<Print />}>{t('printIpc')}</Button>
            <Button onClick={() => setDetailOpen(false)} size="small">{t('close')}</Button>
          </DialogActions>
        </Dialog>

        <ApprovalDialog
          open={approvalOpen}
          onClose={() => setApprovalOpen(false)}
          onConfirm={handleApprovalConfirm}
          title={`${approvalAction?.charAt(0).toUpperCase() + approvalAction?.slice(1) || ''} IPC`}
          entityLabel={`IPC #${approvalId}`}
          currentStatus={detailItem?.status || ''}
          actionLabel={approvalAction ? `${approvalAction} IPC` : ''}
        />

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
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">{t('retention')} / {t('netAmount')}</Typography>
              <Stack direction="row" spacing={2}>
                <TextField label={t('materialsOnSite')} type="number" size="small" fullWidth
                  value={createForm.materials_on_site}
                  onChange={handleCreateFormChange('materials_on_site')}
                />
                <TextField label={t('advanceRecovery')} type="number" size="small" fullWidth
                  value={createForm.advance_recovery}
                  onChange={handleCreateFormChange('advance_recovery')}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label={t('fines')} type="number" size="small" fullWidth
                  value={createForm.fines}
                  onChange={handleCreateFormChange('fines')}
                />
                <TextField label={t('insurance')} type="number" size="small" fullWidth
                  value={createForm.insurance}
                  onChange={handleCreateFormChange('insurance')}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label={t('otherDeductions')} type="number" size="small" fullWidth
                  value={createForm.other_deductions}
                  onChange={handleCreateFormChange('other_deductions')}
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
