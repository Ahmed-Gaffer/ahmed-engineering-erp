import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardContent, Typography, Box, Stack, Chip, IconButton, Badge, Drawer, Divider, Avatar, Button } from '@mui/material';
import {
  Close, Notifications as NotifBell, Warning as WarnIcon,
  TrendingUp, Refresh, NotificationsActive,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EChart from '../../components/EChart';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Icon from '../../components/SvgIcon/SvgIcon';
import { KpiCard, ChartCard, ActivityTimeline, PendingApprovalsBanner, TopProjectsTable, RecentIpcTable } from '../../components/DashboardWidgets';
import StatsCardSkeleton from '../../components/Skeleton/StatsCardSkeleton';
import { engineeringApi, activitiesApi, workflowApi, notificationsApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

interface Notification {
  id: number;
  is_read: boolean;
  title: string;
  message?: string;
  created_at?: string;
  type?: string;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: number) => Promise<void>;
}

const NotificationPanel = ({ open, onClose, notifications, onMarkRead }: NotificationPanelProps) => {
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
          <Box textAlign="center" py={6}>
            <Icon name="bell" size={48} />
            <Typography color="text.secondary" sx={{ mt: 1 }}>All clear!</Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {notifications.map((n) => (
              <Card key={n.id} sx={{ bgcolor: n.is_read ? 'transparent' : 'rgba(15,23,42,0.04)', border: '1px solid', borderColor: n.is_read ? 'var(--clr-border)' : 'rgba(217,119,6,0.15)', cursor: 'pointer' }}
                onClick={() => { if (!n.is_read) onMarkRead(n.id); }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: n.type === 'warning' ? '#f59e0b25' : n.type === 'error' ? '#ef444425' : '#D9770625', color: n.type === 'warning' ? 'var(--clr-amber-500)' : n.type === 'error' ? 'var(--clr-red-500)' : 'var(--clr-gold-500)' }}>
                      {n.type === 'warning' ? <WarnIcon fontSize="small" /> : n.type === 'error' ? <Icon name="close" size={16} /> : <NotifBell fontSize="small" />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={n.is_read ? 400 : 600} fontSize="0.8rem">{n.title}</Typography>
                      {n.message && <Typography variant="caption" color="text.secondary">{n.message}</Typography>}
                      <Typography variant="caption" color="text.disabled" fontSize="0.65rem">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                      </Typography>
                    </Box>
                    {!n.is_read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--clr-gold-500)', mt: 0.5 }} />}
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
  const queryClient = useQueryClient();
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedTrendProject, setSelectedTrendProject] = useState<Record<string, unknown> | null>(null);

  const { data: dashboardData, isLoading: dashLoading, isError: dashError, refetch: refetchDash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [summaryRes, trendsRes, compRes] = await Promise.all([
        engineeringApi.dashboard.summary(),
        engineeringApi.dashboard.ipcTrends(),
        engineeringApi.reports.projectComparison({}),
      ]);
      return { summary: summaryRes.data, ipcTrends: trendsRes.data || [], comparison: compRes.data || [] };
    },
    staleTime: 60000,
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      const res = await activitiesApi.list({ limit: 15 });
      return res.data?.items || res.data || [];
    },
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: async () => {
      const [listRes, countRes] = await Promise.all([
        notificationsApi.list({ limit: 20 }),
        notificationsApi.unreadCount(),
      ]);
      return { items: listRes.data?.items || [], unread: countRes.data?.count || 0 };
    },
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const { data: warningsData } = useQuery({
    queryKey: ['dashboard-warnings'],
    queryFn: async () => {
      const res = await workflowApi.getRecent(10);
      const logs = res.data || [];
      return logs.filter((l: { action: string }) => l.action === 'submit').slice(0, 5).map((l: { id: number; entity_type: string; entity_id: number; action: string; actor_name: string; created_at: string }) => ({
        id: l.id, entity_type: l.entity_type, entity_id: l.entity_id,
        action: l.action, actor_name: l.actor_name, created_at: l.created_at,
      }));
    },
    staleTime: 60000,
  });

  const handleRefresh = () => {
    refetchDash();
    refetchNotifs();
    queryClient.invalidateQueries({ queryKey: ['dashboard-activity'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-warnings'] });
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] });
    } catch {}
  };

  const data = dashboardData?.summary || null;
  const ipcTrends = dashboardData?.ipcTrends || [];
  const comparison = dashboardData?.comparison || [];
  const activity = activityData || [];
  const notifications = notifData?.items || [];
  const unreadCount = notifData?.unread || 0;
  const warnings = warningsData || [];

  useEffect(() => {
    if (ipcTrends.length > 0 && !selectedTrendProject) {
      setSelectedTrendProject(ipcTrends[0]);
    }
  }, [ipcTrends, selectedTrendProject]);

  const recentIpcs = (data?.recent_ipcs || []).slice(0, 6);
  const recentActivity = (data?.recent_activity || activity || []).slice(0, 8);

  if (dashLoading) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Box>
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">{t('dashboard')}</Typography>
            <Typography variant="body2" color="text.secondary">{t('dashboardSubtitle')}</Typography>
          </Box>
        </Stack>
        <Grid container spacing={3} mb={4}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} item xs={12} sm={6} md={3}><StatsCardSkeleton /></Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (dashError || !data) {
    return (
      <Box textAlign="center" py={8}>
        <Icon name="alert" size={64} />
        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>{t('dashboardUnavailable')}</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>{t('retry')}</Button>
      </Box>
    );
  }

  const {
    total_projects, total_contract_value, total_boq_items, total_boq_value,
    total_ipc_amount, total_ipc_paid, total_ipc_approved, total_ipc_count,
    total_contracts, total_drawings, total_daily_reports, total_schedules,
    total_subcontractors, total_documents, total_variation_orders, total_vo_amount,
    total_rfis, projects_by_status, ipc_by_status,
    overall_execution_rate, overall_financial_progress, total_remaining_value,
    projects_active, projects_completed, projects_planning, top_projects,
    pending_approvals, unread_notifications,
  } = data;

  const projectStatusData = (projects_by_status || []).map((s: { status: string; count: number }) => ({ name: t(s.status), value: s.count }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 34, height: 34, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(15,23,42,0.1)' }}>
                <Icon name="dashboard" size={20} />
              </Box>
              <span>{t('dashboard')}</span>
            </Stack>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25} ml={5.25}>
            {t('dashboardSubtitle')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip icon={<TrendingUp />} label={t('realTime')} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
          <Badge badgeContent={unreadCount || unread_notifications || 0} color="error">
            <IconButton size="small" onClick={() => setNotifOpen(true)} sx={{ bgcolor: 'rgba(239,68,68,0.08)', '&:hover': { bgcolor: 'rgba(239,68,68,0.12)' } }}>
              <NotificationsActive sx={{ fontSize: 20 }} />
            </IconButton>
          </Badge>
          <IconButton size="small" onClick={handleRefresh} sx={{ bgcolor: 'rgba(217,119,6,0.08)', '&:hover': { bgcolor: 'action.hover' } }}>
            <Refresh sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Stack>

      <PendingApprovalsBanner warnings={warnings} onNavigate={navigate} />

      <motion.div variants={itemVariants}>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title={t('executionRate')} value={`${formatNumber(overall_execution_rate)}%`} icon="chart" color="gold" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title={t('financialProgress')} value={`${formatNumber(overall_financial_progress)}%`} icon="trendingUp" color="green" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title={t('remainingValue')} value={formatNumber(total_remaining_value)} icon="ipc" color="amber" subtitle={`${projects_active} active | ${projects_completed} done`} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="Pending Approvals" value={pending_approvals || 0} icon="alert" color="red" subtitle={warnings.length > 0 ? `${warnings.length} waiting` : 'All clear'} />
          </Grid>
        </Grid>
      </motion.div>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title="Recent Activity" subtitle="Latest actions across the system" action={
              <Chip icon={<Icon name="bell" size={14} />} label={recentActivity.length} size="small" variant="outlined" />
            }>
              <Box sx={{ height: 340, overflow: 'auto' }}>
                <ActivityTimeline activities={recentActivity} loading={activityLoading} />
              </Box>
            </ChartCard>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('projectsByStatus')} action={<Chip label={`${total_projects} total`} size="small" color="primary" variant="outlined" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                {projectStatusData.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No projects</Typography>
                ) : (
                  <EChart
                    height={260}
                    option={{
                      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                      series: [{
                        type: 'pie', radius: ['45%', '72%'], center: ['50%', '50%'],
                        label: { show: false },
                        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' } },
                        data: projectStatusData.map((d: { name: string; value: number }) => ({ name: d.name, value: d.value })),
                      }],
                    }}
                  />
                )}
              </Box>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                {projectStatusData.map((item: { name: string; value: number }, i: number) => (
                  <Stack key={item.name} direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ['var(--clr-navy-800)', 'var(--clr-gold-500)', 'var(--clr-green-500)', 'var(--clr-amber-500)', 'var(--clr-red-500)', 'var(--clr-navy-600)', 'var(--clr-gold-400)', 'var(--clr-teal-500)'][i % 8] }} />
                    <Typography variant="caption" color="text.secondary">{item.name}: {item.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </ChartCard>
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <TopProjectsTable projects={top_projects || []} />
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <RecentIpcTable ipcs={recentIpcs} />
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={3} component={motion.div} variants={itemVariants}>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('budgetVsActual')} subtitle="Contract, billed, and paid per project">
              <Box sx={{ height: 280 }}>
                {comparison.length === 0 ? (
                  <Box textAlign="center" py={6}><Typography variant="body2" color="text.secondary">No comparison data</Typography></Box>
                ) : (
                  <EChart
                    height={280}
                    option={{
                      tooltip: { trigger: 'axis' },
                      legend: { data: [t('contractValue'), t('totalBilled'), t('totalPaid')] },
                      xAxis: { type: 'category', data: comparison.map((p: { code?: string; name?: string; project_id?: number }) => p.code || p.name || `#${p.project_id}`) },
                      yAxis: { type: 'value' },
                      series: [
                        { name: t('contractValue'), type: 'bar', data: comparison.map((p: { contract_value: number }) => Number(p.contract_value)) },
                        { name: t('totalBilled'), type: 'bar', data: comparison.map((p: { total_billed: number }) => Number(p.total_billed)) },
                        { name: t('totalPaid'), type: 'bar', data: comparison.map((p: { total_paid: number }) => Number(p.total_paid)) },
                      ],
                    }}
                  />
                )}
              </Box>
            </ChartCard>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('ipcTrend')} subtitle="Net amount and works over time" action={
              <Stack direction="row" spacing={0.5}>
                {ipcTrends.slice(0, 3).map((p: { project_id: number; project_code?: string }) => (
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
                  <EChart
                    height={280}
                    option={{
                      tooltip: { trigger: 'axis' },
                      legend: { data: [t('totalWorks'), t('netAmount')] },
                      xAxis: { type: 'category', data: (selectedTrendProject?.data as Array<{ period: string }> || []).map((d: { period: string }) => `${t('ipc')} ${d.period}`) },
                      yAxis: { type: 'value' },
                      series: [
                        { name: t('totalWorks'), type: 'line', data: (selectedTrendProject?.data as Array<{ total_works: number }> || []).map((d: { total_works: number }) => Number(d.total_works)), smooth: true, symbol: 'circle', symbolSize: 8 },
                        { name: t('netAmount'), type: 'line', data: (selectedTrendProject?.data as Array<{ net_amount: number }> || []).map((d: { net_amount: number }) => Number(d.net_amount)), smooth: true, symbol: 'circle', symbolSize: 8 },
                      ],
                    }}
                  />
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
