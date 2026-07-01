import { Box, Card, CardContent, Typography, Stack } from '@mui/material';
import Icon from '../SvgIcon/SvgIcon';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
  subtitle?: string;
}

export default function KpiCard({ title, value, icon = 'chart', color = 'gold', subtitle }: KpiCardProps) {
  const colorMap: Record<string, string> = {
    gold: 'var(--clr-gold-500)',
    green: 'var(--clr-green-500)',
    amber: 'var(--clr-amber-500)',
    red: 'var(--clr-red-500)',
    blue: 'var(--clr-blue-500)',
  };
  const accent = colorMap[color] || colorMap.gold;
  return (
    <Card sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: `0 12px 28px rgba(10,15,30,0.1), 0 0 0 1px ${accent}20`,
      },
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: accent, boxShadow: `0 0 12px ${accent}60` }} />
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'var(--clr-text-secondary)', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} mt={0.25} sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, color: 'var(--clr-text)' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'var(--clr-text-secondary)', opacity: 0.8, fontSize: '0.7rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}>
            <Icon name={icon} size={20} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
