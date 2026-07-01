import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import {
  Box, Typography, Stack, Card, CardContent, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Alert, Grid, Avatar,
  Tooltip, CircularProgress, Divider, FormControl, InputLabel, Select,
} from '@mui/material';
import {
  Add, Edit, Delete, Search, FilterList, Refresh, CheckCircle, Close,
  Visibility, Assignment, Warning, History, Business, Category, Code,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { engineeringApi } from '../../services/api';
import { formatDate, statusColors } from '../../utils/helpers';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import PageHeader from '../../components/PageHeader/PageHeader';
import EChart from '../../components/EChart';

const incidentStatusColors = {
  reported: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  investigating: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  action_taken: { bg: 'rgba(139,92,246,0.15)', color: 'secondary.main' },
  closed: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const observationStatusColors = {
  open: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  acknowledged: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  resolved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  closed: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const KpiCard = ({ title, value, color, icon, subtitle }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: color, opacity: 0.7 }} />
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.75rem">{title}</Typography>
          <Typography variant="h4" fontWeight={800} mt={0.25} fontSize={{ xs: '1.5rem', md: '1.75rem' }}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>{subtitle}</Typography>}
        </Box>
        {icon && (
          <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', color, border: `1px solid ${color}22` }}>
            {icon}
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, subtitle, children }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', borderTop: '4px solid', borderTopColor: 'secondary.main' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: { xs: 2, md: 2.5 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography fontWeight={700} variant="body1" fontSize="0.95rem">{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary" fontSize="0.7rem">{subtitle}</Typography>}
        </Box>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </CardContent>
  </Card>
);

export default function HSEDashboard() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project_id') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [recentObservations, setRecentObservations] = useState([]);

  useEffect(() => {
    engineeringApi.projects.list().then((r) => {
      const items = r.data || [];
      setProjects(items);
      const urlPid = searchParams.get('project_id');
      if (urlPid && items.some((p) => p.id === Number(urlPid))) {
        setSelectedProjectId(Number(urlPid));
      } else if (items.length && !selectedProjectId) {
        setSelectedProjectId(items[0].id);
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const [summaryRes, incidentsRes, observationsRes] = await Promise.all([
        engineeringApi.hseDashboard.get(selectedProjectId),
        engineeringApi.safetyIncidents.listByProject(selectedProjectId),
        engineeringApi.safetyObservations.listByProject(selectedProjectId),
      ]);
      setData(summaryRes.data);
      setRecentIncidents((incidentsRes.data || []).slice(0, 5));
      setRecentObservations((observationsRes.data || []).slice(0, 5));
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { if (selectedProjectId) fetchData(); }, [fetchData, selectedProjectId]);

  const severityData = data ? (data.by_severity || []).map(s => ({ name: t(s.severity), value: s.count })) : [];

  if (!selectedProjectId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title={t('hseDashboard')} subtitle="Health, Safety & Environment Dashboard" icon={<Warning />} />
        <Stack direction="row" spacing={1.5} mb={2.5}>
          <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
            sx={{ minWidth: 240 }}>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
          </TextField>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('hseDashboard')}
        subtitle="Health, Safety & Environment Dashboard"
        icon={<Warning />}
        onRefresh={fetchData}
      />
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
          sx={{ minWidth: 240 }}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
        </TextField>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
      ) : !data ? (
        <Box textAlign="center" py={8}>
          <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>{t('noData')}</Typography>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>{t('retry')}</Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard title={t('totalIncidents')} value={data.total_incidents || 0} icon={<Warning />} color="#ef4444" subtitle={t('allReported')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard title={t('openIncidents')} value={(data.by_status || []).filter(s => s.status !== 'closed').reduce((sum, s) => sum + s.count, 0)} icon={<Assignment />} color="#f59e0b" subtitle={t('notClosed')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard title={t('totalObservations')} value={data.total_observations || 0} icon={<Visibility />} color="#3b82f6" subtitle={t('allRecorded')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard title={t('openObservations')} value={(data.observations_by_status || []).filter(s => s.status !== 'closed').reduce((sum, s) => sum + s.count, 0)} icon={<Assignment />} color={theme.palette.secondary.main} subtitle={t('notClosed')} />
            </Grid>
          </Grid>

          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} md={6}>
              <ChartCard title={t('incidentsBySeverity')} subtitle={t('distribution')}>
                <Box sx={{ height: 280 }}>
                  {severityData.length === 0 ? (
                    <Box textAlign="center" py={6}><Typography variant="body2" color="text.secondary">{t('noData')}</Typography></Box>
                  ) : (
                    <EChart
                      height={280}
                      option={{
                        tooltip: { trigger: 'axis' },
                        xAxis: { type: 'category', data: severityData.map(d => d.name) },
                        yAxis: { type: 'value', minInterval: 1 },
                        series: [{
                          type: 'bar',
                          data: severityData.map((d, i) => ({
                            value: d.value,
                            itemStyle: { color: ['#3b82f6', '#f59e0b', '#ef4444', '#000000'][i] },
                          })),
                        }],
                      }}
                    />
                  )}
                </Box>
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard title={t('statusBreakdown')} subtitle={t('incidents')}>
                <Box sx={{ height: 280 }}>
                  {(data.by_status || []).length === 0 ? (
                    <Box textAlign="center" py={6}><Typography variant="body2" color="text.secondary">{t('noData')}</Typography></Box>
                  ) : (
                    <EChart
                      height={280}
                      option={{
                        tooltip: { trigger: 'axis' },
                        xAxis: { type: 'category', data: (data.by_status || []).map(s => t(s.status)) },
                        yAxis: { type: 'value', minInterval: 1 },
                        series: [{ type: 'bar', data: (data.by_status || []).map(s => s.count) }],
                      }}
                    />
                  )}
                </Box>
              </ChartCard>
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Card sx={{ position: 'relative', overflow: 'hidden', borderTop: '4px solid', borderTopColor: 'secondary.main' }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography fontWeight={700} variant="body1" fontSize="0.95rem">{t('recentIncidents')}</Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">{t('lastFive')}</Typography>
                    </Box>
                    <Button size="small" variant="text" onClick={() => navigate('/engineering/safety-incidents')}>{t('viewAll')}</Button>
                  </Stack>
                  {recentIncidents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>{t('noData')}</Typography>
                  ) : (
                    <Stack spacing={1}>
                      {recentIncidents.map((inc) => {
                        const sc = incidentStatusColors[inc.status] || incidentStatusColors.reported;
                        return (
                          <Box key={inc.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>{inc.title}</Typography>
                                <Typography variant="caption" color="text.secondary">{inc.incident_number} — {inc.location}</Typography>
                              </Box>
                              <Chip label={t(inc.status)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500, ml: 1 }} />
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ position: 'relative', overflow: 'hidden', borderTop: '4px solid', borderTopColor: 'secondary.main' }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography fontWeight={700} variant="body1" fontSize="0.95rem">{t('recentObservations')}</Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">{t('lastFive')}</Typography>
                    </Box>
                    <Button size="small" variant="text" onClick={() => navigate('/engineering/safety-observations')}>{t('viewAll')}</Button>
                  </Stack>
                  {recentObservations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>{t('noData')}</Typography>
                  ) : (
                    <Stack spacing={1}>
                      {recentObservations.map((obs) => {
                        const sc = observationStatusColors[obs.status] || observationStatusColors.open;
                        return (
                          <Box key={obs.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>{obs.title}</Typography>
                                <Typography variant="caption" color="text.secondary">{t(obs.observation_type)} — {obs.location}</Typography>
                              </Box>
                              <Chip label={t(obs.status)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500, ml: 1 }} />
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </motion.div>
  );
}
