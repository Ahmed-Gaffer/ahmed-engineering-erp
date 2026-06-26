import { Box, Skeleton } from '@mui/material';

export default function DataGridSkeleton({ rows = 8 }) {
  return (
    <Box sx={{ px: 2.5, py: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Skeleton variant="rounded" width={280} height={36} />
        <Skeleton variant="rounded" width={100} height={36} sx={{ ml: 'auto' }} />
      </Box>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'action.hover' }}>
          {[40, 30, 20, 15, 15].map((w, i) => (
            <Skeleton key={i} variant="rounded" width={`${w}%`} height={16} />
          ))}
        </Box>
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {[40, 30, 20, 15, 15].map((w, j) => (
              <Skeleton key={j} variant="rounded" width={`${w}%`} height={14} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
