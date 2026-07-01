import { Card, CardContent, Typography, Stack, Box, Chip, useTheme } from '@mui/material';
import { ReactNode } from 'react';

const chipBgMap: Record<string, string> = {
  primary: 'rgba(15,23,42,0.1)',
  secondary: 'rgba(6,182,212,0.1)',
  success: 'rgba(16,185,129,0.1)',
  warning: 'rgba(245,158,11,0.1)',
  error: 'rgba(239,68,68,0.1)',
  info: 'rgba(59,130,246,0.1)',
};

const gold = '#d4a030';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  trend?: number;
  onClick?: () => void;
}

export default function StatsCard({ title, value, icon, color = 'primary', trend, onClick }: StatsCardProps) {
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
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 28px rgba(10,15,30,0.08)',
        },
        '&:active': onClick ? { transform: 'translateY(-1px) scale(0.99)' } : undefined,
        backgroundColor: 'background.paper',
      }}
    >
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          bgcolor: gold, boxShadow: `0 0 12px ${gold}60`,
        }} />

      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.06em">
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
            width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            color: `${color}.main`,
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
