import { Box, Typography, Button } from '@mui/material';
import { Inbox } from '@mui/icons-material';

export default function EmptyState({ title, description, action, onAction, actionLabel }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      py: 8, px: 4, color: 'text.secondary',
    }}>
      <Box sx={{ mb: 2, opacity: 0.3 }}>
        <Inbox sx={{ fontSize: 64 }} />
      </Box>
      <Typography variant="h6" fontWeight={600} mb={0.5}>{title}</Typography>
      <Typography variant="body2" mb={2.5} textAlign="center" maxWidth={400}>{description}</Typography>
      {action && onAction && (
        <Button variant="contained" size="small" onClick={onAction}>{actionLabel}</Button>
      )}
    </Box>
  );
}
