import { Box, Card, CardContent, Typography, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function ChartCard({ title, subtitle, children, action }: ChartCardProps) {
  return (
    <Card sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      '&:hover': {
        boxShadow: '0 12px 28px rgba(10,15,30,0.08), 0 0 0 1px rgba(212,160,48,0.08)',
      },
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: 'var(--clr-gold-500)', boxShadow: '0 0 12px rgba(212,160,48,0.4)' }} />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: { xs: 2, md: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography fontWeight={700} variant="subtitle1" sx={{ letterSpacing: '-0.01em' }}>{title}</Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'var(--clr-text-secondary)', fontSize: '0.7rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
