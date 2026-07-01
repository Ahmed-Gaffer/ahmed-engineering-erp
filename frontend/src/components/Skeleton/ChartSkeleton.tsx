import { Box } from '@mui/material';

interface ChartSkeletonProps {
  height?: number;
}

export default function ChartSkeleton({ height = 280 }: ChartSkeletonProps) {
  return (
    <Box sx={{ p: 2.5 }}>
      <Box className="ems-animate-shimmer" sx={{ width: '40%', height: 14, borderRadius: 1, bgcolor: 'var(--clr-skeleton-base)', mb: 3 }} />
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height }}>
        {[70, 45, 85, 55, 90, 60, 75, 50, 80, 65, 40, 95].map((h, i) => (
          <Box
            key={i}
            className="ems-animate-shimmer"
            sx={{
              flex: 1,
              height: `${h}%`,
              borderRadius: '4px 4px 0 0',
              bgcolor: 'var(--clr-skeleton-base)',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
