import { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Chip, Tooltip, CircularProgress, Button,
} from '@mui/material';
import {
  Send, CheckCircle, Close as CloseIcon, AttachMoney,
  History, Comment as CommentIcon, Person,
} from '@mui/icons-material';
import { workflowApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { motion } from 'framer-motion';

const ACTION_ICONS = {
  submit: <Send fontSize="small" />,
  approve: <CheckCircle fontSize="small" />,
  reject: <CloseIcon fontSize="small" />,
  pay: <AttachMoney fontSize="small" />,
  review: <History fontSize="small" />,
  comment: <CommentIcon fontSize="small" />,
};

const ACTION_COLORS = {
  submit: { bg: 'rgba(245,158,11,0.12)', icon: '#f59e0b', border: '#f59e0b44' },
  approve: { bg: 'rgba(16,185,129,0.12)', icon: '#10b981', border: '#10b98144' },
  reject: { bg: 'rgba(239,68,68,0.12)', icon: '#ef4444', border: '#ef444444' },
  pay: { bg: 'rgba(217,119,6,0.12)', icon: '#D97706', border: '#D9770644' },
  review: { bg: 'rgba(59,130,246,0.12)', icon: '#3b82f6', border: '#3b82f644' },
  comment: { bg: 'rgba(148,163,184,0.12)', icon: '#94a3b8', border: '#94a3b844' },
};

export default function WorkflowTimeline({ entityType, entityId, refreshTrigger }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityType || !entityId) return;
    setLoading(true);
    workflowApi.getLogs(entityType, entityId)
      .then(r => setLogs(r.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [entityType, entityId, refreshTrigger]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>;
  if (logs.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No workflow history</Typography>;

  return (
    <Box sx={{ position: 'relative', pl: 3 }}>
      {/* Vertical line */}
      <Box sx={{ position: 'absolute', left: 14, top: 8, bottom: 8, width: 2, bgcolor: 'divider' }} />

      {logs.map((log, idx) => {
        const colors = ACTION_COLORS[log.action] || ACTION_COLORS.comment;
        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Stack direction="row" spacing={2} sx={{ mb: 2.5, position: 'relative' }}>
              {/* Dot */}
              <Box sx={{ position: 'absolute', left: -19, top: 4, width: 10, height: 10, borderRadius: '50%', bgcolor: colors.icon, border: '2px solid', borderColor: colors.border, zIndex: 1 }} />

              {/* Card */}
              <Box sx={{ flex: 1, bgcolor: colors.bg, borderRadius: 1.5, border: `1px solid ${colors.border}`, px: 1.5, py: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ color: colors.icon, display: 'flex' }}>{ACTION_ICONS[log.action] || ACTION_ICONS.comment}</Box>
                    <Typography variant="body2" fontWeight={600} textTransform="capitalize">{log.action}</Typography>
                    {log.from_status && log.to_status && (
                      <Chip label={`${log.from_status} → ${log.to_status}`} size="small" sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(0,0,0,0.06)' }} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{formatDate(log.created_at)}</Typography>
                </Stack>

                {log.comment && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic', pl: 3 }}>
                    "{log.comment}"
                  </Typography>
                )}

                {log.actor_name && (
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <Person fontSize="inherit" sx={{ color: 'text.disabled', fontSize: 12 }} />
                    <Typography variant="caption" color="text.disabled">{log.actor_name}</Typography>
                    {log.assigned_to && (
                      <Typography variant="caption" color="text.disabled">→ Assigned to: {log.assigned_to}</Typography>
                    )}
                  </Stack>
                )}
              </Box>
            </Stack>
          </motion.div>
        );
      })}
    </Box>
  );
}
