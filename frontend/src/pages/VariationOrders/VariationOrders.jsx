import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, TextField, Button, Stack, MenuItem, Chip, Card, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Divider, IconButton, Fade, Tabs, Tab, Grid, LinearProgress,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Analytics, Close } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { motion } from 'framer-motion';
import { engineeringApi } from '../../services/api';
import { formatNumber, formatDate } from '../../utils/helpers';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../components/EmptyState/EmptyState';

const VO_STATUS_CHIP = {
  draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  submitted: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  approved: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  rejected: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5' },
};

const IMPACT_TYPE_CHIP = {
  add: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Add' },
  remove: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', label: 'Remove' },
  modify: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Modify' },
};

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ mt: 2 }}>{children}</Box>;
}

export default function VariationOrders() {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ vo_number: '', title: '', description: '', reason: '', contract_id: '', amount_change: '', days_change: '', submitted_date: '' });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [impactOpen, setImpactOpen] = useState(false);
  const [impactVO, setImpactVO] = useState(null);
  const [impactSummary, setImpactSummary] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactTab, setImpactTab] = useState(0);

  const [boqAddOpen, setBoqAddOpen] = useState(false);
  const [boqItems, setBoqItems] = useState([]);
  const [boqForm, setBoqForm] = useState({ boq_item_id: '', impact_type: 'add', quantity_change: '', unit_price_change: '', description: '' });

  const [schedAddOpen, setSchedAddOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [schedForm, setSchedForm] = useState({ schedule_id: '', days_change: '', description: '' });

  const [statusActionId, setStatusActionId] = useState(null);

  useEffect(() => { engineeringApi.projects.list().then(r => setProjects(r.data || [])); }, []);

  const fetchData = async () => {
    if (!selectedProjectId) { setData([]); setLoading(false); return; }
    setLoading(true);
    try { const r = await engineeringApi.variationOrders.listByProject(selectedProjectId); setData(r.data || []); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [selectedProjectId]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ vo_number: '', title: '', description: '', reason: '', contract_id: '', amount_change: '', days_change: '', submitted_date: new Date().toISOString().slice(0, 10) });
    engineeringApi.contracts.listByProject(selectedProjectId).then(r => setContracts(r.data || [])).catch(() => {});
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    setForm({ vo_number: row.vo_number || '', title: row.title || '', description: row.description || '', reason: row.reason || '', contract_id: row.contract_id?.toString() || '', amount_change: row.amount_change?.toString() || '0', days_change: row.days_change?.toString() || '0', submitted_date: row.submitted_date || '' });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { project_id: Number(selectedProjectId), contract_id: Number(form.contract_id), vo_number: form.vo_number, title: form.title, description: form.description || null, reason: form.reason || null, amount_change: Number(form.amount_change) || 0, days_change: Number(form.days_change) || 0, submitted_date: form.submitted_date || null };
      if (editItem) await engineeringApi.variationOrders.update(editItem.id, payload);
      else await engineeringApi.variationOrders.create(payload);
      setFormOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleDelete = async () => {
    try { await engineeringApi.variationOrders.delete(deleteId); setDeleteOpen(false); fetchData(); } catch {}
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await engineeringApi.variationOrders.update(id, { status: newStatus, approved_date: newStatus === 'approved' ? new Date().toISOString().slice(0, 10) : null });
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const openImpact = async (row) => {
    setImpactVO(row);
    setImpactOpen(true);
    setImpactTab(0);
    setImpactLoading(true);
    try {
      const r = await engineeringApi.variationOrders.impactSummary(row.id);
      setImpactSummary(r.data);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); } finally { setImpactLoading(false); }
  };

  const openBoqAdd = async () => {
    try {
      const r = await engineeringApi.boqItems.listByProject(selectedProjectId);
      setBoqItems(r.data || []);
    } catch { setBoqItems([]); }
    setBoqForm({ boq_item_id: '', impact_type: 'add', quantity_change: '', unit_price_change: '', description: '' });
    setBoqAddOpen(true);
  };

  const handleBoqAdd = async () => {
    try {
      await engineeringApi.variationOrders.addBoqItem(impactVO.id, {
        boq_item_id: Number(boqForm.boq_item_id),
        impact_type: boqForm.impact_type,
        quantity_change: Number(boqForm.quantity_change) || 0,
        unit_price_change: Number(boqForm.unit_price_change) || 0,
        description: boqForm.description || null,
      });
      setBoqAddOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      const r = await engineeringApi.variationOrders.impactSummary(impactVO.id);
      setImpactSummary(r.data);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleBoqDelete = async (itemId) => {
    try {
      await engineeringApi.variationOrders.deleteBoqItem(impactVO.id, itemId);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      const r = await engineeringApi.variationOrders.impactSummary(impactVO.id);
      setImpactSummary(r.data);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const openSchedAdd = async () => {
    try {
      const r = await engineeringApi.schedules.listByProject(selectedProjectId);
      setSchedules(r.data || []);
    } catch { setSchedules([]); }
    setSchedForm({ schedule_id: '', days_change: '', description: '' });
    setSchedAddOpen(true);
  };

  const handleSchedAdd = async () => {
    try {
      await engineeringApi.variationOrders.addScheduleImpact(impactVO.id, {
        schedule_id: Number(schedForm.schedule_id),
        days_change: Number(schedForm.days_change) || 0,
        description: schedForm.description || null,
      });
      setSchedAddOpen(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      const r = await engineeringApi.variationOrders.impactSummary(impactVO.id);
      setImpactSummary(r.data);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleSchedDelete = async (impactId) => {
    try {
      await engineeringApi.variationOrders.deleteScheduleImpact(impactVO.id, impactId);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      const r = await engineeringApi.variationOrders.impactSummary(impactVO.id);
      setImpactSummary(r.data);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const statusChip = (value) => {
    const c = VO_STATUS_CHIP[value] || VO_STATUS_CHIP.draft;
    return <Chip label={t(`voStatus_${value}`) || value} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 500, borderRadius: 1 }} />;
  };

  const impactChip = (value) => {
    const c = IMPACT_TYPE_CHIP[value] || IMPACT_TYPE_CHIP.add;
    return <Chip label={t(c.label.toLowerCase()) || c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 500, borderRadius: 1 }} />;
  };

  const columns = [
    { field: 'vo_number', headerName: 'VO #', width: 120 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'reason', headerName: 'Reason', width: 120 },
    { field: 'amount_change', headerName: 'Amount', type: 'number', width: 120, renderCell: (p) => <Typography color={Number(p.value) >= 0 ? 'error.main' : 'success.main'} fontWeight={600}>{formatNumber(p.value)}</Typography> },
    { field: 'days_change', headerName: 'Days', type: 'number', width: 80 },
    { field: 'status', headerName: t('status'), width: 120, renderCell: (p) => statusChip(p.value) },
    { field: 'submitted_date', headerName: 'Submitted', width: 110, renderCell: (p) => formatDate(p.value) },
    { field: 'approved_date', headerName: 'Approved', width: 110, renderCell: (p) => formatDate(p.value) },
    {
      field: 'actions', headerName: t('actions'), width: 200, sortable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => openImpact(p.row)} sx={{ color: '#D97706', backgroundColor: 'rgba(139,92,246,0.08)', '&:hover': { backgroundColor: 'rgba(139,92,246,0.16)' } }}>
            <Analytics fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => openEdit(p.row)} sx={{ color: '#D97706', backgroundColor: 'rgba(217,119,6,0.08)', '&:hover': { backgroundColor: 'rgba(217,119,6,0.16)' } }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => { setDeleteId(p.row.id); setDeleteOpen(true); }} sx={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', '&:hover': { backgroundColor: 'rgba(239,68,68,0.16)' } }}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('variationOrders')}</Typography>
          {selectedProjectId && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>{t('create')}</Button>}
        </Stack>
        <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 2, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {!selectedProjectId ? <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} /> : (
          <Card><Box sx={{ height: 500 }}><DataGrid
            rows={data} columns={columns} loading={loading} pageSizeOptions={[20]}
            localeText={i18n.language === 'ar' ? arSD : enUS}
            getRowId={(row) => row.id}
          /></Box></Card>
        )}

        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editItem ? 'Edit VO' : 'Create VO'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="VO Number" required size="small" value={form.vo_number} onChange={(e) => setForm(f => ({ ...f, vo_number: e.target.value }))} />
              <TextField label="Title" required size="small" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              <TextField label="Description" multiline rows={2} size="small" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              <TextField select label="Reason" size="small" value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}>
                <MenuItem value="">Select reason</MenuItem>
                <MenuItem value="design_change">Design Change</MenuItem>
                <MenuItem value="additional_work">Additional Work</MenuItem>
                <MenuItem value="omitted_work">Omitted Work</MenuItem>
                <MenuItem value="site_condition">Site Condition</MenuItem>
                <MenuItem value="owner_request">Owner Request</MenuItem>
              </TextField>
              <TextField select label="Contract" size="small" value={form.contract_id} onChange={(e) => setForm(f => ({ ...f, contract_id: e.target.value }))}>
                <MenuItem value="">Select contract</MenuItem>
                {contracts.map(c => <MenuItem key={c.id} value={c.id}>{c.contract_number}</MenuItem>)}
              </TextField>
              <Stack direction="row" spacing={2}>
                <TextField label="Amount Change" type="number" size="small" fullWidth value={form.amount_change} onChange={(e) => setForm(f => ({ ...f, amount_change: e.target.value }))} />
                <TextField label="Days Change" type="number" size="small" fullWidth value={form.days_change} onChange={(e) => setForm(f => ({ ...f, days_change: e.target.value }))} />
              </Stack>
              <TextField label="Submitted Date" type="date" size="small" fullWidth value={form.submitted_date} onChange={(e) => setForm(f => ({ ...f, submitted_date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <Button variant="contained" onClick={handleSubmit}>{t('save')}</Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title={t('confirmDelete')} />

        <Dialog open={impactOpen} onClose={() => setImpactOpen(false)} maxWidth="lg" fullWidth TransitionComponent={Fade} transitionDuration={250}>
          <DialogTitle sx={{ pb: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Analytics color="secondary" />
              <Typography variant="h6" fontWeight={700}>{t('impactAnalysis')} - {impactVO?.vo_number || ''}</Typography>
            </Stack>
          </DialogTitle>
          <Divider sx={{ my: 1.5 }} />
          <DialogContent>
            {impactSummary && (
              <Card sx={{ mb: 3, px: 2.5, py: 2, background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">{t('totalAmountChange')}</Typography>
                    <Typography variant="h6" color="#fbbf24" fontWeight={700}>{formatNumber(impactSummary.total_amount_change)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">{t('totalDaysChange')}</Typography>
                    <Typography variant="h6" color="#fbbf24" fontWeight={700}>{impactSummary.total_days_change} days</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">{t('approved')} Amount</Typography>
                    <Typography variant="h6" color="#34d399" fontWeight={700}>{formatNumber(impactSummary.approved_amount)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">{t('approved')} Days</Typography>
                    <Typography variant="h6" color="#34d399" fontWeight={700}>{impactSummary.approved_days} days</Typography>
                  </Grid>
                </Grid>
              </Card>
            )}

            <Stack direction="row" spacing={1} mb={1}>
              <Button size="small" variant={impactVO?.status === 'draft' ? 'contained' : 'outlined'} color="warning" onClick={() => handleStatusChange(impactVO.id, 'submitted')}>Submit</Button>
              <Button size="small" variant={impactVO?.status === 'submitted' ? 'contained' : 'outlined'} color="success" onClick={() => handleStatusChange(impactVO.id, 'approved')}>Approve</Button>
              <Button size="small" variant={impactVO?.status === 'submitted' ? 'contained' : 'outlined'} color="error" onClick={() => handleStatusChange(impactVO.id, 'rejected')}>Reject</Button>
            </Stack>

            <Tabs value={impactTab} onChange={(_, v) => setImpactTab(v)} sx={{ mb: 2 }} variant="scrollable">
              <Tab label={t('affectedBoqItems')} />
              <Tab label={t('affectedScheduleTasks')} />
            </Tabs>

            <TabPanel value={impactTab} index={0}>
              <Stack direction="row" justifyContent="flex-end" mb={1}>
                <Button size="small" variant="contained" startIcon={<Add />} onClick={openBoqAdd}>{t('addImpact')}</Button>
              </Stack>
              {impactLoading ? (
                <Typography variant="body2" color="text.secondary">{t('loading')}</Typography>
              ) : !impactSummary?.affected_boq_items?.length ? (
                <Typography variant="body2" color="text.secondary">{t('noData')}</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>BOQ Code</TableCell>
                        <TableCell>{t('description')}</TableCell>
                        <TableCell>{t('impactType')}</TableCell>
                        <TableCell align="right">Qty Change</TableCell>
                        <TableCell align="right">Unit Price Change</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {impactSummary.affected_boq_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.boq_item_code || '-'}</TableCell>
                          <TableCell>{item.boq_item_description || '-'}</TableCell>
                          <TableCell>{impactChip(item.impact_type)}</TableCell>
                          <TableCell align="right">{formatNumber(item.quantity_change)}</TableCell>
                          <TableCell align="right">{formatNumber(item.unit_price_change)}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleBoqDelete(item.id)} color="error"><Delete fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            <TabPanel value={impactTab} index={1}>
              <Stack direction="row" justifyContent="flex-end" mb={1}>
                <Button size="small" variant="contained" startIcon={<Add />} onClick={openSchedAdd}>{t('addImpact')}</Button>
              </Stack>
              {impactLoading ? (
                <Typography variant="body2" color="text.secondary">{t('loading')}</Typography>
              ) : !impactSummary?.affected_schedule_tasks?.length ? (
                <Typography variant="body2" color="text.secondary">{t('noData')}</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('taskName')}</TableCell>
                        <TableCell align="right">{t('daysChange') || 'Days Change'}</TableCell>
                        <TableCell>{t('description')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {impactSummary.affected_schedule_tasks.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.task_name || '-'}</TableCell>
                          <TableCell align="right">{item.days_change}</TableCell>
                          <TableCell>{item.description || '-'}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleSchedDelete(item.id)} color="error"><Delete fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setImpactOpen(false)}>{t('close')}</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={boqAddOpen} onClose={() => setBoqAddOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('addImpact')} - BOQ</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField select label="BOQ Item" size="small" required value={boqForm.boq_item_id} onChange={(e) => setBoqForm(f => ({ ...f, boq_item_id: e.target.value }))}>
                <MenuItem value="">Select BOQ item</MenuItem>
                {boqItems.map((b) => <MenuItem key={b.id} value={b.id}>{b.item_code} - {b.description}</MenuItem>)}
              </TextField>
              <TextField select label={t('impactType')} size="small" value={boqForm.impact_type} onChange={(e) => setBoqForm(f => ({ ...f, impact_type: e.target.value }))}>
                <MenuItem value="add">{t('addDel')}</MenuItem>
                <MenuItem value="remove">{t('remove')}</MenuItem>
                <MenuItem value="modify">{t('modify')}</MenuItem>
              </TextField>
              <Stack direction="row" spacing={2}>
                <TextField label="Qty Change" type="number" size="small" fullWidth value={boqForm.quantity_change} onChange={(e) => setBoqForm(f => ({ ...f, quantity_change: e.target.value }))} />
                <TextField label="Unit Price Change" type="number" size="small" fullWidth value={boqForm.unit_price_change} onChange={(e) => setBoqForm(f => ({ ...f, unit_price_change: e.target.value }))} />
              </Stack>
              <TextField label={t('description')} multiline rows={2} size="small" value={boqForm.description} onChange={(e) => setBoqForm(f => ({ ...f, description: e.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBoqAddOpen(false)}>{t('cancel')}</Button>
            <Button variant="contained" onClick={handleBoqAdd}>{t('save')}</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={schedAddOpen} onClose={() => setSchedAddOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('addImpact')} - Schedule</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField select label={t('taskName')} size="small" required value={schedForm.schedule_id} onChange={(e) => setSchedForm(f => ({ ...f, schedule_id: e.target.value }))}>
                <MenuItem value="">Select task</MenuItem>
                {schedules.map((s) => <MenuItem key={s.id} value={s.id}>{s.task_name}</MenuItem>)}
              </TextField>
              <TextField label={t('daysChange') || 'Days Change'} type="number" size="small" fullWidth value={schedForm.days_change} onChange={(e) => setSchedForm(f => ({ ...f, days_change: e.target.value }))} />
              <TextField label={t('description')} multiline rows={2} size="small" value={schedForm.description} onChange={(e) => setSchedForm(f => ({ ...f, description: e.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSchedAddOpen(false)}>{t('cancel')}</Button>
            <Button variant="contained" onClick={handleSchedAdd}>{t('save')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}
