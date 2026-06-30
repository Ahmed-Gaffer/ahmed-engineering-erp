import { Box, Typography, Divider } from '@mui/material';
import { Engineering } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 1.5,
        px: { xs: 2, md: 3 },
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Divider sx={{ mb: 1.5, opacity: 0.4 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Engineering sx={{ fontSize: '0.75rem', color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', opacity: 0.6 }}>
            360 Engineering ERP — APEX Enterprise
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.6rem',
            color: 'text.secondary',
            opacity: 0.5,
            fontWeight: 300,
            letterSpacing: '0.02em',
          }}
        >
          Designed &amp; Engineered by Ahmed Gaffer — Principal System Architect
        </Typography>
      </Box>
    </Box>
  );
}
