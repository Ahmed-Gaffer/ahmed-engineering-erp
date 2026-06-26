import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid, Card, CardContent, Typography, Box, Stack, Chip, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem, TextField, Link,
} from '@mui/material';
import {
  Assessment, Download, AccountBalance, Construction,
  Folder, Receipt, Schedule, Engineering, WarningAmber,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import StatsCard from '../../components/StatsCard/StatsCard';
import StatsCardSkeleton from '../../components/Skeleton/StatsCardSkeleton';
import { engineeringApi } from '../../services/api';
import { formatNumber, formatDate, statusColors } from '../../utils/helpers';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
const STATUS_COLORS = {
  planned: '#6366f1', in_progress: '#10b981', completed: '#06b6d4', delayed: '#ef4444',
  on_hold: '#f59e0b', cancelled: '#6b7280', issued: '#6366f1', under_execution: '#10b981',
  closed: '#6b7280', active: '#10b981', not_started: '#6b7280', draft: '#f59e0b',
  submitted: '#6366f1', approved: '#10b981', rejected: '#ef4444', paid: '#06b6d4',
  low: '#10b981', medium: '#f59e0b', high: '#ef4444', urgent: '#dc2626',
  overdue: '#ef4444',
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};
const sectionSx = {
  mb: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.04)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
};

function TabPanel({ children, value, index }) {
  return value === index ? <motion.div variants={itemVariants} initial="hidden" animate="show">{children}</motion.div> : null;
}

