import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, CardContent, Chip, CircularProgress,
  Grid, Button, Avatar, Divider, alpha,
} from '@mui/material';
import {
  FolderOpen, Business, Image, WarningAmber, QuestionAnswer, CheckCircle,
  CalendarMonth, Description, Schedule, Receipt, CompareArrows, Engineering,
  Add, ArrowForward, TrendingUp, Bolt,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatsCard from '../../components/StatsCard/StatsCard';
import { engineeringApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';

const ncrStatusColor = { open: 'error', in_progress: 'warning', closed: 'success', resolved: 'success' };
const rfiStatusColor = { open: 'warning', answered: 'success', closed: 'default' };

const entityCards = [
  { key: 'contracts', icon: <Business />, color: '#D97706', labelKey: 'contractsPage', link: (pid) => `/engineering/contracts-list?project_id=${pid}` },
  { key: 'drawings', icon: <Image />, color: '#D97706', labelKey: 'drawings', link: (pid) => `/engineering/drawings?project_id=${pid}` },
  { key: 'ncrs', icon: <WarningAmber />, color: '#ef4444', labelKey: 'ncr', link: (pid) => `/engineering/ncr?project_id=${pid}` },
  { key: 'rfis', icon: <QuestionAnswer />, color: '#D97706', labelKey: 'rfis', link: (pid) => `/engineering/rfis?project_id=${pid}` },
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
  { labelKey: 'addRfi', icon: <QuestionAnswer />, color: '#D97706', link: (pid) => `/engineering/rfis?project_id=${pid}` },
  { labelKey: 'addMar', icon: <CheckCircle />, color: '#f97316', link: (pid) => `/engineering/mar?project_id=${pid}` },
  { labelKey: 'addDrawing', icon: <Image />, color: '#D97706', link: (pid) => `/engineering/drawings?project_id=${pid}` },
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
      <Box sx={{ pl: 1.5, py: 0.75, borderLeft: '3px solid', borderColor: color, borderRadius: '0 6px 6px 0', bgcolor: alpha(color, 0.04) }}>
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
        <CircularProgress size={44} sx={{ color: '#D97706' }} />
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
  const projectStatusBg = { planned: '#D97706', in_progress: '#D97706', completed: '#10b981', on_hold: '#f59e0b', cancelled: '#ef4444' }[project.status] || '#6b7280';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack spacing={3}>
        {/* Project Info Header */}
        <motion.div variants={itemVariants}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'visible', position: 'relative' }}>
            <Box sx={{ height: 4, background: 'linear-gradient(90deg, #D97706, #D97706, #F59E0B)', borderRadius: '12px 12px 0 0' }} />
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'center' }}>
                <Box sx={{ p: '2px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #D97706, #FDE68A)', flexShrink: 0 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.3rem', fontWeight: 700 }}>
                    {project.code?.charAt(0) || 'P'}
                  </Avatar>
                </Box>
                <Box flex={1}>
                  <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                    <Typography variant="h5" fontWeight={700}>{project.name}</Typography>
                    <Chip label={t(project.status)} size="small" sx={{ fontWeight: 700, bgcolor: alpha(projectStatusBg, 0.12), color: projectStatusBg, border: '1px solid', borderColor: alpha(projectStatusBg, 0.25) }} />
                    <Chip label={project.project_type} size="small" variant="outlined" sx={{ opacity: 0.7 }} />
                  </Stack>
                  <Stack direction="row" spacing={3} mt={1} flexWrap="wrap">
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
                  <Stack direction="row" spacing={3} mt={0.5} flexWrap="wrap">
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
                  sx={{ bgcolor: '#D97706', '&:hover': { bgcolor: '#92400E' }, whiteSpace: 'nowrap', borderRadius: 2, boxShadow: '0 4px 14px rgba(217,119,6,0.25)' }}
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
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Bolt sx={{ color: '#D97706', fontSize: '1rem' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.06em">
                Quick Actions
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {quickActions.map(({ labelKey, icon, color, link }) => (
                <Button key={labelKey} variant="outlined" size="small" startIcon={icon}
                  onClick={() => navigate(link(projectId))}
                  sx={{ borderColor: alpha(color, 0.35), color, '&:hover': { borderColor: color, bgcolor: alpha(color, 0.08), transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${alpha(color, 0.15)}` }, fontWeight: 600, borderRadius: 2, transition: 'all 0.2s ease' }}
                >
                  {t(labelKey)}
                </Button>
              ))}
            </Stack>
          </Stack>
        </motion.div>

        {/* Entity Count Stats */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={2}>
            {entityCards.map(({ key, icon, color, labelKey, link }) => (
              <Grid key={key} item xs={6} sm={4} md={3} lg={2} sx={{ position: 'relative' }}>
                <Box sx={{ position: 'absolute', bottom: 8, right: 8, width: 8, height: 8, borderRadius: '50%', bgcolor: color, opacity: 0.5, zIndex: 2 }} />
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
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Box sx={{ height: 3, background: 'linear-gradient(90deg, #D97706, #D97706)', borderRadius: '12px 12px 0 0' }} />
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <TrendingUp sx={{ color: '#D97706', fontSize: '1.1rem' }} />
                <Typography variant="subtitle2" fontWeight={600} flex={1}>{t('evmTitle')}</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/engineering/evm')} sx={{ fontSize: '0.75rem' }}>
                  {t('viewAll')}
                </Button>
              </Stack>
              <Box sx={{ p: 2.5 }}>
                <Grid container spacing={2}>
                  <EVMStat label="SPI" value={Number(evm.spi).toFixed(2)} color={evm.spi >= 1 ? '#10b981' : '#ef4444'} />
                  <EVMStat label="CPI" value={Number(evm.cpi).toFixed(2)} color={evm.cpi >= 1 ? '#10b981' : '#ef4444'} />
                  <EVMStat label={t('plannedValue')} value={formatNumber(evm.planned_value)} color="#D97706" />
                  <EVMStat label={t('earnedValue')} value={formatNumber(evm.earned_value)} color="#10b981" />
                  <EVMStat label={t('actualCost')} value={formatNumber(evm.actual_cost)} color="#f59e0b" />
                  <EVMStat label={t('totalBudget')} value={formatNumber(evm.total_budget)} color="#D97706" />
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
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                  <Box sx={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: '12px 12px 0 0' }} />
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
                      <Box sx={{ px: 2.5, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: alpha('#ef4444', 0.04) } }} onClick={() => navigate(`/engineering/ncr?project_id=${projectId}`)}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: { minor: alpha('#10b981', 0.15), major: alpha('#f59e0b', 0.15), critical: alpha('#ef4444', 0.15) }[n.severity] || alpha('#6b7280', 0.15), color: { minor: '#10b981', major: '#f59e0b', critical: '#ef4444' }[n.severity] || '#6b7280', fontSize: '0.65rem', fontWeight: 700 }}>
                            {n.ncr_number?.slice(-2) || 'N'}
                          </Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography variant="body2" fontWeight={500} noWrap>{n.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{n.ncr_number}</Typography>
                          </Box>
                          <Chip label={n.status} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600 }} color={ncrStatusColor[n.status] || 'default'} />
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
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                  <Box sx={{ height: 3, background: 'linear-gradient(90deg, #D97706, #a78bfa)', borderRadius: '12px 12px 0 0' }} />
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <QuestionAnswer sx={{ color: '#D97706', fontSize: '1.1rem' }} />
                      <Typography variant="subtitle2" fontWeight={600}>{t('recentRfis')}</Typography>
                    </Stack>
                    <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/engineering/rfis?project_id=${projectId}`)} sx={{ fontSize: '0.75rem' }}>
                      {t('viewAll')}
                    </Button>
                  </Stack>
                  {recent_rfis.map((r, i) => (
                    <Box key={r.id}>
                      {i > 0 && <Divider sx={{ mx: 2 }} />}
                      <Box sx={{ px: 2.5, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: alpha('#D97706', 0.04) } }} onClick={() => navigate(`/engineering/rfis?project_id=${projectId}`)}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#D97706', 0.15), color: '#D97706', fontSize: '0.65rem', fontWeight: 700 }}>
                            {r.rfi_number?.slice(-2) || 'R'}
                          </Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography variant="body2" fontWeight={500} noWrap>{r.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{r.rfi_number}</Typography>
                          </Box>
                          <Chip label={r.status} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600 }} color={rfiStatusColor[r.status] || 'default'} />
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
