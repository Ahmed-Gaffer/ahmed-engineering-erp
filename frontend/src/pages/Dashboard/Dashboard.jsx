import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardContent, Typography, Box, Stack, Chip } from '@mui/material';
import { People, Folder, Assignment, Receipt, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import StatsCard from '../../components/StatsCard/StatsCard';
import StatsCardSkeleton from '../../components/Skeleton/StatsCardSkeleton';
import { projectsService, contractorsService, workOrdersService, paymentCertificatesService, phasesService } from '../../services/api';

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

export default function Dashboard() {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({ projects: 0, contractors: 0, workOrders: 0, pendingCerts: 0 });
  const [projectsByStatus, setProjectsByStatus] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [phaseProgress, setPhaseProgress] = useState([]);
  const [woByPriority, setWoByPriority] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    Promise.all([
      projectsService.list({ limit: 1 }),
      contractorsService.list({ limit: 1 }),
      workOrdersService.list({ limit: 1 }),
      paymentCertificatesService.list({ limit: 1 }),
      projectsService.list({ limit: 100 }),
      workOrdersService.list({ limit: 100 }),
      phasesService.list({ limit: 100 }),
      paymentCertificatesService.list({ limit: 100 }),
    ]).then(([pr, co, wo, pc, prAll, woAll, phAll, pcAll]) => {
      const totalProjects = pr.data.total;
      const totalContracts = co.data.total;
      const activeWO = wo.data.total;
      const totalPC = pc.data.total;

      const activeWoCount = woAll.data.items.filter(w => w.status === 'under_execution' || w.status === 'issued').length;
      const pendingPcCount = pcAll.data.items.filter(p => p.status === 'under_review' || p.status === 'submitted').length;

      setStats({
        projects: totalProjects,
        contractors: totalContracts,
        workOrders: activeWoCount || activeWO,
        pendingCerts: pendingPcCount || totalPC,
      });

      const prItems = prAll.data.items;
      setAllProjects(prItems);
      const statusCounts = {};
      prItems.forEach((p) => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
      setProjectsByStatus(Object.entries(statusCounts).map(([k, v]) => ({ name: t(k), value: v })));

      setBudgetData(prItems.slice(0, 10).map((p) => ({
        name: p.code,
        estimated: Number(p.budget_estimated || 0),
        actual: Number(p.budget_actual || 0),
      })));

      const woItems = woAll.data.items;
      const priorityCounts = {};
      woItems.forEach((w) => { priorityCounts[w.priority] = (priorityCounts[w.priority] || 0) + 1; });
      setWoByPriority(Object.entries(priorityCounts).map(([k, v]) => ({ name: t(k) || k, value: v })));

      const phItems = phAll.data.items;
      setPhaseProgress(phItems.slice(0, 10).map((p) => ({
        name: p.name?.slice(0, 15),
        progress: Number(p.progress_percentage || 0),
      })));
      setLoaded(true);
    });
  }, []);

  const totalBudget = budgetData.reduce((s, b) => s + b.estimated, 0);
  const totalActual = budgetData.reduce((s, b) => s + b.actual, 0);
  const budgetUtil = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
  const completedProjects = allProjects.filter(p => p.status === 'completed').length;
  const avgProgress = phaseProgress.length > 0
    ? Math.round(phaseProgress.reduce((s, p) => s + p.progress, 0) / phaseProgress.length)
    : 0;

  if (!loaded) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{t('dashboard')}</Typography>
          </Box>
        </Stack>
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">{t('dashboard')}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            {t('dashboardSubtitle')}
          </Typography>
        </Box>
        <Chip icon={<TrendingUp />} label={t('realTime')} size="small" variant="outlined" color="primary" />
      </Stack>
      <motion.div variants={itemVariants}>
        <Grid container spacing={2.5} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title={t('totalProjects')} value={stats.projects} icon={<Folder />} color="primary" trend={15} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title={t('totalContractors')} value={stats.contractors} icon={<People />} color="success" trend={8} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title={t('activeWorkOrders')} value={stats.workOrders} icon={<Assignment />} color="secondary" trend={-3} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title={t('pendingCertificates')} value={stats.pendingCerts} icon={<Receipt />} color="warning" trend={12} />
          </Grid>
        </Grid>
      </motion.div>

      <Grid container spacing={2.5} component={motion.div} variants={itemVariants}>

        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('budgetOverview')} action={<Chip label={`${budgetUtil}%`} size="small" color={budgetUtil > 80 ? 'warning' : 'success'} />}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('budgetEstimated')}</Typography>
                  <Typography variant="h6" fontWeight={700}>{totalBudget.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('budgetActual')}</Typography>
                  <Typography variant="h6" fontWeight={700}>{totalActual.toLocaleString()}</Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={budgetData.slice(0, 5)} {...chartDefaults}>
                  <defs>
                    <linearGradient id="estimatedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="estimated" stroke="#6366f1" fill="url(#estimatedGrad)" strokeWidth={2} name={t('budgetEstimated')} />
                  <Area type="monotone" dataKey="actual" stroke="#10b981" fill="url(#actualGrad)" strokeWidth={2} name={t('budgetActual')} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('projectsByStatus')} action={<Chip label={`${completedProjects}/${allProjects.length}`} size="small" color="primary" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={projectsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {projectsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                {projectsByStatus.map((item, i) => (
                  <Stack key={item.name} direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                    <Typography variant="caption" color="text.secondary">{item.name}: {item.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </ChartCard>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('workOrdersByPriority')}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={woByPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {woByPriority.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                {woByPriority.map((item, i) => (
                  <Stack key={item.name} direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                    <Typography variant="caption" color="text.secondary">{item.name}: {item.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </ChartCard>
          </motion.div>
        </Grid>
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <ChartCard title={t('phaseProgress')} action={<Chip label={`${t('avgProgress')} ${avgProgress}%`} size="small" color={avgProgress > 50 ? 'success' : 'warning'} />}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={phaseProgress} layout="vertical" {...chartDefaults}>
                  <defs>
                    <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient>
                  </defs>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="progress" fill="url(#progressGrad)" name="%" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}
