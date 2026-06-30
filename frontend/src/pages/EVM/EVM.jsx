import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, TextField, MenuItem, Grid, Card, CardContent, Stack, Chip,
  LinearProgress, Table, TableBody, TableCell, TableContainer, TableRow, Paper,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader/PageHeader';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { engineeringApi } from '../../services/api';
import EmptyState from '../../components/EmptyState/EmptyState';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';

function formatNumber(n) {
  if (n == null) return '0.00';
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(n) {
  if (n == null) return '0%';
  return (Number(n) * 100).toFixed(1) + '%';
}

const STATUS_COLORS = {
  good: { bg: '#10b981', label: 'On Track' },
  warning: { bg: '#f59e0b', label: 'At Risk' },
  critical: { bg: '#ef4444', label: 'Critical' },
};

function getEVMStatus(spi, cpi) {
  if (spi >= 0.95 && cpi >= 0.95) return 'good';
  if (spi >= 0.8 && cpi >= 0.8) return 'warning';
  return 'critical';
}

export default function EVM() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [evm, setEvm] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    engineeringApi.projects.list().then(r => setProjects(r.data || [])).catch(() => {});
  }, []);

  const fetchEvm = useCallback(async () => {
    if (!selectedProjectId) { setEvm(null); return; }
    setLoading(true);
    setError(null);
    try {
      const r = await engineeringApi.evm.report(selectedProjectId);
      setEvm(r.data);
    } catch (e) {
      setError('Failed to load EVM data');
      setEvm(null);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => { fetchEvm(); }, [fetchEvm]);

  const sCurveData = evm ? [
    { name: '0%', planned: 0, earned: 0, actual: 0 },
    { name: '25%', planned: Number(evm.total_budget) * 0.25, earned: Number(evm.earned_value) * 0.25, actual: Number(evm.actual_cost) * 0.25 },
    { name: '50%', planned: Number(evm.total_budget) * 0.5, earned: Number(evm.earned_value) * 0.5, actual: Number(evm.actual_cost) * 0.5 },
    { name: '75%', planned: Number(evm.total_budget) * 0.75, earned: Number(evm.earned_value) * 0.75, actual: Number(evm.actual_cost) * 0.75 },
    { name: '100%', planned: Number(evm.total_budget), earned: Number(evm.earned_value), actual: Number(evm.actual_cost) },
  ] : [];

  const status = evm ? getEVMStatus(Number(evm.spi), Number(evm.cpi)) : 'good';

  const metrics = evm ? [
    { label: t('plannedValue'), value: formatNumber(evm.planned_value), color: 'primary.main' },
    { label: t('earnedValue'), value: formatNumber(evm.earned_value), color: 'success.main' },
    { label: t('actualCost'), value: formatNumber(evm.actual_cost), color: 'warning.main' },
    { label: t('scheduleVariance'), value: formatNumber(evm.schedule_variance), color: Number(evm.schedule_variance) >= 0 ? 'success.main' : 'error.main' },
    { label: t('costVariance'), value: formatNumber(evm.cost_variance), color: Number(evm.cost_variance) >= 0 ? 'success.main' : 'error.main' },
    { label: 'SPI', value: formatPercent(evm.spi), color: Number(evm.spi) >= 1 ? 'success.main' : 'error.main' },
    { label: 'CPI', value: formatPercent(evm.cpi), color: Number(evm.cpi) >= 1 ? 'success.main' : 'error.main' },
    { label: t('estimateAtCompletion'), value: formatNumber(evm.estimate_at_completion), color: 'secondary.main' },
    { label: t('estimateToComplete'), value: formatNumber(evm.estimate_to_complete), color: '#ec4899' },
    { label: t('varianceAtCompletion'), value: formatNumber(evm.variance_at_completion), color: Number(evm.variance_at_completion) >= 0 ? 'success.main' : 'error.main' },
    { label: t('totalBudget'), value: formatNumber(evm.total_budget), color: 'text.secondary' },
    { label: t('totalBilled'), value: formatNumber(evm.total_billed), color: 'info.main' },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <PageHeader
          title="Earned Value Management (EVM)"
          subtitle="Analyze project performance with Planned vs Earned vs Actual metrics"
          icon=""
          stats={evm ? [
            { label: 'SPI', value: formatPercent(evm.spi) },
            { label: 'CPI', value: formatPercent(evm.cpi) },
            { label: 'Status', value: status === 'good' ? 'On Track' : status === 'warning' ? 'At Risk' : 'Critical' },
          ] : [{ label: 'Select Project', value: '' }]}
        />
        <TextField select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} label={t('selectProject')} sx={{ mb: 3, minWidth: 280 }}>
          <MenuItem value="">{t('all')}</MenuItem>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>

        {!selectedProjectId ? (
          <EmptyState title={t('selectProject')} description={t('selectProjectDescription')} />
        ) : loading ? (
          <DataGridSkeleton />
        ) : error ? (
          <EmptyState title="Error" description={error} />
        ) : evm ? (
          <>
            <Card sx={{ mb: 3, border: `1px solid ${STATUS_COLORS[status].bg}44` }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography fontWeight={600} variant="body1">{t('executiveSummary')}</Typography>
                  <Chip label={STATUS_COLORS[status].label} size="small" sx={{ bgcolor: `${STATUS_COLORS[status].bg}22`, color: STATUS_COLORS[status].bg, fontWeight: 600 }} />
                </Stack>
                <Grid container spacing={2}>
                  {metrics.map((m) => (
                    <Grid key={m.label} item xs={6} sm={4} md={3} lg={2}>
                      <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>{m.label}</Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: m.color }}>
                          {m.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography fontWeight={600} variant="body1" mb={2}>S-Curve</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={sCurveData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={(v) => formatNumber(v)} />
                        <RechartsTooltip formatter={(v) => formatNumber(v)} />
                        <Legend />
                        <Line type="monotone" dataKey="planned" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 4 }} name="PV (Planned)" />
                        <Line type="monotone" dataKey="earned" stroke={theme.palette.success.main} strokeWidth={2} dot={{ r: 4 }} name="EV (Earned)" />
                        <Line type="monotone" dataKey="actual" stroke={theme.palette.warning.main} strokeWidth={2} dot={{ r: 4 }} name="AC (Actual)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography fontWeight={600} variant="body1" mb={2}>Performance Indicators</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>SPI ({t('spi')})</TableCell>
                            <TableCell align="right">
                              <Typography sx={{ color: Number(evm.spi) >= 1 ? 'success.main' : 'error.main', fontWeight: 700 }}>
                                {formatPercent(evm.spi)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>CPI ({t('cpi')})</TableCell>
                            <TableCell align="right">
                              <Typography sx={{ color: Number(evm.cpi) >= 1 ? 'success.main' : 'error.main', fontWeight: 700 }}>
                                {formatPercent(evm.cpi)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>SV</TableCell>
                            <TableCell align="right">
                              <Typography sx={{ color: Number(evm.schedule_variance) >= 0 ? 'success.main' : 'error.main', fontWeight: 700 }}>
                                {formatNumber(evm.schedule_variance)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>CV</TableCell>
                            <TableCell align="right">
                              <Typography sx={{ color: Number(evm.cost_variance) >= 0 ? 'success.main' : 'error.main', fontWeight: 700 }}>
                                {formatNumber(evm.cost_variance)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('totalBudget')}</TableCell>
                            <TableCell align="right">{formatNumber(evm.total_budget)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('totalBilled')}</TableCell>
                            <TableCell align="right">{formatNumber(evm.total_billed)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('estimateAtCompletion')}</TableCell>
                            <TableCell align="right">{formatNumber(evm.estimate_at_completion)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('estimateToComplete')}</TableCell>
                            <TableCell align="right">{formatNumber(evm.estimate_to_complete)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('varianceAtCompletion')}</TableCell>
                            <TableCell align="right">
                              <Typography sx={{ color: Number(evm.variance_at_completion) >= 0 ? 'success.main' : 'error.main', fontWeight: 700 }}>
                                {formatNumber(evm.variance_at_completion)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : null}
      </Box>
    </motion.div>
  );
}
