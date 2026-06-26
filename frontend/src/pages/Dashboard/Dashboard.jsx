import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardContent, Typography, Box, Stack, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Tooltip as MuiTooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Folder, MonetizationOn, ListAlt, Receipt, TrendingUp,
  CheckCircle, ThumbUpAlt, Description, Image, Speed, AccountBalance, MoneyOff,
  CompareArrows, QuestionAnswer, Download, ShowChart, BarChart as BarChartIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import StatsCard from '../../components/StatsCard/StatsCard';
import StatsCardSkeleton from '../../components/Skeleton/StatsCardSkeleton';
import { engineeringApi } from '../../services/api';
import { formatNumber, statusColors } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const chartDefaults = { margin: { top: 10, right: 10, left: 0, bottom: 0 } };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <Box sx={{
      bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(0,0,0,0.04)', borderRadius: 2, p: 1.5,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <Typography variant="caption" fontWeight={600} mb={0.5}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="caption" display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color, display: 'inline-block' }} />
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </Typography>
      ))}
    </Box>
  );
};

const ChartCard = ({ title, children, action }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={600} variant="body1">{title}</Typography>
        {action}
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

const KpiCard = ({ title, value, percent, color, subtitle }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>{title}</Typography>
          <Typography variant="h4" fontWeight={700} mt={0.5}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {percent !== undefined && (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={Number(percent)} size={60} thickness={5}
              sx={{ color: percent > 50 ? (percent > 80 ? '#10b981' : '#f59e0b') : '#ef4444' }}
            />
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="caption" fontWeight={700}>{Math.round(Number(percent))}%</Typography>
            </Box>
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [evm, setEvm] = useState(null);
  const [ipcTrends, setIpcTrends] = useState([]);
  const [selectedTrendProject, setSelectedTrendProject] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [exportAnchor, setExportAnchor] = useState(null);

  useEffect(() => {
    Promise.all([
      engineeringApi.dashboard.summary(),
      engineeringApi.dashboard.ipcTrends(),
      engineeringApi.reports.projectComparison({}),
    ]).then(([summary, trends, comp]) => {
      setData(summary.data);
      setIpcTrends(trends.data || []);
      setComparison(comp.data || []);
      if (trends.data?.length > 0) setSelectedTrendProject(trends.data[0]);
      setLoaded(true);
    }).catch(() => {
      setError(true);
      setLoaded(true);
    });
    engineeringApi.projects.list().then((r) => {
      const projects = r.data || [];
      if (projects.length > 0) {
        engineeringApi.evm.report(projects[0].id).then((r2) => setEvm(r2.data)).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  if (!loaded) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{t('dashboard')}</Typography>
          </Box>
        </Stack>
        <Grid container spacing={2.5} mb={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} item xs={12} md={4}>
              <StatsCardSkeleton />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2.5} mb={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} item xs={12} sm={6} md={3}>
              <StatsCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">{t('dashboardUnavailable')}</Typography>
      </Box>
    );
  }

  const {
    total_projects, total_contract_value,
    total_boq_items, total_boq_value,
    total_ipc_amount, total_ipc_paid, total_ipc_approved,
    total_ipc_count, total_contracts, total_drawings,
    total_daily_reports, total_schedules, total_subcontractors, total_documents,
    total_variation_orders, total_vo_amount, total_rfis,
    projects_by_status, ipc_by_status, recent_ipcs,
    overall_execution_rate, overall_financial_progress, total_remaining_value,
    projects_active, projects_completed, projects_planning, top_projects,
  } = data;

  const projectStatusData = (projects_by_status || []).map((s) => ({
    name: t(s.status),
    value: s.count,
  }));

  const ipcStatusData = (ipc_by_status || []).map((s) => ({
    name: t(s.status),
    value: Number(s.amount),
  }));

  const ipcTotalCount = (ipc_by_status || []).reduce((sum, i) => sum + i.count, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">{t('dashboard')}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            {t('dashboardSubtitle')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip icon={<TrendingUp />} label={t('realTime')} size="small" variant="outlined" color="primary" />
          <Button variant="outlined" size="small" startIcon={<Download />} onClick={(e) => setExportAnchor(e.currentTarget)}>
            {t('export')}
          </Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
            <MenuItem onClick={() => { setExportAnchor(null); engineeringApi.reports.dashboardExport().then((r) => { const url = window.URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = 'dashboard_export.csv'; a.click(); }).catch(() => {}); }}>
              <ListItemIcon><Download fontSize="small" /></ListItemIcon>
              <ListItemText>{t('exportCsv')}</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      {/* Top Row: 3 Big KPI Cards */}
      <motion.div variants={itemVariants}>
        <Grid container spacing={2.5} mb={3}>
          <Grid item xs={12} md={4}>
            <KpiCard
              title={t('executionRate')}
              value={`${formatNumber(overall_execution_rate)}%`}
              percent={Number(overall_execution_rate)}
              subtitle={t('executionRateSub')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard
              title={t('financialProgress')}
              value={`${formatNumber(overall_financial_progress)}%`}
              percent={Number(overall_financial_progress)}
              subtitle={t('financialProgressSub')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard
              title={t('remainingValue')}
              value={formatNumber(total_remaining_value)}
              subtitle={`${t('projectsActive')}: ${projects_active} | ${t('completed')}: ${projects_completed} | ${t('planning')}: ${projects_planning}`}
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Second Row: 4 Stats Cards */}
      <motion.div variants={itemVariants}>
        <Grid container spacing={2.5} mb={3}>
          {[
            { key: 'totalProjects', value: total_projects, icon: <Folder />, color: 'primary' },
            { key: 'totalContractValue', value: formatNumber(total_contract_value), icon: <MonetizationOn />, color: 'success' },
            { key: 'totalBoqItems', value: total_boq_items, icon: <ListAlt />, color: 'secondary' },
            { key: 'totalIpcAmount', value: formatNumber(total_ipc_amount), icon: <Receipt />, color: 'warning' },
          ].map((card) => (
            <Grid key={card.key} item xs={12} sm={6} md={3}>
              <StatsCard title={t(card.key)} value={card.value} icon={card.icon} color={card.color} />
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Second Row B: Service Counts */}
      <motion.div variants={itemVariants}>
        <Grid container spacing={2.5} mb={3}>
          {[
            { key: 'totalVariationOrders', value: total_variation_orders, icon: <CompareArrows />, color: 'error' },
            { key: 'totalVoAmount', value: formatNumber(total_vo_amount), icon: <MoneyOff />, color: 'warning' },
            { key: 'totalRfis', value: total_rfis, icon: <QuestionAnswer />, color: 'info' },
            { key: 'totalIpcPaid', value: formatNumber(total_ipc_paid), icon: <ThumbUpAlt />, color: 'success' },
          ].map((card) => (
            <Grid key={card.key} item xs={12} sm={6} md={3}>
              <StatsCard title={t(card.key)} value={card.value} icon={card.icon} color={card.color} />
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Third Row: Top 5 Projects Table */}
      <motion.div variants={itemVariants}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography fontWeight={600} variant="body1">{t('topProjects')}</Typography>
              <Chip label={`${top_projects?.length || 0} ${t('projects')}`} size="small" color="primary" />
            </Stack>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: { xs: 500, md: '100%' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('code')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('name')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('contractValue')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(top_projects || []).map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{formatNumber(p.contract_value)}</TableCell>
                      <TableCell>
                        <Chip label={t(p.status)} size="small" color={statusColors[p.status] || 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!top_projects || top_projects.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">{t('noData')}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fifth Row: EVM Widget */}
      {evm && (
        <motion.div variants={itemVariants}>
          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography fontWeight={600} variant="body1">Earned Value Management (EVM)</Typography>
                    <Chip label={`CPI: ${Number(evm.cpi).toFixed(2)} | SPI: ${Number(evm.spi).toFixed(2)}`} size="small" color={evm.cpi >= 1 ? 'success' : 'error'} />
                  </Stack>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Planned Value (PV)', value: evm.planned_value, color: '#6366f1' },
                      { label: 'Earned Value (EV)', value: evm.earned_value, color: '#10b981' },
                      { label: 'Actual Cost (AC)', value: evm.actual_cost, color: '#f59e0b' },
                      { label: 'EAC', value: evm.estimate_at_completion, color: '#ef4444' },
                      { label: 'ETC', value: evm.estimate_to_complete, color: '#8b5cf6' },
                      { label: 'VAC', value: evm.variance_at_completion, color: '#06b6d4' },
                    ].map((item) => (
                      <Grid key={item.label} item xs={6} sm={4} md={2}>
                        <Box sx={{ textAlign: 'center', p: 1, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ color: item.color }}>
                            {formatNumber(item.value)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Fourth Row: Pie Charts */}
      <Grid container spacing={2.5} component={motion.div} variants={itemVariants}>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('projectsByStatus')} action={<Chip label={`${projectStatusData.length}`} size="small" color="primary" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {projectStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <ReTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                {projectStatusData.map((item, i) => (
                  <Stack key={item.name} direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                    <Typography variant="caption" color="text.secondary">{item.name}: {item.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </ChartCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('ipcByStatus')} action={<Chip label={`${ipcTotalCount}`} size="small" color="info" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={ipcStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {ipcStatusData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                    </Pie>
                    <ReTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                {ipcStatusData.map((item, i) => (
                  <Stack key={item.name} direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[(i + 2) % COLORS.length] }} />
                    <Typography variant="caption" color="text.secondary">{item.name}: {formatNumber(item.value)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </ChartCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Fifth Row: Budget Comparison + IPC Trend */}
      <Grid container spacing={2.5} component={motion.div} variants={itemVariants} mt={0.5}>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('budgetVsActual')} action={<BarChartIcon color="action" />}>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={comparison.map((p) => ({
                    name: p.code || p.name,
                    'contract': Number(p.contract_value),
                    'billed': Number(p.total_billed),
                    'paid': Number(p.total_paid),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="contract" fill="#6366f1" name={t('contractValue')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="billed" fill="#10b981" name={t('totalBilled')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="paid" fill="#f59e0b" name={t('totalPaid')} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('ipcTrend')} action={
              <Stack direction="row" spacing={0.5}>
                {ipcTrends.map((p) => (
                  <Chip key={p.project_id} label={p.project_code || `#${p.project_id}`} size="small"
                    color={selectedTrendProject?.project_id === p.project_id ? 'primary' : 'default'}
                    onClick={() => setSelectedTrendProject(p)}
                    sx={{ cursor: 'pointer', fontWeight: selectedTrendProject?.project_id === p.project_id ? 700 : 400 }}
                  />
                ))}
              </Stack>
            }>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={(selectedTrendProject?.data || []).map((d) => ({
                    period: `${t('ipc')} ${d.period}`,
                    'net': Number(d.net_amount),
                    'works': Number(d.total_works),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="works" stroke="#6366f1" name={t('totalWorks')} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="net" stroke="#10b981" name={t('netAmount')} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}