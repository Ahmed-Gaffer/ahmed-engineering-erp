import { Box } from '@mui/material';

interface DataGridSkeletonProps {
  rows?: number;
}

export default function DataGridSkeleton({ rows = 6 }: DataGridSkeletonProps) {
  const colWidths = [40, 30, 20, 10];
  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box className="ems-animate-shimmer" sx={{ width: 280, height: 36, borderRadius: 1, bgcolor: 'var(--clr-skeleton-base)' }} />
        <Box className="ems-animate-shimmer" sx={{ width: 100, height: 36, borderRadius: 1, bgcolor: 'var(--clr-skeleton-base)', ml: 'auto' }} />
      </Box>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'action.hover' }}>
          {colWidths.map((w, i) => (
            <Box key={i} className="ems-animate-shimmer" sx={{ width: `${w}%`, height: 16, borderRadius: 1, bgcolor: 'var(--clr-skeleton-base)' }} />
          ))}
        </Box>
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {colWidths.map((w, j) => (
              <Box key={j} className="ems-animate-shimmer" sx={{ width: `${w}%`, height: 14, borderRadius: 1, bgcolor: 'var(--clr-skeleton-base)' }} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
