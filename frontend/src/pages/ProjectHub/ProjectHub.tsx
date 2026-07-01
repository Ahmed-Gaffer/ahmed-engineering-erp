import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, CardContent, Chip, CircularProgress,
  Grid, Button, Avatar, Divider, alpha, useTheme,
} from '@mui/material';
import {
  FolderOpen, Business, Image, WarningAmber, QuestionAnswer, CheckCircle,
  CalendarMonth, Description, Schedule, Receipt, CompareArrows, Engineering,
  Add, ArrowForward, TrendingUp, Bolt, Science, Layers,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatsCard from '../../components/StatsCard/StatsCard';
import { engineeringApi } from '../../services/api';
import { formatNumber } from '../../utils/helpers';

const ncrStatusColor: Record<string, 'error' | 'warning' | 'success' | 'default'> = { open: 'error', in_progress: 'warning', closed: 'success', resolved: 'success' };
const rfiStatusColor: Record<string, 'warning' | 'success' | 'default'> = { open: 'warning', answered: 'success', closed: 'default' };

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function EVMStat({ label, value, color }: { label: string; value: string; color: string }) {
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
  const theme = useTheme();
  const gold = theme.palette.secondary.main;
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();

  const entityCards = [
    { key: 'contracts', icon: <Business />, color: gold, labelKey: 'contractsPage', link: (pid: string) => `/engineering/contracts-list?project_id=${pid}` },
    { key: 'drawings', icon: <Image />, color: gold, labelKey: 'drawings', link: (pid: string) => `/engineering/drawings?project_id=${pid}` },
    { key: 'ncrs', icon: <WarningAmber />, color: '#ef4444', labelKey: 'ncr', link: (pid: string) => `/engineering/ncr?project_id=${pid}` },
    { key: 'rfis', icon: <QuestionAnswer />, color: gold, labelKey: 'rfis', link: (pid: string) => `/engineering/rfis?project_id=${pid}` },
    { key: 'mar', icon: <CheckCircle />, color: '#f97316', labelKey: 'mar', link: (pid: string) => `/engineering/mar?project_id=${pid}` },
    { key: 'submittals', icon: <Description />, color: '#6366f1', labelKey: 'submittals', link: (pid: string) => `/engineering/submittals?project_id=${pid}` },
    { key: 'inspections', icon: <CheckCircle />, color: '#0891b2', labelKey: 'inspectionRequests', link: (pid: string) => `/engineering/inspection-requests?project_id=${pid}` },
    { key: 'meeting_minutes', icon: <Description />, color: '#10b981', labelKey: 'meetingMinutes', link: (pid: string) => `/engineering/projects/${pid}/meeting-minutes` },
    { key: 'daily_reports', icon: <CalendarMonth />, color: '#f59e0b', labelKey: 'dailyReportsPage', link: (pid: string) => `/engineering/daily-reports?project_id=${pid}` },
    { key: 'schedules', icon: <Schedule />, color: '#84cc16', labelKey: 'schedulesPage', link: (pid: string) => `/engineering/schedules?project_id=${pid}` },
    { key: 'boq_items', icon: <Receipt />, color: '#14b8a6', labelKey: 'boq', link: (pid: string) => `/engineering/boq?project_id=${pid}` },
    { key: 'variation_orders', icon: <CompareArrows />, color: '#f43f5e', labelKey: 'variationOrders', link: (pid: string) => `/engineering/variation-orders?project_id=${pid}` },
    { key: 'ipcs', icon: <Engineering />, color: '#3b82f6', labelKey: 'ipc', link: (pid: string) => `/engineering/ipc?project_id=${pid}` },
    { key: 'transmittals', icon: <Description />, color: '#8b5cf6', labelKey: 'transmittals', link: (pid: string) => `/engineering/transmittals?project_id=${pid}` },
    { key: 'punch_list', icon: <CheckCircle />, color: '#ec4899', labelKey: 'punchList', link: (pid: string) => `/engineering/punch-list?project_id=${pid}` },
    { key: 'cost_codes', icon: <Receipt />, color: '#6b7280', labelKey: 'costCodes', link: (pid: string) => `/engineering/cost-codes?project_id=${pid}` },
    { key: 'safety_incidents', icon: <WarningAmber />, color: '#ef4444', labelKey: 'safetyIncidents', link: (pid: string) => `/engineering/safety-incidents?project_id=${pid}` },
    { key: 'safety_observations', icon: <WarningAmber />, color: '#f97316', labelKey: 'safetyObservations', link: (pid: string) => `/engineering/safety-observations?project_id=${pid}` },
    { key: 'work_orders', icon: <Engineering />, color: '#3b82f6', labelKey: 'workOrders', link: (pid: string) => `/engineering/work-orders?project_id=${pid}` },
    { key: 'material_tests', icon: <Science />, color: '#10b981', labelKey: 'materialTests', link: (pid: string) => `/engineering/material-tests?project_id=${pid}` },
    { key: 'phases', icon: <Layers />, color: '#84cc16', labelKey: 'phases', link: (pid: string) => `/engineering/phases?project_id=${pid}` },
  ];

  const quickActions = [
    { labelKey: 'addNcr', icon: <WarningAmber />, color: '#ef4444', link: (pid: string) => `/engineering/ncr?project_id=${pid}` },
    { labelKey: 'addRfi', icon: <QuestionAnswer />, color: gold, link: (pid: string) => `/engineering/rfis?project_id=${pid}` },
    { labelKey: 'addMar', icon: <CheckCircle />, color: '#f97316', link: (pid: string) => `/engineering/mar?project_id=${pid}` },
    { labelKey: 'addDrawing', icon: <Image />, color: gold, link: (pid: string) => `/engineering/drawings?project_id=${pid}` },
  ];
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [evm, setEvm] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      engineeringApi.projects.summary(projectId!),
      engineeringApi.evm.report(projectId!).catch(() => null),
    ])
      .then(([summaryRes, evmRes]) => { setData(summaryRes.data); setEvm(evmRes?.data || null); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [projectId]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <CircularProgress size={44} sx={{ color: gold }} />
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

  const { project, counts, recent_ncrs, recent_rfis } = data as {
    project: Record<string, unknown>;
    counts: Record<string, number>;
    recent_ncrs?: Array<Record<string, unknown>>;
    recent_rfis?: Array<Record<string, unknown>>;
  };
  const projectStatusBg: Record<string, string> = { planned: gold, in_progress: gold, completed: '#10b981', on_hold: '#f59e0b', cancelled: '#ef4444' };
  const statusBg = projectStatusBg[project.status as string] || '#6b7280';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack spacing={3}>
        <motion.div variants={itemVariants}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'visible', position: 'relative' }}>
            <Box sx={{ height: 4, bgcolor: gold, borderRadius: '12px 12px 0 0' }} />
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'center' }}>
                <Box sx={{ p: '2px', borderRadius: '50%', bgcolor: gold, flexShrink: 0 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.3rem', fontWeight: 700 }}>
                    {(project.code as string)?.charAt(0) || 'P'}
                  </Avatar>
                </Box>
                <Box flex={1}>
                  <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                    <Typography variant="h5" fontWeight={700}>{project.name as string}</Typography>
                    <Chip label={t(project.status as string)} size="small" sx={{ fontWeight: 700, bgcolor: alpha(statusBg, 0.12), color: statusBg, border: '1px solid', borderColor: alpha(statusBg, 0.25) }} />
                    <Chip label={project.project_type as string} size="small" variant="outlined" sx={{ opacity: 0.7 }} />
                  </Stack>
                  <Stack direction="row" spacing={3} mt={1} flexWrap="wrap">
                    <Typography variant="body2" color="text.secondary">
                      <Typography component="span" fontWeight={600}>{t('code')}:</Typography> {project.code as string}
                    </Typography>
                    {project.location && (
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" fontWeight={600}>{t('location')}:</Typography> {project.location as string}
                      </Typography>
                    )}
                    {project.client_name && (
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" fontWeight={600}>{t('clientName')}:</Typography> {project.client_name as string}
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={3} mt={0.5} flexWrap="wrap">
                    {project.consultant_name && (
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" fontWeight={600}>{t('consultantName')}:</Typography> {project.consultant_name as string}
                      </Typography>
                    )}
                    {project.project_manager && (
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" fontWeight={600}>{t('projectManager')}:</Typography> {project.project_manager as string}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <Button variant="contained" color="secondary" startIcon={<Add />} size="small"
                  sx={{ whiteSpace: 'nowrap', borderRadius: 2 }}
                  onClick={() => navigate(`/engineering/projects`)}
                >
                  {t('edit')}
                </Button>
              </Stack>
            </Box>
            {(project.budget_estimated as number) > 0 && (
              <Box sx={{ px: { xs: 2.5, md: 3 }, pb: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {t('budgetEstimated')}: ${Number(project.budget_estimated).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Bolt sx={{ color: gold, fontSize: '1rem' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.06em">
                Quick Actions
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {quickActions.map(({ labelKey, icon, color, link }) => (
                <Button key={labelKey} variant="outlined" size="small" startIcon={icon}
                  onClick={() => navigate(link(projectId!))}
                  sx={{ borderColor: alpha(color, 0.35), color, '&:hover': { borderColor: color, bgcolor: alpha(color, 0.08), transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${alpha(color, 0.15)}` }, fontWeight: 600, borderRadius: 2, transition: 'all 0.2s ease' }}
                >
                  {t(labelKey)}
                </Button>
              ))}
            </Stack>
          </Stack>
        </motion.div>

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
                  onClick={() => navigate(link(projectId!))}
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {evm && (
          <motion.div variants={itemVariants}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Box sx={{ height: 3, bgcolor: gold, borderRadius: '12px 12px 0 0' }} />
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <TrendingUp sx={{ color: gold, fontSize: '1.1rem' }} />
                <Typography variant="subtitle2" fontWeight={600} flex={1}>{t('evmTitle')}</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/engineering/evm')} sx={{ fontSize: '0.75rem' }}>
                  {t('viewAll')}
                </Button>
              </Stack>
              <Box sx={{ p: 2.5 }}>
                <Grid container spacing={2}>
                  <EVMStat label="SPI" value={Number(evm.spi).toFixed(2)} color={(evm.spi as number) >= 1 ? '#10b981' : '#ef4444'} />
                  <EVMStat label="CPI" value={Number(evm.cpi).toFixed(2)} color={(evm.cpi as number) >= 1 ? '#10b981' : '#ef4444'} />
                  <EVMStat label={t('plannedValue')} value={formatNumber(evm.planned_value as number)} color={gold} />
                  <EVMStat label={t('earnedValue')} value={formatNumber(evm.earned_value as number)} color="#10b981" />
                  <EVMStat label={t('actualCost')} value={formatNumber(evm.actual_cost as number)} color="#f59e0b" />
                  <EVMStat label={t('totalBudget')} value={formatNumber(evm.total_budget as number)} color={gold} />
                </Grid>
              </Box>
            </Card>
          </motion.div>
        )}

        <Grid container spacing={2.5}>
          {recent_ncrs && (recent_ncrs as Array<Record<string, unknown>>).length > 0 && (
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                  <Box sx={{ height: 3, bgcolor: '#ef4444', borderRadius: '12px 12px 0 0' }} />
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <WarningAmber sx={{ color: '#ef4444', fontSize: '1.1rem' }} />
                      <Typography variant="subtitle2" fontWeight={600}>{t('recentNcrs')}</Typography>
                    </Stack>
                    <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/engineering/ncr?project_id=${projectId}`)} sx={{ fontSize: '0.75rem' }}>
                      {t('viewAll')}
                    </Button>
                  </Stack>
                  {(recent_ncrs as Array<Record<string, unknown>>).map((n, i) => (
                    <Box key={n.id as number}>
                      {i > 0 && <Divider sx={{ mx: 2 }} />}
                      <Box sx={{ px: 2.5, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: alpha('#ef4444', 0.04) } }} onClick={() => navigate(`/engineering/ncr?project_id=${projectId}`)}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: ({ minor: alpha('#10b981', 0.15), major: alpha('#f59e0b', 0.15), critical: alpha('#ef4444', 0.15) } as Record<string, string>)[n.severity as string] || alpha('#6b7280', 0.15), color: ({ minor: '#10b981', major: '#f59e0b', critical: '#ef4444' } as Record<string, string>)[n.severity as string] || '#6b7280', fontSize: '0.65rem', fontWeight: 700 }}>
                            {(n.ncr_number as string)?.slice(-2) || 'N'}
                          </Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography variant="body2" fontWeight={500} noWrap>{n.title as string}</Typography>
                            <Typography variant="caption" color="text.secondary">{n.ncr_number as string}</Typography>
                          </Box>
                          <Chip label={n.status as string} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600 }} color={ncrStatusColor[n.status as string] || 'default'} />
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Card>
              </motion.div>
            </Grid>
          )}

          {recent_rfis && (recent_rfis as Array<Record<string, unknown>>).length > 0 && (
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                  <Box sx={{ height: 3, bgcolor: gold, borderRadius: '12px 12px 0 0' }} />
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <QuestionAnswer sx={{ color: gold, fontSize: '1.1rem' }} />
                      <Typography variant="subtitle2" fontWeight={600}>{t('recentRfis')}</Typography>
                    </Stack>
                    <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/engineering/rfis?project_id=${projectId}`)} sx={{ fontSize: '0.75rem' }}>
                      {t('viewAll')}
                    </Button>
                  </Stack>
                  {(recent_rfis as Array<Record<string, unknown>>).map((r, i) => (
                    <Box key={r.id as number}>
                      {i > 0 && <Divider sx={{ mx: 2 }} />}
                      <Box sx={{ px: 2.5, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: alpha(gold, 0.04) } }} onClick={() => navigate(`/engineering/rfis?project_id=${projectId}`)}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(gold, 0.15), color: gold, fontSize: '0.65rem', fontWeight: 700 }}>
                            {(r.rfi_number as string)?.slice(-2) || 'R'}
                          </Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography variant="body2" fontWeight={500} noWrap>{r.title as string}</Typography>
                            <Typography variant="caption" color="text.secondary">{r.rfi_number as string}</Typography>
                          </Box>
                          <Chip label={r.status as string} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600 }} color={rfiStatusColor[r.status as string] || 'default'} />
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
