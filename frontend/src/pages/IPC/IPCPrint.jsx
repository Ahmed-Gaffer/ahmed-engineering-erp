import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Divider,
} from '@mui/material';
import { engineeringApi } from '../../services/api';
import { formatNumber, formatDate } from '../../utils/helpers';

export default function IPCPrint() {
  const { t, i18n } = useTranslation();
  const { ipcId } = useParams();
  const [ipc, setIpc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    engineeringApi.ipcs.get(ipcId)
      .then((res) => setIpc(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [ipcId]);

  useEffect(() => {
    if (!loading && !error) window.print();
  }, [loading, error]);

  if (loading) return null;
  if (error || !ipc) return <Typography p={4}>{t('operationFailed')}</Typography>;

  const isRtl = i18n.language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  return (
    <Box sx={{ p: 4, direction: dir }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .no-print { display: none; }
      `}</style>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} letterSpacing={1}>
          {t('officialIpc')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('ipcNumber')}: {ipc.ipc_number} | {t('ipcPeriod')}: {ipc.ipc_period}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 180, bgcolor: 'action.hover' }}>{t('ipcNumber')}</TableCell>
              <TableCell>{ipc.ipc_number}</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 180, bgcolor: 'action.hover' }}>{t('ipcPeriod')}</TableCell>
              <TableCell>{ipc.ipc_period}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('projectName')}</TableCell>
              <TableCell>{ipc.project?.name || ipc.project_name || '-'}</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('contractorName')}</TableCell>
              <TableCell>{ipc.contract?.party_b || '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('startDate')}</TableCell>
              <TableCell>{ipc.start_date ? formatDate(ipc.start_date) : '-'}</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('endDatePlanned')}</TableCell>
              <TableCell>{ipc.end_date ? formatDate(ipc.end_date) : '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" fontWeight={600} mb={2}>{t('lineItems')}</Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>{t('itemCode')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('description')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">{t('unit')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">{t('previousQuantity')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">{t('currentQuantity')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">{t('cumulativeQuantity')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">{t('percentage')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">{t('unitPrice')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">{t('amount')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ipc.details && ipc.details.length > 0 ? ipc.details.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.boq_item_code || '-'}</TableCell>
                <TableCell>{item.boq_item_description || '-'}</TableCell>
                <TableCell align="right">{item.boq_item_unit || '-'}</TableCell>
                <TableCell align="right">{formatNumber(item.previous_quantity)}</TableCell>
                <TableCell align="right">{formatNumber(item.current_quantity)}</TableCell>
                <TableCell align="right">{formatNumber(item.cumulative_quantity)}</TableCell>
                <TableCell align="right">{formatNumber(item.percentage)}%</TableCell>
                <TableCell align="right">{formatNumber(item.boq_item?.unit_price || 0)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatNumber(item.amount)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" py={2}>{t('noLineItems')}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: 400 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('total')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatNumber(ipc.total_amount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('retention')} ({ipc.contract?.retention_percent || 0}%)</TableCell>
                <TableCell align="right">{formatNumber(ipc.retention_amount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('advanceRecovery')}</TableCell>
                <TableCell align="right">{formatNumber(ipc.advance_recovery)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>{t('netAmount')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatNumber(ipc.net_amount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" fontWeight={600} mb={2}>{t('signatures')}</Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ height: 80, width: '25%', textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={600}>{t('engineer')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('engineer')}</Typography>
              </TableCell>
              <TableCell sx={{ height: 80, width: '25%', textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={600}>{t('contractor')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('contractorName')}</Typography>
              </TableCell>
              <TableCell sx={{ height: 80, width: '25%', textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={600}>{t('consultant')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('consultant')}</Typography>
              </TableCell>
              <TableCell sx={{ height: 80, width: '25%', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={600}>{t('client')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('client')}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
