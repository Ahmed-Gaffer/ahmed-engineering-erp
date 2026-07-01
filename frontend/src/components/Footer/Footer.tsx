import { Box, Typography, Divider } from '@mui/material';
import { Engineering } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        px: { xs: 2, md: 4 },
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Divider sx={{ mb: 2, opacity: 0.4 }} />
    </Box>
  );
}
