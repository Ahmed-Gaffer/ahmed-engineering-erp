import { Box, Card, CardContent, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Icon from '../SvgIcon/SvgIcon';
import { formatNumber } from '../../utils/helpers';

interface IpcItem {
  id: number | string;
  ipc_number: string;
  total_works: number;
  net_amount: number;
  status: string;
}

interface RecentIpcTableProps {
  ipcs?: IpcItem[];
}

const status: Record<string, { dot: string; chip: 'success' | 'info' | 'default' | 'error' }> = {
  approved: { dot: 'var(--clr-green-500)', chip: 'success' },
  submitted: { dot: 'var(--clr-blue-500)', chip: 'info' },
  draft: { dot: 'var(--clr-navy-400)', chip: 'default' },
  rejected: { dot: 'var(--clr-red-500)', chip: 'error' },
  certified: { dot: 'var(--clr-green-500)', chip: 'success' },
  paid: { dot: 'var(--clr-teal-500)', chip: 'success' },
};

export default function RecentIpcTable({ ipcs = [] }: RecentIpcTableProps) {
  const navigate = useNavigate();
  return (
    <Card sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      '&:hover': { boxShadow: '0 12px 28px rgba(10,15,30,0.08), 0 0 0 1px rgba(212,160,48,0.08)' },
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: 'var(--clr-gold-500)', boxShadow: '0 0 12px rgba(212,160,48,0.4)' }} />
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography fontWeight={700} variant="subtitle1" sx={{ letterSpacing: '-0.01em' }}>Recent IPCs</Typography>
            <Typography variant="caption" sx={{ color: 'var(--clr-text-secondary)', fontSize: '0.7rem' }}>
              Last 6 payment certificates
            </Typography>
          </Box>
          <Button size="small" variant="text" endIcon={<Icon name="arrowRight" size={16} />} sx={{ color: '#d4a030', fontWeight: 600 }} onClick={() => navigate('/engineering/ipc')}>
            View All
          </Button>
        </Stack>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflowX: 'auto', maxHeight: 280, '&::-webkit-scrollbar': { height: 4 } }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }} align="right">Works</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }} align="right">Net</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ipcs.map((ipc, idx) => {
                const s = status[ipc.status] || { dot: 'var(--clr-navy-400)', chip: 'default' as const };
                return (
                  <TableRow
                    key={ipc.id} hover
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(212,160,48,0.03)' } }}
                    onClick={() => navigate('/engineering/ipc')}
                  >
                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{ipc.ipc_number}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatNumber(ipc.total_works)}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-green-500)' }}>{formatNumber(ipc.net_amount)}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot }} />
                        <Chip label={ipc.status} size="small" color={s.chip} sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {ipcs.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" sx={{ color: 'var(--clr-text-secondary)' }}>No data</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
