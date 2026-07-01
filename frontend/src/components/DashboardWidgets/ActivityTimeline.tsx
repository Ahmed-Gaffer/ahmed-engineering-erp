import { Box, Typography, Stack, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../SvgIcon/SvgIcon';

interface Activity {
  id: number | string;
  action: string;
  entity_type?: string;
  description?: string;
  created_at?: string;
}

interface ActivityTimelineProps {
  activities?: Activity[];
  loading?: boolean;
}

const timelineIcon = (action: string) => {
  switch (action) {
    case 'create': return 'plus';
    case 'update': return 'edit';
    case 'delete': return 'trash';
    default: return 'bell';
  }
};

const timelineColor = (action: string) => {
  switch (action) {
    case 'create': return 'var(--clr-green-500)';
    case 'update': return 'var(--clr-gold-500)';
    case 'delete': return 'var(--clr-red-500)';
    default: return 'var(--clr-amber-500)';
  }
};

export default function ActivityTimeline({ activities = [], loading = false }: ActivityTimelineProps) {
  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'var(--clr-text-secondary)' }}>Loading...</Typography>
      </Box>
    );
  }
  if (activities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Icon name="bell" size={36} />
        <Typography variant="caption" sx={{ color: 'var(--clr-text-secondary)', display: 'block', mt: 1 }}>
          No recent activity
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ position: 'relative', ml: 0.5 }}>
      <Box sx={{ position: 'absolute', left: 13.5, top: 14, bottom: 14, width: 1.5, bgcolor: 'var(--clr-border)', borderRadius: 1 }} />
      <AnimatePresence>
        {activities.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Stack direction="row" spacing={1.5} sx={{ py: 1, px: 0.5, borderBottom: '1px solid var(--clr-border)', '&:last-child': { borderBottom: 0 } }}>
              <Avatar
                sx={{
                  width: 28, height: 28,
                  bgcolor: `${timelineColor(a.action)}15`,
                  color: timelineColor(a.action),
                  fontSize: '0.75rem', fontWeight: 700,
                  border: '2px solid',
                  borderColor: `${timelineColor(a.action)}33`,
                  position: 'relative', zIndex: 1,
                }}
              >
                {a.action?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={500} noWrap sx={{ fontSize: '0.8rem' }}>
                  <Box component="span" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {a.action}
                  </Box>
                  {a.entity_type ? ` ${a.entity_type}` : ''}
                </Typography>
                {a.description && (
                  <Typography variant="caption" sx={{ color: 'var(--clr-text-secondary)', fontSize: '0.7rem' }} noWrap>
                    {a.description}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                  {a.created_at ? new Date(a.created_at).toLocaleString() : ''}
                </Typography>
              </Box>
            </Stack>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}
