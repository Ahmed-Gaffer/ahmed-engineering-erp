import { Box } from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export default function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <Box sx={{ px: 3, py: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, py: 1.5 }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Box
              key={j}
              className="ems-animate-shimmer"
              sx={{
                flex: j === 0 ? 1.5 : 1,
                height: 14,
                borderRadius: 1,
                bgcolor: 'var(--clr-skeleton-base)',
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}
