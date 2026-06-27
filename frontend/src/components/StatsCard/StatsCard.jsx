import { Card, CardContent, Typography, Stack, Box, useTheme } from '@mui/material';

const gradientMap = {
  primary: 'linear-gradient(135deg, #6366f1, #818cf8)',
  secondary: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
  success: 'linear-gradient(135deg, #10b981, #34d399)',
  warning: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  error: 'linear-gradient(135deg, #ef4444, #f87171)',
  info: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
};

const chipBgMap = {
  primary: 'rgba(99,102,241,0.1)',
  secondary: 'rgba(6,182,212,0.1)',
  success: 'rgba(16,185,129,0.1)',
  warning: 'rgba(245,158,11,0.1)',
  error: 'rgba(239,68,68,0.1)',
  info: 'rgba(59,130,246,0.1)',
};

export default function StatsCard({ title, value, icon, color = 'primary', trend }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card sx={{
      minWidth: 200, position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: isDark
          ? '0 20px 25px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.3)'
          : '0 20px 25px rgba(0,0,0,0.04), 0 10px 10px rgba(0,0,0,0.02)',
      },
    }}>
      <Box sx={{
        position: 'absolute', top: -12, insetInlineEnd: -12, width: 80, height: 80,
        borderRadius: '50%', opacity: 0.08, background: gradientMap[color],
      }} />
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} textTransform="uppercase" letterSpacing="0.05em">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} mt={0.5} letterSpacing="-0.02em">
              {value}
            </Typography>
            {trend != null && (
              <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 42, height: 42, borderRadius: 2, display: 'flex', alignItems: 'center',
            justifyContent: 'center', backgroundColor: chipBgMap[color],
            color: `${color}.main`, flexShrink: 0,
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
