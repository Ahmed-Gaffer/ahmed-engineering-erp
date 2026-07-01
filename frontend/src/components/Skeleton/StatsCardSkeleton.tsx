import { Box, Card } from '@mui/material';

export default function StatsCardSkeleton() {
  return (
    <Card>
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box className="ems-animate-shimmer" sx={{ width: '60%', height: 12, borderRadius: 1, bgcolor: 'var(--clr-skeleton-base)', mb: 1 }} />
            <Box className="ems-animate-shimmer" sx={{ width: '40%', height: 28, borderRadius: 1, bgcolor: 'var(--clr-skeleton-base)' }} />
          </Box>
          <Box className="ems-animate-shimmer" sx={{ width: 42, height: 42, borderRadius: 1, bgcolor: 'var(--clr-skeleton-base)' }} />
        </Box>
      </Box>
    </Card>
  );
}