export default function Reports() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? arSD : enUS;
  const [tab, setTab] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(false);

  const [financial, setFinancial] = useState(null);
  const [progress, setProgress] = useState(null);
  const [workOrders, setWorkOrders] = useState(null);
  const [schedules, setSchedules] = useState(null);
  const [daily, setDaily] = useState(null);

  const [financialDetail, setFinancialDetail] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [woFilter, setWoFilter] = useState({ status: '', priority: '' });
  const [schedFilter, setSchedFilter] = useState({ project_id: '', status: '' });
  const [projects, setProjects] = useState([]);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    setLoading({ financial: true, progress: true, workOrders: true, schedules: true, daily: true });
    Promise.all([
      engineeringApi.dashboard.summary().catch(() => ({ data: {} })),
      fetchReport('financial').then(setFinancial).catch(() => {}),
      fetchReport('progress').then(setProgress).catch(() => {}),
      fetchReport('work-orders').then(setWorkOrders).catch(() => {}),
      fetchReport('schedules').then(setSchedules).catch(() => {}),
      fetchReport('daily').then(setDaily).catch(() => {}),
    ])
      .then(() => setLoaded(true))
      .catch(() => setError(true))
      .finally(() => setLoading({}));
  }, []);

  const fetchReport = async (type) => {
    const token = localStorage.getItem('token');
    const base = '/api/engineering/reports';
    const res = await fetch(`${base}/${type}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Report ${type} failed`);
    return res.json();
  };

  const fetchReportWithFilters = async (type, filters = {}) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const res = await fetch(`/api/engineering/reports/${type}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Report ${type} failed`);
    return res.json();
  };

  const exportReport = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/engineering/reports/${type}/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${type}_report.xlsx`; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const loadFinancialDetail = async (projectId) => {
    if (!projectId) { setFinancialDetail(null); return; }
    setLoading(prev => ({ ...prev, financialDetail: true }));
    try {
      const res = await engineeringApi.reports.projectFinancial(projectId);
      setFinancialDetail(res.data);
    } catch {}
    setLoading(prev => ({ ...prev, financialDetail: false }));
  };

  const loadComparisonData = async () => {
    setLoading(prev => ({ ...prev, comparison: true }));
    try {
      const res = await engineeringApi.reports.projectComparison();
      setComparisonData(res.data);
    } catch {}
    setLoading(prev => ({ ...prev, comparison: false }));
  };

  const loadProjectsList = async () => {
    try {
      const res = await engineeringApi.projects.list();
      setProjectsList(res.data);
    } catch {}
  };

  const handleTabChange = async (_, val) => {
    setTab(val);
    if (val === 2 && !workOrders) {
      setLoading(prev => ({ ...prev, workOrders: true }));
      const data = await fetchReport('work-orders');
      setWorkOrders(data);
      setLoading(prev => ({ ...prev, workOrders: false }));
    }
    if (val === 3 && !schedules) {
      setLoading(prev => ({ ...prev, schedules: true }));
      const data = await fetchReport('schedules');
      setSchedules(data);
      setLoading(prev => ({ ...prev, schedules: false }));
    }
    if (val === 4 && !daily) {
      setLoading(prev => ({ ...prev, daily: true }));
      const data = await fetchReport('daily');
      setDaily(data);
      setLoading(prev => ({ ...prev, daily: false }));
    }
    if (val === 5) {
      loadProjectsList();
    }
    if (val === 6 && !comparisonData) {
      loadComparisonData();
    }
  };

  const handleWoFilter = async (key, value) => {
    const newFilter = { ...woFilter, [key]: value };
    setWoFilter(newFilter);
    setLoading(prev => ({ ...prev, workOrders: true }));
    const data = await fetchReportWithFilters('work-orders', newFilter);
    setWorkOrders(data);
    setLoading(prev => ({ ...prev, workOrders: false }));
  };

  const handleSchedFilter = async (key, value) => {
    const newFilter = { ...schedFilter, [key]: value };
    setSchedFilter(newFilter);
    setLoading(prev => ({ ...prev, schedules: true }));
    const data = await fetchReportWithFilters('schedules', newFilter);
    setSchedules(data);
    setLoading(prev => ({ ...prev, schedules: false }));
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  if (!loaded) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('reports')}</Typography>
        </Stack>
        <Grid container spacing={2.5} mb={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} item xs={12} sm={6} md={3}><StatsCardSkeleton /></Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">{t('reportsUnavailable')}</Typography>
      </Box>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">{t('reports')}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>{t('reportsSubtitle')}</Typography>
        </Box>
      </Stack>

      <Card sx={sectionSx}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ px: 2, pt: 1 }}>
          <Tab label={t('executiveSummary')} />
          <Tab label={t('financialReport')} />
          <Tab label={t('workOrdersReport')} />
          <Tab label={t('scheduleReport')} />
          <Tab label={t('dailyReportSummary')} />
          <Tab label={t('projectFinancialDetail')} />
          <Tab label={t('projectComparison')} />
        </Tabs>
      </Card>

      {/* ── Tab 0: Executive Summary ── */}
      <TabPanel value={tab} index={0}>
        <ExecutiveSummary />
      </TabPanel>

      {/* ── Tab 1: Financial Report ── */}
      <TabPanel value={tab} index={1}>
        <FinancialReportTab financial={financial} exportReport={exportReport} navigateTo={navigateTo} />
      </TabPanel>

      {/* ── Tab 2: Work Orders Report ── */}
      <TabPanel value={tab} index={2}>
        <WorkOrdersTab data={workOrders} loading={loading.workOrders} woFilter={woFilter}
          onFilter={handleWoFilter} exportReport={exportReport} navigateTo={navigateTo} />
      </TabPanel>

      {/* ── Tab 3: Schedules Report ── */}
      <TabPanel value={tab} index={3}>
        <SchedulesTab data={schedules} loading={loading.schedules} schedFilter={schedFilter}
          onFilter={handleSchedFilter} exportReport={exportReport} navigateTo={navigateTo} />
      </TabPanel>

      {/* ── Tab 4: Daily Reports ── */}
      <TabPanel value={tab} index={4}>
        <DailyTab data={daily} loading={loading.daily} exportReport={exportReport} navigateTo={navigateTo} />
      </TabPanel>

      {/* ── Tab 5: Financial Detail ── */}
      <TabPanel value={tab} index={5}>
        <FinancialDetailTab financialDetail={financialDetail} loading={loading.financialDetail}
          projectsList={projectsList} selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId} loadFinancialDetail={loadFinancialDetail} />
      </TabPanel>

      {/* ── Tab 6: Project Comparison ── */}
      <TabPanel value={tab} index={6}>
        <ProjectComparisonTab data={comparisonData} loading={loading.comparison}
          exportReport={exportReport} />
      </TabPanel>
    </motion.div>
  );

  function ExecutiveSummary() {
    return (
      <>
        <motion.div variants={itemVariants}>
          <Card sx={sectionSx}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('executiveSummary')}</Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard title={t('totalProjects')} value={progress?.total_projects || 0} icon={<Folder />} color="primary" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard title={t('totalContracts')} value={financial?.total_contracts || 0} icon={<Construction />} color="info" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard title={t('totalWorkOrders')} value={workOrders?.total || 0} icon={<Engineering />} color="secondary" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard title={t('totalIpcCount')} value={financial?.total_ipcs || 0} icon={<Receipt />} color="warning" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard title={t('totalBoqItems')} value={financial?.contracts?.[0] || 0} icon={<Assessment />} color="secondary" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard title={t('delayedProjects')} value={progress?.delayed_projects || 0}
                    icon={<WarningAmber />} color={progress?.delayed_projects > 0 ? 'error' : 'success'} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard title={t('avgScheduleProgress')}
                    value={`${progress?.avg_progress || 0}%`} icon={<Schedule />} color="info" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard title={t('totalScheduledTasks')}
                    value={schedules?.total || 0} icon={<Schedule />} color="primary" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        <Grid container spacing={2.5}>
          {progress?.projects_by_status?.length > 0 && (
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Card sx={sectionSx}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('projectsByStatus')}</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={progress.projects_by_status} dataKey="count" nameKey="status"
                          cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${t(status)} (${count})`}>
                          {progress.projects_by_status.map((entry, i) => (
                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )}

          {financial?.ipc_by_status?.length > 0 && (
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Card sx={sectionSx}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('ipcByStatus')}</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={financial.ipc_by_status}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" tickFormatter={(v) => t(v)} />
                        <YAxis />
                        <Tooltip labelFormatter={(v) => t(v)} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )}
        </Grid>

        {progress?.projects?.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card sx={{ ...sectionSx, overflow: 'hidden' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('projectComparison')}</Typography>
                <Box sx={{ height: 380 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progress.projects} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="code" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="schedule_progress" name={t('progressPercentage')} fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ipc_paid" name={t('totalIpcPaid')} fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </>
    );
  }
}

