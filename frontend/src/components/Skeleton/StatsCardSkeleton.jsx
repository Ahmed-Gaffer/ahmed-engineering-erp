import { Box, Skeleton, Card } from '@mui/material';

export default function StatsCardSkeleton() {
  return (
    <Card>
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rounded" width="60%" height={12} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" width="40%" height={28} />
          </Box>
          <Skeleton variant="rounded" width={42} height={42} />
        </Box>
      </Box>
    </Card>
  );
}
