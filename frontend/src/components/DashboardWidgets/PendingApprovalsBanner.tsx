import { Box, Card, CardContent, Typography, Stack, Chip, Button } from '@mui/material';
import Icon from '../SvgIcon/SvgIcon';

interface WarningItem {
  id: number | string;
  entity_type: string;
  entity_id: string | number;
}

interface PendingApprovalsBannerProps {
  warnings?: WarningItem[];
  onNavigate?: (route: string) => void;
}

const entityRoutes: Record<string, string> = {
  ipc: '/engineering/ipc',
  variation_orders: '/engineering/variation-orders',
  ncr: '/engineering/ncr',
  mar: '/engineering/mar',
};

export default function PendingApprovalsBanner({ warnings = [], onNavigate }: PendingApprovalsBannerProps) {
  if (warnings.length === 0) return null;
  return (
    <Card sx={{
      mb: 3,
      border: '1px solid rgba(245,158,11,0.3)',
      bgcolor: 'rgba(245,158,11,0.04)',
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: 'rgba(245,158,11,0.5)' },
    }}>
      <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" gap={1}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(245,158,11,0.15)', color: 'var(--clr-amber-500)' }}>
            <Icon name="alert" size={18} />
          </Box>
          <Typography variant="body2" fontWeight={600}>
            {warnings.length} pending approval{warnings.length > 1 ? 's' : ''}
          </Typography>
          {warnings.slice(0, 3).map((w) => (
            <Chip
              key={w.id}
              label={`${w.entity_type} #${w.entity_id}`}
              size="small" variant="outlined" color="warning"
              onClick={() => {
                const route = entityRoutes[w.entity_type];
                if (route && onNavigate) onNavigate(route);
              }}
            />
          ))}
          <Button size="small" variant="text" sx={{ ml: 'auto', color: '#d4a030', fontWeight: 600 }} onClick={() => onNavigate && onNavigate('/engineering/notifications')}>
            View All
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
