import { Box, Typography, Stack, Chip, IconButton, Tooltip, Button, useMediaQuery, useTheme } from '@mui/material';
import { Refresh, Download, Add } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function PageHeader({
  title,
  subtitle,
  action,
  actionLabel,
  onAction,
  onRefresh,
  onExport,
  stats,
  loading,
  icon,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {icon && (
              <Box sx={{
                width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center',
                justifyContent: 'center', bgcolor: 'rgba(15,23,42,0.1)', color: '#D97706',
              }}>
                {icon}
              </Box>
            )}
            <Box>
              <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em" lineHeight={1.2}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" mt={0.25}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={onRefresh} sx={{ color: 'text.secondary' }}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onExport && (
              <Tooltip title="Export">
                <IconButton size="small" onClick={onExport} sx={{ color: 'text.secondary' }}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {action && onAction && (
              <Button
                variant="contained" size={isMobile ? 'small' : 'medium'}
                startIcon={<Add />} onClick={onAction}
                disableElevation
              >
                {actionLabel}
              </Button>
            )}
          </Stack>
        </Stack>
        {stats && stats.length > 0 && (
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
            {stats.map((s, i) => (
              <Chip
                key={i}
                label={`${s.label}: ${s.value}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500, '& .MuiChip-label': { px: 1.5 } }}
              />
            ))}
          </Stack>
        )}
      </Box>
    </motion.div>
  );
}