function FinancialReportTab({ financial, exportReport, navigateTo }) {
  const { t, i18n } = useTranslation();
  if (!financial) return <StatsCardSkeleton />;

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card sx={sectionSx}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>{t('financialSummary')}</Typography>
              <Button size="small" variant="outlined" startIcon={<Download />} onClick={() => exportReport('financial')}>
                {t('exportExcel')}
              </Button>
            </Stack>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalContractValue')} value={formatNumber(financial.total_contract_value)} icon={<AccountBalance />} color="primary" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalBoqValue')} value={formatNumber(financial.total_boq_value)} icon={<Assessment />} color="secondary" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalIpcPaid')} value={formatNumber(financial.total_ipc_paid)} icon={<Receipt />} color="success" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('remainingBalance')} value={formatNumber(financial.remaining_balance)} icon={<AccountBalance />} color="warning" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={2.5}>
        {financial.contracts_by_status?.length > 0 && (
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Card sx={sectionSx}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('contracts')} {t('byStatus')}</Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={financial.contracts_by_status} dataKey="count" nameKey="status"
                        cx="50%" cy="50%" outerRadius={90}
                        label={({ status, count }) => `${t(status)} (${count})`}>
                        {financial.contracts_by_status.map((entry, i) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card sx={sectionSx}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('projectBreakdown')}</Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2, maxHeight: 280 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>{t('project')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('contractValue')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('totalIpcAmount')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('totalIpcPaid')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {financial.project_breakdown.map((p) => (
                        <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigateTo(`/engineering/projects`)}>
                          <TableCell>
                            <Link component="button" variant="body2" underline="hover" sx={{ fontWeight: 500 }}>
                              {p.code}
                            </Link>
                          </TableCell>
                          <TableCell align="right">{formatNumber(p.contract_value)}</TableCell>
                          <TableCell align="right">{formatNumber(p.ipc_total)}</TableCell>
                          <TableCell align="right">{formatNumber(p.ipc_paid)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
}

function WorkOrdersTab({ data, loading, woFilter, onFilter, exportReport, navigateTo }) {
  const { t, i18n } = useTranslation();
  if (!data && !loading) return <Typography color="text.secondary" textAlign="center" py={4}>{t('noReportsData')}</Typography>;

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card sx={sectionSx}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>{t('workOrdersReport')}</Typography>
              <Stack direction="row" spacing={1.5}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>{t('filterByPriority')}</InputLabel>
                  <Select value={woFilter.priority} label={t('filterByPriority')}
                    onChange={(e) => onFilter('priority', e.target.value)}>
                    <MenuItem value="">{t('all')}</MenuItem>
                    {['low', 'medium', 'high', 'urgent'].map((v) => (
                      <MenuItem key={v} value={v}>{t(v)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>{t('filterByStatus')}</InputLabel>
                  <Select value={woFilter.status} label={t('filterByStatus')}
                    onChange={(e) => onFilter('status', e.target.value)}>
                    <MenuItem value="">{t('all')}</MenuItem>
                    {['issued', 'under_execution', 'completed', 'closed', 'cancelled'].map((v) => (
                      <MenuItem key={v} value={v}>{t(v)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button size="small" variant="outlined" startIcon={<Download />} onClick={() => exportReport('work-orders')}>
                  {t('exportExcel')}
                </Button>
              </Stack>
            </Stack>
            {loading ? <StatsCardSkeleton /> : (
              <Box sx={{ height: 480 }}>
                <DataGrid
                  rows={data?.orders || []}
                  columns={[
                    { field: 'wo_number', headerName: t('woNumber'), width: 110,
                      renderCell: (p) => <Link component="button" variant="body2" underline="hover" fontWeight={600}
                        onClick={() => navigateTo('/engineering/work-orders')}>{p.value}</Link> },
                    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 160 },
                    { field: 'project_name', headerName: t('project'), flex: 1, minWidth: 140,
                      renderCell: (p) => <Link component="button" variant="body2" underline="hover"
                        onClick={() => navigateTo('/engineering/projects')}>{p.value}</Link> },
                    { field: 'priority', headerName: t('priority'), width: 90,
                      renderCell: (p) => <Chip label={t(p.value)} size="small" color={statusColors[p.value] || 'default'} variant="outlined" /> },
                    { field: 'status', headerName: t('status'), width: 120,
                      renderCell: (p) => <Chip label={t(p.value)} size="small" color={statusColors[p.value] || 'default'} variant="outlined" /> },
                    { field: 'issue_date', headerName: t('issueDate'), width: 100,
                      valueGetter: (v) => v ? new Date(v) : null,
                      renderCell: (p) => p.value ? formatDate(p.value) : '-' },
                    { field: 'total_amount', headerName: t('totalPrice'), width: 120,
                      renderCell: (p) => <Typography variant="body2" fontWeight={500}>{formatNumber(p.value)}</Typography> },
                  ]}
                  getRowId={(r) => r.id}
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={{ page: 0, pageSize: 10 }}
                  disableRowSelectionOnClick
                  localeText={i18n.language === 'ar' ? arSD : enUS}
                  sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {data?.by_priority?.length > 0 && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Card sx={sectionSx}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('workOrders')} {t('byPriority')}</Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={data.by_priority} dataKey="count" nameKey="priority"
                        cx="50%" cy="50%" outerRadius={80}
                        label={({ priority, count }) => `${t(priority)} (${count})`}>
                        {data.by_priority.map((entry, i) => (
                          <Cell key={entry.priority} fill={STATUS_COLORS[entry.priority] || CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, t(n)]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Card sx={sectionSx}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('workOrders')} {t('byStatus')}</Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.by_status}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" tickFormatter={(v) => t(v)} />
                      <YAxis />
                      <Tooltip labelFormatter={(v) => t(v)} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}
    </>
  );
}

function SchedulesTab({ data, loading, schedFilter, onFilter, exportReport, navigateTo }) {
  const { t, i18n } = useTranslation();
  if (!data && !loading) return <Typography color="text.secondary" textAlign="center" py={4}>{t('noReportsData')}</Typography>;

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card sx={sectionSx}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>{t('scheduleReport')}</Typography>
              <Stack direction="row" spacing={1.5}>
                <Button size="small" variant="outlined" startIcon={<Download />} onClick={() => exportReport('schedules')}>
                  {t('exportExcel')}
                </Button>
              </Stack>
            </Stack>
            {loading ? <StatsCardSkeleton /> : (
              <Box sx={{ height: 480 }}>
                <DataGrid
                  rows={data?.schedules || []}
                  columns={[
                    { field: 'task_name', headerName: t('taskName'), flex: 1.5, minWidth: 180,
                      renderCell: (p) => <Link component="button" variant="body2" underline="hover" fontWeight={600}
                        onClick={() => navigateTo('/engineering/schedules')}>{p.value}</Link> },
                    { field: 'project_name', headerName: t('project'), flex: 1, minWidth: 140,
                      renderCell: (p) => <Link component="button" variant="body2" underline="hover"
                        onClick={() => navigateTo('/engineering/projects')}>{p.value}</Link> },
                    { field: 'start_date', headerName: t('startDate'), width: 100,
                      valueGetter: (v) => v ? new Date(v) : null,
                      renderCell: (p) => p.value ? formatDate(p.value) : '-' },
                    { field: 'end_date', headerName: t('endDatePlanned'), width: 100,
                      valueGetter: (v) => v ? new Date(v) : null,
                      renderCell: (p) => p.value ? formatDate(p.value) : '-' },
                    { field: 'duration_days', headerName: t('durationDays'), width: 120, type: 'number' },
                    { field: 'progress_percent', headerName: t('progressPercentage'), width: 120,
                      renderCell: (p) => (
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: '100%', height: '100%' }}>
                          <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                            <Box sx={{ width: `${p.value || 0}%`, height: '100%', borderRadius: 3,
                              background: 'linear-gradient(90deg, #6366f1, #818cf8)', transition: 'width 0.6s ease' }} />
                          </Box>
                          <Typography variant="caption" fontWeight={600} sx={{ minWidth: 36, textAlign: 'right' }}>
                            {p.value || 0}%
                          </Typography>
                        </Stack>
                      ),
                    },
                    { field: 'status', headerName: t('status'), width: 110,
                      renderCell: (p) => <Chip label={t(p.value)} size="small" color={statusColors[p.value] || 'default'} variant="outlined" /> },
                    { field: 'responsible', headerName: t('responsible'), width: 140 },
                  ]}
                  getRowId={(r) => r.id}
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={{ page: 0, pageSize: 10 }}
                  disableRowSelectionOnClick
                  localeText={i18n.language === 'ar' ? arSD : enUS}
                  sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {data?.by_status?.length > 0 && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Card sx={sectionSx}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('byStatus')}</Typography>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={data.by_status} dataKey="count" nameKey="status"
                        cx="50%" cy="50%" outerRadius={75}
                        label={({ status, count }) => `${t(status)} (${count})`}>
                        {data.by_status.map((entry, i) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Card sx={sectionSx}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('avgScheduleProgress')}</Typography>
                  <Typography variant="h3" fontWeight={700} color="primary.main">{data.avg_progress || 0}%</Typography>
                  <Typography variant="body2" color="text.secondary">{data.total} {t('totalScheduledTasks')}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}
    </>
  );
}

function FinancialDetailTab({ financialDetail, loading, projectsList, selectedProjectId, setSelectedProjectId, loadFinancialDetail }) {
  const { t } = useTranslation();

  const handleExportCsv = async () => {
    try {
      const res = await engineeringApi.reports.dashboardExport();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'dashboard_export.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handleProjectChange = (e) => {
    const pid = e.target.value;
    setSelectedProjectId(pid);
    loadFinancialDetail(pid);
  };

  const chartData = financialDetail ? [
    { name: t('contractValue'), value: Number(financialDetail.contract_value) },
    { name: t('totalBoqValue'), value: Number(financialDetail.boq_total) },
    { name: t('totalBilled'), value: Number(financialDetail.total_billed) },
    { name: t('totalIpcPaid'), value: Number(financialDetail.total_paid) },
    { name: t('totalVoAmount'), value: Number(financialDetail.total_vo_amount) },
  ] : [];

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card sx={sectionSx}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>{t('projectFinancialDetail')}</Typography>
              <Stack direction="row" spacing={1.5}>
                <FormControl size="small" sx={{ minWidth: 250 }}>
                  <InputLabel>{t('selectProject')}</InputLabel>
                  <Select value={selectedProjectId} label={t('selectProject')} onChange={handleProjectChange}>
                    <MenuItem value="">{t('selectProject')}</MenuItem>
                    {projectsList.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.code} - {p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button size="small" variant="outlined" startIcon={<Download />} onClick={handleExportCsv}>
                  {t('exportCsv')}
                </Button>
              </Stack>
            </Stack>
            {loading ? <StatsCardSkeleton /> : !financialDetail ? (
              <Typography color="text.secondary" textAlign="center" py={4}>{t('selectProjectDescription')}</Typography>
            ) : (
              <>
                <Grid container spacing={2.5} mb={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('contractValue')} value={formatNumber(financialDetail.contract_value)} icon={<AccountBalance />} color="primary" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('boqTotal')} value={formatNumber(financialDetail.boq_total)} icon={<Assessment />} color="secondary" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('totalBilled')} value={formatNumber(financialDetail.total_billed)} icon={<Receipt />} color="info" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('totalIpcPaid')} value={formatNumber(financialDetail.total_paid)} icon={<Receipt />} color="success" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('variationOrdersTotal')} value={formatNumber(financialDetail.total_vo_amount)} icon={<WarningAmber />} color="warning" />
                  </Grid>
                </Grid>
                <Grid container spacing={2.5} mb={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('plannedValue')} value={formatNumber(financialDetail.planned_value)} icon={<Assessment />} color="info" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('earnedValue')} value={formatNumber(financialDetail.earned_value)} icon={<Assessment />} color="primary" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('actualCost')} value={formatNumber(financialDetail.actual_cost)} icon={<Assessment />} color="warning" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('spi')} value={Number(financialDetail.spi).toFixed(2)}
                      icon={<Assessment />} color={Number(financialDetail.spi) >= 1 ? 'success' : 'error'} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatsCard title={t('cpi')} value={Number(financialDetail.cpi).toFixed(2)} icon={<Assessment />} color="secondary" />
                  </Grid>
                </Grid>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <StatsCard title={t('remainingBudget')} value={formatNumber(financialDetail.remaining_budget)} icon={<AccountBalance />} color="info" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StatsCard title={t('percentSpent')} value={`${Number(financialDetail.percent_spent).toFixed(1)}%`} icon={<Assessment />} color="warning" />
                  </Grid>
                </Grid>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {financialDetail && (
        <motion.div variants={itemVariants}>
          <Card sx={sectionSx}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('financialReport')}</Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatNumber(v)} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
}

function ProjectComparisonTab({ data, loading, exportReport }) {
  const { t, i18n } = useTranslation();

  const chartData = (data || []).map((p) => ({
    name: p.code,
    contract: Number(p.contract_value),
    billed: Number(p.total_billed),
    paid: Number(p.total_paid),
  }));

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card sx={sectionSx}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>{t('projectComparison')}</Typography>
              <Button size="small" variant="outlined" startIcon={<Download />}
                onClick={() => exportReport('project-comparison')}>
                {t('exportExcel')}
              </Button>
            </Stack>
            {loading ? <StatsCardSkeleton /> : !data?.length ? (
              <Typography color="text.secondary" textAlign="center" py={4}>{t('noReportsData')}</Typography>
            ) : (
              <>
                <Box sx={{ height: 380 }} mb={3}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(v) => formatNumber(v)} />
                      <Legend />
                      <Bar dataKey="contract" name={t('contractValue')} fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="billed" name={t('totalBilled')} fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="paid" name={t('totalIpcPaid')} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>{t('project')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('contractValue')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('totalBilled')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('totalIpcPaid')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('executionRate')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('financialProgress')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell><Typography variant="body2" fontWeight={500}>{p.code} - {p.name}</Typography></TableCell>
                          <TableCell align="right">{formatNumber(p.contract_value)}</TableCell>
                          <TableCell align="right">{formatNumber(p.total_billed)}</TableCell>
                          <TableCell align="right">{formatNumber(p.total_paid)}</TableCell>
                          <TableCell align="right">{Number(p.execution_rate).toFixed(1)}%</TableCell>
                          <TableCell align="right">{Number(p.financial_progress).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

function DailyTab({ data, loading, exportReport, navigateTo }) {
  const { t, i18n } = useTranslation();
  if (!data && !loading) return <Typography color="text.secondary" textAlign="center" py={4}>{t('noReportsData')}</Typography>;

  return (
    <motion.div variants={itemVariants}>
      <Card sx={sectionSx}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={600}>{t('dailyReportSummary')}</Typography>
            <Button size="small" variant="outlined" startIcon={<Download />} onClick={() => exportReport('daily')}>
              {t('exportExcel')}
            </Button>
          </Stack>
          <Grid container spacing={2.5} mb={2}>
            <Grid item xs={12} sm={4}>
              <StatsCard title={t('totalDailyReports')} value={data?.total_reports || 0} icon={<Assessment />} color="info" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard title={t('manpowerCount')} value={data?.total_manpower || 0} icon={<Engineering />} color="primary" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard title={t('equipmentCount')} value={data?.total_equipment || 0} icon={<Construction />} color="secondary" />
            </Grid>
          </Grid>
          {loading ? <StatsCardSkeleton /> : (
            <Box sx={{ height: 480 }}>
              <DataGrid
                rows={data?.reports || []}
                columns={[
                  { field: 'report_date', headerName: t('reportDate'), width: 100,
                    valueGetter: (v) => v ? new Date(v) : null,
                    renderCell: (p) => p.value ? formatDate(p.value) : '-' },
                  { field: 'project_name', headerName: t('project'), flex: 1, minWidth: 140,
                    renderCell: (p) => <Link component="button" variant="body2" underline="hover"
                      onClick={() => navigateTo('/engineering/daily-reports')}>{p.value}</Link> },
                  { field: 'weather', headerName: t('weather'), width: 90 },
                  { field: 'manpower_count', headerName: t('manpowerCount'), width: 100, type: 'number' },
                  { field: 'equipment_count', headerName: t('equipmentCount'), width: 100, type: 'number' },
                  { field: 'work_description', headerName: t('workDescription'), flex: 1.5, minWidth: 200 },
                  { field: 'issues', headerName: t('issues'), flex: 1, minWidth: 150,
                    renderCell: (p) => p.value
                      ? <Chip label={p.value} size="small" color="warning" variant="outlined" />
                      : '-' },
                  { field: 'created_by', headerName: t('createdBy'), width: 120 },
                ]}
                getRowId={(r) => r.id}
                pageSizeOptions={[10, 25, 50]}
                paginationModel={{ page: 0, pageSize: 10 }}
                disableRowSelectionOnClick
                localeText={i18n.language === 'ar' ? arSD : enUS}
                sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
