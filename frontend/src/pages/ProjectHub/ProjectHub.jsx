import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, CardContent, Chip, CircularProgress,
  Grid, Button, Avatar, Divider, alpha,
} from '@mui/material';
import {
  FolderOpen, Business, Image, WarningAmber, QuestionAnswer, CheckCircle,
  CalendarMonth, Description, Schedule, Receipt, CompareArrows, Engineering,
  Add, ArrowForward, TrendingUp,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatsCard from '../../components/StatsCard/StatsCard';
import { engineeringApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';

const entityCards = [
  { key: 'contracts', icon: <Business />, color: '#6366f1', labelKey: 'contractsPage', link: (pid) => `/engineering/contracts-list?project_id=${pid}` },
  { key: 'drawings', icon: <Image />, color: '#06b6d4', labelKey: 'drawings', link: (pid) => `/engineering/drawings?project_id=${pid}` },
  { key: 'ncrs', icon: <WarningAmber />, color: '#ef4444', labelKey: 'ncr', link: (pid) => `/engineering/ncr?project_id=${pid}` },
  { key: 'rfis', icon: <QuestionAnswer />, color: '#8b5cf6', labelKey: 'rfis', link: (pid) => `/engineering/rfis?project_id=${pid}` },
  { key: 'mar', icon: <CheckCircle />, color: '#f97316', labelKey: 'mar', link: (pid) => `/engineering/mar?project_id=${pid}` },
  { key: 'meeting_minutes', icon: <Description />, color: '#10b981', labelKey: 'meetingMinutes', link: (pid) => `/engineering/projects/${pid}/meeting-minutes` },
  { key: 'daily_reports', icon: <CalendarMonth />, color: '#f59e0b', labelKey: 'dailyReportsPage', link: (pid) => `/engineering/daily-reports?project_id=${pid}` },
  { key: 'schedules', icon: <Schedule />, color: '#84cc16', labelKey: 'schedulesPage', link: (pid) => `/engineering/schedules?project_id=${pid}` },
  { key: 'boq_items', icon: <Receipt />, color: '#14b8a6', labelKey: 'boq', link: (pid) => `/engineering/boq?project_id=${pid}` },
  { key: 'variation_orders', icon: <CompareArrows />, color: '#f43f5e', labelKey: 'variationOrders', link: (pid) => `/engineering/variation-orders?project_id=${pid}` },
  { key: 'ipcs', icon: <Engineering />, color: '#3b82f6', labelKey: 'ipc', link: (pid) => `/engineering/ipc?project_id=${pid}` },
];

const quickActions = [
  { labelKey: 'addNcr', icon: <WarningAmber />, color: '#ef4444', link: (pid) => `/engineering/ncr?project_id=${pid}` },
  { labelKey: 'addRfi', icon: <QuestionAnswer />, color: '#8b5cf6', link: (pid) => `/engineering/rfis?project_id=${pid}` },
  { labelKey: 'addMar', icon: <CheckCircle />, color: '#f97316', link: (pid) => `/engineering/mar?project_id=${pid}` },
  { labelKey: 'addDrawing', icon: <Image />, color: '#06b6d4', link: (pid) => `/engineering/drawings?project_id=${pid}` },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function EVMStat({ label, value, color }) {
  return (
    <Grid item xs={4} sm={2}>
      <Box sx={{ textAlign: 'center', py: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
        <Typography variant="body1" fontWeight={700} sx={{ color }}>{value}</Typography>
      </Box>
    </Grid>
  );
}

export default function ProjectHub() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [evm, setEvm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      engineeringApi.projects.summary(projectId),
      engineeringApi.evm.report(projectId).catch(() => null),
    ])
      .then(([summaryRes, evmRes]) => { setData(summaryRes.data); setEvm(evmRes?.data || null); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [projectId]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <CircularProgress size={44} sx={{ color: '#6366f1' }} />
        <Typography variant="body2" color="text.secondary" mt={2}>{t('loading')}</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box textAlign="center" py={10}>
        <Typography variant="h6" color="text.secondary">{t('noData')}</Typography>
      </Box>
    );
  }

  const { project, counts, recent_ncrs, recent_rfis } = data;
  const statusColor = { planned: 'info', in_progress: 'primary', completed: 'success', on_hold: 'warning', cancelled: 'error' }[project.status] || 'default';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack spacing={3}>
        {/* Project Info Header */}
        <motion.div variants={itemVariants}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'visible' }}>
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.3rem', fontWeight: 700 }}>
                  {project.code?.charAt(0) || 'P'}
                </Avatar>
                <Box flex={1}>
                  <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                    <Typography variant="h5" fontWeight={700}>{project.name}</Typography>
                    <Chip label={t(project.status)} size="small" color={statusColor} sx={{ fontWeight: 600 }} />
                    <Chip label={project.project_type} size="small" variant="outlined" sx={{ opacity: 0.7 }} />
                  </Stack>
                  <Stack direction="row" spacing={2} mt={0.5} flexWrap="wrap">
                    <Typography variant="body2" color="text.secondary">
                      <Typography component="span" fontWeight={600}>{t('code')}:</Typography> {project.code}
                    </Typography>
                    {project.location && (
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" fontWeight={600}>{t('location')}:</Typography> {project.location}
                      </Typography>
                    )}
                    {project.client_name && (
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" fontWeight={600}>{t('clientName')}:</Typography> {project.client_name}
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={2} mt={0.3} flexWrap="wrap">
                    {project.consultant_name && (
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" fontWeight={600}>{t('consultantName')}:</Typography> {project.consultant_name}
                      </Typography>
                    )}
                    {project.project_manager && (
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" fontWeight={600}>{t('projectManager')}:</Typography> {project.project_manager}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <Button variant="contained" startIcon={<Add />} size="small"
                  sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, whiteSpace: 'nowrap' }}
                  onClick={() => navigate(`/engineering/projects`)}
                >
                  {t('edit')}
                </Button>
              </Stack>
            </Box>
            {project.budget_estimated > 0 && (
              <Box sx={{ px: { xs: 2.5, md: 3 }, pb: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {t('budgetEstimated')}: ${Number(project.budget_estimated).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {quickActions.map(({ labelKey, icon, color, link }) => (
              <Button key={labelKey} variant="outlined" size="small" startIcon={icon}
                onClick={() => navigate(link(projectId))}
                sx={{ borderColor: alpha(color, 0.3), color, '&:hover': { borderColor: color, bgcolor: alpha(color, 0.05) }, fontWeight: 500 }}
              >
                {t(labelKey)}
              </Button>
            ))}
          </Stack>
        </motion.div>

        {/* Entity Count Stats */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={2}>
            {entityCards.map(({ key, icon, color, labelKey, link }) => (
              <Grid key={key} item xs={6} sm={4} md={3} lg={2}>
                <StatsCard
                  title={t(labelKey)}
                  value={counts[key] ?? 0}
                  icon={icon}
                  color={color}
                  onClick={() => navigate(link(projectId))}
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* EVM Summary */}
        {evm && (
          <motion.div variants={itemVariants}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <TrendingUp sx={{ color: '#6366f1', fontSize: '1.1rem' }} />
                <Typography variant="subtitle2" fontWeight={600} flex={1}>{t('evmTitle')}</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/engineering/evm')} sx={{ fontSize: '0.75rem' }}>
                  {t('viewAll')}
                </Button>
              </Stack>
              <Box sx={{ p: 2.5 }}>
                <Grid container spacing={2}>
                  <EVMStat label="SPI" value={Number(evm.spi).toFixed(2)} color={evm.spi >= 1 ? '#10b981' : '#ef4444'} />
                  <EVMStat label="CPI" value={Number(evm.cpi).toFixed(2)} color={evm.cpi >= 1 ? '#10b981' : '#ef4444'} />
                  <EVMStat label={t('plannedValue')} value={formatNumber(evm.planned_value)} color="#6366f1" />
                  <EVMStat label={t('earnedValue')} value={formatNumber(evm.earned_value)} color="#10b981" />
                  <EVMStat label={t('actualCost')} value={formatNumber(evm.actual_cost)} color="#f59e0b" />
                  <EVMStat label={t('totalBudget')} value={formatNumber(evm.total_budget)} color="#06b6d4" />
                </Grid>
              </Box>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity */}
        <Grid container spacing={2.5}>
          {/* Recent NCRs */}
          {recent_ncrs?.length > 0 && (
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <WarningAmber sx={{ color: '#ef4444', fontSize: '1.1rem' }} />
                      <Typography variant="subtitle2" fontWeight={600}>{t('recentNcrs')}</Typography>
                    </Stack>
                    <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/engineering/ncr?project_id=${projectId}`)} sx={{ fontSize: '0.75rem' }}>
                      {t('viewAll')}
                    </Button>
                  </Stack>
                  {recent_ncrs.map((n, i) => (
                    <Box key={n.id}>
                      {i > 0 && <Divider sx={{ mx: 2 }} />}
                      <Box sx={{ px: 2.5, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate(`/engineering/ncr?project_id=${projectId}`)}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: { minor: alpha('#10b981', 0.15), major: alpha('#f59e0b', 0.15), critical: alpha('#ef4444', 0.15) }[n.severity] || alpha('#6b7280', 0.15), color: { minor: '#10b981', major: '#f59e0b', critical: '#ef4444' }[n.severity] || '#6b7280', fontSize: '0.65rem', fontWeight: 700 }}>
                            {n.ncr_number?.slice(-2) || 'N'}
                          </Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography variant="body2" fontWeight={500} noWrap>{n.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{n.ncr_number}</Typography>
                          </Box>
                          <Chip label={n.status} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }} />
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Card>
              </motion.div>
            </Grid>
          )}

          {/* Recent RFIs */}
          {recent_rfis?.length > 0 && (
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <QuestionAnswer sx={{ color: '#8b5cf6', fontSize: '1.1rem' }} />
                      <Typography variant="subtitle2" fontWeight={600}>{t('recentRfis')}</Typography>
                    </Stack>
                    <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/engineering/rfis?project_id=${projectId}`)} sx={{ fontSize: '0.75rem' }}>
                      {t('viewAll')}
                    </Button>
                  </Stack>
                  {recent_rfis.map((r, i) => (
                    <Box key={r.id}>
                      {i > 0 && <Divider sx={{ mx: 2 }} />}
                      <Box sx={{ px: 2.5, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => navigate(`/engineering/rfis?project_id=${projectId}`)}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#8b5cf6', 0.15), color: '#8b5cf6', fontSize: '0.65rem', fontWeight: 700 }}>
                            {r.rfi_number?.slice(-2) || 'R'}
                          </Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography variant="body2" fontWeight={500} noWrap>{r.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{r.rfi_number}</Typography>
                          </Box>
                          <Chip label={r.status} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600 }} color={r.status === 'open' ? 'warning' : r.status === 'answered' ? 'success' : 'default'} />
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Card>
              </motion.div>
            </Grid>
          )}
        </Grid>
      </Stack>
    </motion.div>
  );
}
