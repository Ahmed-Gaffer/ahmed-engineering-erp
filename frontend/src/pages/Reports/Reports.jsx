import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid, Card, CardContent, Typography, Box, Stack, Chip, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import {
  Assessment, Download, Print, Folder, Receipt, Construction, AccountBalance,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { motion } from 'framer-motion';
import StatsCard from '../../components/StatsCard/StatsCard';
import StatsCardSkeleton from '../../components/Skeleton/StatsCardSkeleton';
import { engineeringApi } from '../../services/api';
import { formatNumber, formatDate, statusColors } from '../../utils/helpers';

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

const handleExportCsv = (projects) => {
  const headers = ['Code', 'Name', 'Status', 'Contract Value', 'BOQ Total', 'IPC Total', 'Progress'];
  const rows = projects.map((p) => [
    p.code, `"${(p.name || '').replace(/"/g, '""')}"`, p.status,
    p.contract_value || 0, p.boq_total || 0, p.ipc_total || 0, p.progress || 0,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'executive-summary.csv'; a.click();
  window.URL.revokeObjectURL(url);
};

export default function Reports() {
  const { t, i18n } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    Promise.all([
      engineeringApi.projects.list(),
      engineeringApi.dashboard.summary(),
    ])
      .then(([projRes, dashRes]) => {
        setProjects(projRes.data || []);
        setSummary(dashRes.data || {});
        setLoaded(true);
      })
      .catch(() => {
        setError(true);
        setLoaded(true);
      });
  }, []);

  const {
    total_projects = 0, total_contract_value = 0, total_boq_items = 0,
    total_boq_value = 0, total_ipc_count = 0, total_ipc_amount = 0,
    total_ipc_paid = 0, total_contracts = 0, recent_ipcs = [],
  } = summary;

  const remainingBalance = total_contract_value - total_ipc_paid;

  const projectColumns = [
    { field: 'code', headerName: t('code'), width: 120 },
    { field: 'name', headerName: t('name'), flex: 1, minWidth: 180 },
    {
      field: 'status', headerName: t('status'), width: 130,
      renderCell: (params) => (
        <Chip
          label={t(params.value) || params.value}
          size="small"
          color={statusColors[params.value] || 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'contract_value', headerName: t('contractValue'), width: 150,
      renderCell: (params) => <Typography variant="body2" fontWeight={500}>{formatNumber(params.value)}</Typography>,
    },
    {
      field: 'boq_total', headerName: t('totalBoqValue'), width: 150,
      renderCell: (params) => <Typography variant="body2">{formatNumber(params.value)}</Typography>,
    },
    {
      field: 'ipc_total', headerName: t('totalIpcAmount'), width: 150,
      renderCell: (params) => <Typography variant="body2" fontWeight={500}>{formatNumber(params.value)}</Typography>,
    },
    {
      field: 'progress', headerName: t('progressPercentage'), width: 130,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: '100%', height: '100%' }}>
          <Box sx={{
            flex: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <Box sx={{
              width: `${params.value || 0}%`, height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(90deg, #6366f1, #818cf8)',
              transition: 'width 0.6s ease',
            }} />
          </Box>
          <Typography variant="caption" fontWeight={600} sx={{ minWidth: 36, textAlign: 'right' }}>
            {params.value || 0}%
          </Typography>
        </Stack>
      ),
    },
  ];

  if (!loaded) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('reports')}</Typography>
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

  if (error) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">{t('reportsUnavailable')}</Typography>
      </Box>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">{t('reports')}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            {t('reportsSubtitle')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download />}
            onClick={() => handleExportCsv(projects)}
          >
            {t('export')}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            {t('print')}
          </Button>
        </Stack>
      </Stack>

      <motion.div variants={itemVariants}>
        <Card sx={sectionSx}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('executiveSummary')}</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalProjects')} value={total_projects} icon={<Folder />} color="primary" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalContracts')} value={total_contracts} icon={<Construction />} color="info" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalBoqItems')} value={total_boq_items} icon={<Assessment />} color="secondary" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalIpcCount')} value={total_ipc_count} icon={<Receipt />} color="warning" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card sx={sectionSx}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('financialSummary')}</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalContractValue')} value={formatNumber(total_contract_value)} icon={<AccountBalance />} color="primary" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalBoqValue')} value={formatNumber(total_boq_value)} icon={<Assessment />} color="secondary" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('totalIpcPaid')} value={formatNumber(total_ipc_paid)} icon={<Receipt />} color="success" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard title={t('remainingBalance')} value={formatNumber(remainingBalance)} icon={<AccountBalance />} color="warning" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card sx={{ ...sectionSx, overflow: 'hidden' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('projectComparison')}</Typography>
            <Box sx={{ height: 420 }}>
              <DataGrid
                rows={projects}
                columns={projectColumns}
                getRowId={(r) => r.id || r.code}
                pageSizeOptions={[5, 10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                disableRowSelectionOnClick
                localeText={i18n.language === 'ar' ? arSD.components.MuiDataGrid.defaultProps.localeText : enUS.components.MuiDataGrid.defaultProps.localeText}
                sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card sx={sectionSx}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('recentIpcs')}</Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('ipcNumber')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('project')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('amount')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(recent_ipcs.length > 0 ? recent_ipcs : []).map((ipc, i) => (
                    <TableRow key={ipc.id || i} hover>
                      <TableCell>{ipc.ipc_number || ipc.code || '-'}</TableCell>
                      <TableCell>{ipc.project_name || ipc.project?.name || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(ipc.status) || ipc.status}
                          size="small"
                          color={statusColors[ipc.status] || 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {formatNumber(ipc.net_amount || ipc.amount || 0)}
                      </TableCell>
                      <TableCell>{formatDate(ipc.date || ipc.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {recent_ipcs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" py={2}>{t('noData')}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
