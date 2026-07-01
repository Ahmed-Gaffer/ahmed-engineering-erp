import { Box, Typography, Button } from '@mui/material';
import EmptyIllustration from '../EmptyIllustration/EmptyIllustration';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  icon?: ReactNode | null;
  accentColor?: string;
}

export default function EmptyState({ title, description, action, onAction, actionLabel, icon = null, accentColor = '#D97706' }: EmptyStateProps) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      py: 8, px: 4, color: 'text.secondary',
    }}>
      <Box sx={{ mb: 2.5, lineHeight: 0 }}>
        <EmptyIllustration size={180} accentColor={accentColor} />
      </Box>
      <Typography variant="h6" fontWeight={600} mb={0.5} textAlign="center">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" mb={3} textAlign="center" maxWidth={360}>
          {description}
        </Typography>
      )}
      {action && onAction && (
        <Button variant="contained" size="small" onClick={onAction} sx={{ fontWeight: 600, px: 3 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
