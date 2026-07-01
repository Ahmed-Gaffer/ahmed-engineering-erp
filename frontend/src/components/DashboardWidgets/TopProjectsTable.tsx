import { Box, Card, CardContent, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Icon from '../SvgIcon/SvgIcon';
import { formatNumber } from '../../utils/helpers';

interface Project {
  id: number | string;
  code: string;
  name: string;
  contract_value: number;
  status: string;
}

interface TopProjectsTableProps {
  projects?: Project[];
}

const statusDot = (status: string) => {
  const m: Record<string, string> = { success: 'var(--clr-green-500)', warning: 'var(--clr-amber-500)', error: 'var(--clr-red-500)', info: 'var(--clr-blue-500)' };
  return m[status] || 'var(--clr-navy-400)';
};

const statusColor = (status: string) => {
  const m: Record<string, 'success' | 'warning' | 'error' | 'info'> = { success: 'success', warning: 'warning', error: 'error', info: 'info' };
  return m[status] || 'default';
};

export default function TopProjectsTable({ projects = [] }: TopProjectsTableProps) {
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
            <Typography fontWeight={700} variant="subtitle1" sx={{ letterSpacing: '-0.01em' }}>Top Projects</Typography>
            <Typography variant="caption" sx={{ color: 'var(--clr-text-secondary)', fontSize: '0.7rem' }}>
              By contract value
            </Typography>
          </Box>
          <Button size="small" variant="text" endIcon={<Icon name="arrowRight" size={16} />} sx={{ color: '#d4a030', fontWeight: 600 }} onClick={() => navigate('/engineering/projects')}>
            View All
          </Button>
        </Stack>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflowX: 'auto', maxHeight: 280, '&::-webkit-scrollbar': { height: 4 } }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }} align="right">Contract</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((p, idx) => (
                <TableRow
                  key={p.id} hover
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(212,160,48,0.03)' } }}
                  onClick={() => navigate(`/engineering/projects/${p.id}`)}
                >
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.code}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{p.name}</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-gold-500)' }}>{formatNumber(p.contract_value)}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusDot(p.status) }} />
                      <Chip label={p.status} size="small" color={statusColor(p.status)} sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" sx={{ color: 'var(--clr-text-secondary)' }}>No data</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
