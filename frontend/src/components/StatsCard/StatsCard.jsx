import { Card, CardContent, Typography, Stack, Box, Chip, useTheme } from '@mui/material';

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

export default function StatsCard({ title, value, icon, color = 'primary', trend, onClick }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chipColor = trend >= 0 ? 'success' : 'error';
  const chipIcon = trend >= 0 ? '\u2191' : '\u2193';

  return (
    <Card
      onClick={onClick}
      sx={{
        minWidth: 200, position: 'relative', overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDark
            ? '0 20px 25px rgba(0,0,0,0.5), 0 10px 10px rgba(0,0,0,0.35)'
            : '0 24px 28px rgba(0,0,0,0.06), 0 12px 12px rgba(0,0,0,0.03)',
        },
        '&:active': onClick ? { transform: 'translateY(-2px) scale(0.99)' } : undefined,
        backgroundColor: isDark ? 'rgba(30,30,40,0.95)' : undefined,
        backdropFilter: onClick ? 'blur(0px)' : undefined,
      }}
    >
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: gradientMap[color],
        opacity: isDark ? 1 : 0.85,
      }} />
      <Box sx={{
        position: 'absolute', top: -12, insetInlineEnd: -12, width: 80, height: 80,
        borderRadius: '50%', opacity: 0.08, background: gradientMap[color],
      }} />
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.08em">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} mt={0.5} letterSpacing="-0.03em" fontSize="1.75rem">
              {value}
            </Typography>
            {trend != null && (
              <Chip
                icon={<Box component="span" sx={{ fontWeight: 700, ml: 0.5 }}>{chipIcon}</Box>}
                label={`${Math.abs(trend)}%`}
                size="small"
                sx={{
                  mt: 0.5, height: 24, fontWeight: 600, fontSize: '0.75rem',
                  backgroundColor: chipBgMap[chipColor],
                  color: `${chipColor}.main`,
                  '& .MuiChip-icon': { fontSize: 14, mr: -0.5, ml: 0.5, color: 'inherit' },
                }}
              />
            )}
          </Box>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
            background: isDark
              ? `linear-gradient(135deg, ${color === 'primary' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)'}, ${color === 'primary' ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.03)'})`
              : `linear-gradient(135deg, ${chipBgMap[color]}, rgba(255,255,255,0.5))`,
            backdropFilter: 'blur(8px)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.8)',
            color: `${color}.main`,
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            '&:hover': { transform: 'scale(1.01)' },
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
