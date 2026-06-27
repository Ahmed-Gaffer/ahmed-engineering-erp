import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid, Card, CardContent, Typography, Box, Stack, Chip, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText, Avatar, Drawer, Divider, Badge, Tooltip, Fade,
} from '@mui/material';
import {
  Folder, MonetizationOn, ListAlt, Receipt, TrendingUp, CheckCircle, ThumbUpAlt,
  CompareArrows, QuestionAnswer, Download, Speed, Notifications, History, Build,
  Assignment, Warning, EventNote, Assessment, Dashboard as DashboardIcon,
  NotificationsActive, Schedule, AccountBalance, TrendingDown, Star, ArrowForward,
  Refresh, Add, Visibility, Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/StatsCard/StatsCard';
import StatsCardSkeleton from '../../components/Skeleton/StatsCardSkeleton';
import { engineeringApi, activitiesApi, workflowApi, notificationsApi } from '../../services/api';
import { formatNumber, statusColors } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

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

const ChartCard = ({ title, children, action, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: { xs: 2, md: 2.5 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography fontWeight={700} variant="body1" fontSize="0.95rem">{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {action}
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

const KpiCard = ({ title, value, percent, color, subtitle, icon, trend }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} fontSize="0.75rem">{title}</Typography>
          <Typography variant="h4" fontWeight={800} mt={0.25} fontSize={{ xs: '1.5rem', md: '1.75rem' }}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>{subtitle}</Typography>}
          {trend !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
              {trend >= 0 ? <TrendingUp sx={{ fontSize: 14, color: '#10b981' }} /> : <TrendingDown sx={{ fontSize: 14, color: '#ef4444' }} />}
              <Typography variant="caption" fontWeight={600} color={trend >= 0 ? '#10b981' : '#ef4444'}>
                {Math.abs(trend)}% {trend >= 0 ? 'up' : 'down'}
              </Typography>
            </Stack>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          {icon && (
            <Avatar sx={{ bgcolor: `${color || '#6366f1'}15`, color: color || '#6366f1', width: 40, height: 40 }}>
              {icon}
            </Avatar>
          )}
          {percent !== undefined && (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress variant="determinate" value={Number(percent)} size={52} thickness={5}
                sx={{ color: percent > 50 ? (percent > 80 ? '#10b981' : '#f59e0b') : '#ef4444' }}
              />
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" fontWeight={700} fontSize="0.7rem">{Math.round(Number(percent))}%</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const NotificationPanel = ({ open, onClose, notifications, onMarkRead }) => {
  const { t } = useTranslation();
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 380, maxWidth: '100vw' } }}>
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>Notifications</Typography>
          <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {notifications.length === 0 ? (
          <Box textAlign="center" py={6}><Notifications sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} /><Typography color="text.secondary">All clear!</Typography></Box>
        ) : (
          <Stack spacing={1}>
            {notifications.map((n) => (
              <Card key={n.id} sx={{ bgcolor: n.is_read ? 'transparent' : 'rgba(99,102,241,0.04)', border: '1px solid', borderColor: n.is_read ? 'divider' : 'rgba(99,102,241,0.15)', cursor: 'pointer' }}
                onClick={() => { if (!n.is_read) onMarkRead(n.id); }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: n.type === 'warning' ? '#f59e0b25' : n.type === 'error' ? '#ef444425' : '#6366f125', color: n.type === 'warning' ? '#f59e0b' : n.type === 'error' ? '#ef4444' : '#6366f1' }}>
                      {n.type === 'warning' ? <Warning fontSize="small" /> : n.type === 'error' ? <Assignment fontSize="small" /> : <Notifications fontSize="small" />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={n.is_read ? 400 : 600} fontSize="0.8rem">{n.title}</Typography>
                      {n.message && <Typography variant="caption" color="text.secondary">{n.message}</Typography>}
                      <Typography variant="caption" color="text.disabled" fontSize="0.65rem">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                      </Typography>
                    </Box>
                    {!n.is_read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366f1', mt: 0.5 }} />}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [evm, setEvm] = useState(null);
  const [ipcTrends, setIpcTrends] = useState([]);
  const [selectedTrendProject, setSelectedTrendProject] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const pullInterval = useRef(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const [summaryRes, trendsRes, compRes] = await Promise.all([
        engineeringApi.dashboard.summary(),
        engineeringApi.dashboard.ipcTrends(),
        engineeringApi.reports.projectComparison({}),
      ]);
      setData(summaryRes.data);
      setIpcTrends(trendsRes.data || []);
      setComparison(compRes.data || []);
      if (trendsRes.data?.length > 0 && !selectedTrendProject) {
        setSelectedTrendProject(trendsRes.data[0]);
      }
      setError(false);
    } catch { setError(true); } finally { setLoaded(true); }
  }, [selectedTrendProject]);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await activitiesApi.list({ limit: 15 });
      setActivity(res.data?.items || res.data || []);
    } catch {} finally { setActivityLoading(false); }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsApi.list({ limit: 20 }),
        notificationsApi.unreadCount(),
      ]);
      setNotifications(listRes.data?.items || []);
      setUnreadCount(countRes.data?.count || 0);
    } catch {}
  }, []);

  const fetchEVM = useCallback(async () => {
    try {
      const projRes = await engineeringApi.projects.list();
      const projects = projRes.data || [];
      if (projects.length > 0) {
        const evmRes = await engineeringApi.evm.report(projects[0].id);
        setEvm(evmRes.data);
      }
    } catch {}
  }, []);

  const fetchWarnings = useCallback(async () => {
    try {
      const res = await workflowApi.getRecent(10);
      const logs = res.data || [];
      const pending = logs.filter(l => l.action === 'submit').slice(0, 5);
      setWarnings(pending.map(l => ({
        id: l.id,
        entity_type: l.entity_type,
        entity_id: l.entity_id,
        action: l.action,
        actor_name: l.actor_name,
        created_at: l.created_at,
      })));
    } catch {}
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchActivity();
    fetchNotifications();
    fetchEVM();
    fetchWarnings();
    pullInterval.current = setInterval(() => {
      fetchNotifications();
      fetchActivity();
    }, 30000);
    return () => clearInterval(pullInterval.current);
  }, []);

  const handleRefresh = () => {
    setLoaded(false);
    Promise.all([fetchDashboard(), fetchActivity(), fetchNotifications(), fetchEVM(), fetchWarnings()]);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const recentIpcs = (data?.recent_ipcs || []).slice(0, 6);
  const recentActivity = (data?.recent_activity || activity || []).slice(0, 8);

  if (!loaded) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">{t('dashboard')}</Typography>
            <Typography variant="body2" color="text.secondary">{t('dashboardSubtitle')}</Typography>
          </Box>
        </Stack>
        <Grid container spacing={2.5} mb={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} item xs={12} sm={6} md={3}><StatsCardSkeleton /></Grid>
          ))}
        </Grid>
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} item xs={12} sm={6} md={3}><StatsCardSkeleton /></Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box textAlign="center" py={8}>
        <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>{t('dashboardUnavailable')}</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>{t('retry')}</Button>
      </Box>
    );
  }

  const {
    total_projects, total_contract_value, total_boq_items, total_boq_value,
    total_ipc_amount, total_ipc_paid, total_ipc_approved, total_ipc_count,
    total_contracts, total_drawings, total_daily_reports, total_schedules,
    total_subcontractors, total_documents, total_variation_orders, total_vo_amount,
    total_rfis, projects_by_status, ipc_by_status, recent_ipcs: rawRecentIpcs,
    overall_execution_rate, overall_financial_progress, total_remaining_value,
    projects_active, projects_completed, projects_planning, top_projects,
    pending_approvals, unread_notifications,
  } = data;

  const projectStatusData = (projects_by_status || []).map((s) => ({ name: t(s.status), value: s.count }));
  const ipcStatusData = (ipc_by_status || []).map((s) => ({ name: t(s.status), value: Number(s.amount) }));
  const ipcTotalCount = (ipc_by_status || []).reduce((sum, i) => sum + i.count, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
            <Stack direction="row" alignItems="center" spacing={1}>
              <DashboardIcon sx={{ color: '#6366f1' }} />
              <span>{t('dashboard')}</span>
            </Stack>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            {t('dashboardSubtitle')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip icon={<TrendingUp />} label={t('realTime')} size="small" variant="outlined" color="primary" />
          <Badge badgeContent={pending_approvals || 0} color="warning">
            <IconButton size="small" onClick={() => setNotifOpen(true)} sx={{ bgcolor: 'rgba(99,102,241,0.08)' }}>
              <Notifications />
            </IconButton>
          </Badge>
          <Badge badgeContent={unreadCount || unread_notifications || 0} color="error">
            <IconButton size="small" onClick={() => setNotifOpen(true)} sx={{ bgcolor: 'rgba(239,68,68,0.08)' }}>
              <NotificationsActive />
            </IconButton>
          </Badge>
          <IconButton size="small" onClick={handleRefresh} sx={{ bgcolor: 'rgba(99,102,241,0.08)' }}>
            <Refresh />
          </IconButton>
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

      {/* Pending Approvals Alert */}
      {warnings.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card sx={{ mb: 2.5, border: '1px solid', borderColor: 'rgba(245,158,11,0.3)', bgcolor: 'rgba(245,158,11,0.04)' }}>
            <CardContent sx={{ py: 1.5, px: 2.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" gap={1}>
                <Warning sx={{ color: '#f59e0b' }} />
                <Typography variant="body2" fontWeight={600}>{warnings.length} pending approval{warnings.length > 1 ? 's' : ''}</Typography>
                {warnings.slice(0, 3).map((w) => (
                  <Chip key={w.id} label={`${w.entity_type} #${w.entity_id}`} size="small" variant="outlined" color="warning" onClick={() => {
                    const routes = { ipc: '/engineering/ipc', variation_orders: '/engineering/variation-orders', ncr: '/engineering/ncr', mar: '/engineering/mar' };
                    const route = routes[w.entity_type];
                    if (route) navigate(route);
                  }} />
                ))}
                <Button size="small" variant="text" sx={{ ml: 'auto' }} onClick={() => navigate('/engineering/notifications')}>View All</Button>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Row: 4 KPI Cards */}
      <motion.div variants={itemVariants}>
        <Grid container spacing={2} mb={2.5}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title={t('executionRate')} value={`${formatNumber(overall_execution_rate)}%`} percent={Number(overall_execution_rate)} icon={<Speed />} color="#6366f1" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title={t('financialProgress')} value={`${formatNumber(overall_financial_progress)}%`} percent={Number(overall_financial_progress)} icon={<AccountBalance />} color="#10b981" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title={t('remainingValue')} value={formatNumber(total_remaining_value)} icon={<MonetizationOn />} color="#f59e0b" subtitle={`${projects_active} active | ${projects_completed} done`} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="Pending Approvals" value={pending_approvals || 0} icon={<Assignment />} color="#ef4444" percent={undefined} subtitle={warnings.length > 0 ? `${warnings.length} waiting` : 'All clear'} />
          </Grid>
        </Grid>
      </motion.div>

      <Grid container spacing={2.5} mb={2.5}>
        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <ChartCard title="Recent Activity" subtitle="Latest actions across the system" action={
              <Chip icon={<History />} label={recentActivity.length} size="small" variant="outlined" />
            }>
              <Box sx={{ height: 340, overflow: 'auto' }}>
                {activityLoading ? (
                  <Stack spacing={1.5}>
                    {[1, 2, 3, 4, 5].map(i => <StatsCardSkeleton key={i} />)}
                  </Stack>
                ) : recentActivity.length === 0 ? (
                  <Box textAlign="center" py={4}><History sx={{ fontSize: 36, color: 'text.disabled' }} /><Typography variant="caption" color="text.secondary">No recent activity</Typography></Box>
                ) : (
                  <AnimatePresence>
                    {recentActivity.map((a, i) => (
                      <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                        <Stack direction="row" spacing={1.5} sx={{ py: 1, px: 0.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: a.action === 'create' ? '#10b98115' : a.action === 'update' ? '#6366f115' : a.action === 'delete' ? '#ef444415' : '#f59e0b15', color: a.action === 'create' ? '#10b981' : a.action === 'update' ? '#6366f1' : a.action === 'delete' ? '#ef4444' : '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>
                            {a.action?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={500} noWrap fontSize="0.8rem">
                              <Box component="span" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>{a.action}</Box>
                              {a.entity_type ? ` ${a.entity_type}` : ''}
                            </Typography>
                            {a.description && <Typography variant="caption" color="text.secondary" noWrap fontSize="0.7rem">{a.description}</Typography>}
                            <Typography variant="caption" color="text.disabled" fontSize="0.65rem">
                              {a.created_at ? new Date(a.created_at).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </Box>
            </ChartCard>
          </motion.div>
        </Grid>

        {/* Projects by Status */}
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('projectsByStatus')} action={<Chip label={`${total_projects} total`} size="small" color="primary" variant="outlined" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                {projectStatusData.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No projects</Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                        {projectStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <ReTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
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

        {/* IPC Status */}
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('ipcByStatus')} action={<Chip label={`${ipcTotalCount} IPCs`} size="small" color="info" variant="outlined" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                {ipcStatusData.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No IPCs</Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={ipcStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                        {ipcStatusData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                      </Pie>
                      <ReTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
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

      {/* Stats Cards Row */}
      <motion.div variants={itemVariants}>
        <Grid container spacing={2} mb={2.5}>
          {[
            { key: 'totalProjects', value: total_projects, icon: <Folder />, color: '#6366f1' },
            { key: 'totalContractValue', value: formatNumber(total_contract_value), icon: <AccountBalance />, color: '#10b981' },
            { key: 'totalIpcApproved', value: formatNumber(total_ipc_approved), icon: <ThumbUpAlt />, color: '#06b6d4' },
            { key: 'totalVoAmount', value: formatNumber(total_vo_amount), icon: <CompareArrows />, color: '#f59e0b' },
            { key: 'totalRfis', value: total_rfis, icon: <QuestionAnswer />, color: '#8b5cf6' },
            { key: 'totalDrawings', value: total_drawings, icon: <Assessment />, color: '#ec4899' },
            { key: 'totalSchedules', value: total_schedules, icon: <Schedule />, color: '#14b8a6' },
            { key: 'totalDocuments', value: total_documents, icon: <Description />, color: '#6366f1' },
          ].map((card) => (
            <Grid key={card.key} item xs={6} sm={4} md={3} lg={1.5}>
              <motion.div variants={itemVariants}>
                <StatsCard title={t(card.key)} value={card.value} icon={card.icon} color={card.color} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Grid container spacing={2.5}>
        {/* Top Projects */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography fontWeight={700} variant="body1">{t('topProjects')}</Typography>
                    <Typography variant="caption" color="text.secondary">By contract value</Typography>
                  </Box>
                  <Button size="small" variant="text" endIcon={<ArrowForward />} onClick={() => navigate('/engineering/projects')}>View All</Button>
                </Stack>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflowX: 'auto', maxHeight: 280 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{t('code')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{t('name')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">{t('contractValue')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{t('status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(top_projects || []).map((p) => (
                        <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/engineering/projects/${p.id}`)}>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{p.code}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{p.name}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatNumber(p.contract_value)}</TableCell>
                          <TableCell><Chip label={t(p.status)} size="small" color={statusColors[p.status] || 'default'} sx={{ fontWeight: 600, fontSize: '0.7rem' }} /></TableCell>
                        </TableRow>
                      ))}
                      {(!top_projects || top_projects.length === 0) && (
                        <TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" color="text.secondary">{t('noData')}</Typography></TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent IPCs */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography fontWeight={700} variant="body1">Recent IPCs</Typography>
                    <Typography variant="caption" color="text.secondary">Last 6 payment certificates</Typography>
                  </Box>
                  <Button size="small" variant="text" endIcon={<ArrowForward />} onClick={() => navigate('/engineering/ipc')}>View All</Button>
                </Stack>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflowX: 'auto', maxHeight: 280 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Works</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Net</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{t('status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentIpcs.map((ipc) => (
                        <TableRow key={ipc.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/engineering/ipc')}>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{ipc.ipc_number}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatNumber(ipc.total_works)}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{formatNumber(ipc.net_amount)}</TableCell>
                          <TableCell>
                            <Chip label={ipc.status} size="small" color={statusColors[ipc.status] || 'default'} sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                          </TableCell>
                        </TableRow>
                      ))}
                      {recentIpcs.length === 0 && (
                        <TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" color="text.secondary">{t('noData')}</Typography></TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* EVM Widget */}
      {evm && (
        <motion.div variants={itemVariants}>
          <Card sx={{ mt: 2.5 }}>
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Assessment sx={{ color: '#6366f1' }} />
                  <Typography fontWeight={700} variant="body1">Earned Value Management (EVM)</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Chip label={`CPI: ${Number(evm.cpi).toFixed(2)}`} size="small" color={evm.cpi >= 1 ? 'success' : 'error'} />
                  <Chip label={`SPI: ${Number(evm.spi).toFixed(2)}`} size="small" color={evm.spi >= 1 ? 'success' : 'error'} />
                  <Chip label={`VAC: ${formatNumber(evm.variance_at_completion)}`} size="small" color={evm.variance_at_completion >= 0 ? 'success' : 'error'} />
                </Stack>
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
                    <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{item.label}</Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ color: item.color, fontSize: '1rem' }}>
                        {formatNumber(item.value)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts Row */}
      <Grid container spacing={2.5} component={motion.div} variants={itemVariants} mt={0.5}>
        {/* Budget vs Actual */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('budgetVsActual')} subtitle="Contract, billed, and paid per project">
              <Box sx={{ height: 280 }}>
                {comparison.length === 0 ? (
                  <Box textAlign="center" py={6}><Typography variant="body2" color="text.secondary">No comparison data</Typography></Box>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={comparison.map((p) => ({
                      name: p.code || p.name || `#${p.project_id}`,
                      'Contract': Number(p.contract_value),
                      'Billed': Number(p.total_billed),
                      'Paid': Number(p.total_paid),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ReTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Contract" fill="#6366f1" name={t('contractValue')} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Billed" fill="#10b981" name={t('totalBilled')} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Paid" fill="#f59e0b" name={t('totalPaid')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </ChartCard>
          </motion.div>
        </Grid>

        {/* IPC Trend */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('ipcTrend')} subtitle="Net amount and works over time" action={
              <Stack direction="row" spacing={0.5}>
                {ipcTrends.slice(0, 3).map((p) => (
                  <Chip key={p.project_id} label={p.project_code || `#${p.project_id}`} size="small"
                    color={selectedTrendProject?.project_id === p.project_id ? 'primary' : 'default'}
                    onClick={() => setSelectedTrendProject(p)}
                    sx={{ cursor: 'pointer', fontWeight: selectedTrendProject?.project_id === p.project_id ? 700 : 400, fontSize: '0.65rem' }}
                  />
                ))}
              </Stack>
            }>
              <Box sx={{ height: 280 }}>
                {(selectedTrendProject?.data || []).length === 0 ? (
                  <Box textAlign="center" py={6}><Typography variant="body2" color="text.secondary">No IPC data</Typography></Box>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={(selectedTrendProject?.data || []).map((d) => ({
                      period: `${t('ipc')} ${d.period}`,
                      'Net': Number(d.net_amount),
                      'Works': Number(d.total_works),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ReTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="Works" stroke="#6366f1" name={t('totalWorks')} strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Net" stroke="#10b981" name={t('netAmount')} strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </ChartCard>
          </motion.div>
        </Grid>
      </Grid>

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
      />
    </motion.div>
  );
}
