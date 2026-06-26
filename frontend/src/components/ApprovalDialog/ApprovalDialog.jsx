import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Typography, Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function ApprovalDialog({
  open, onClose, onConfirm, title, entityLabel, currentStatus, actionLabel, loading,
}) {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleConfirm = async () => {
    await onConfirm(comment.trim() || null, assignedTo.trim() || null);
    setComment('');
    setAssignedTo('');
  };

  const handleClose = () => {
    setComment('');
    setAssignedTo('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">{entityLabel}</Typography>
          <Chip label={currentStatus} size="small" />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <Stack spacing={2}>
          <TextField
            label={actionLabel ? `Comment (${actionLabel})` : t('comment')}
            multiline rows={3}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment..."
            size="small"
          />
          <TextField
            label="Assign to"
            fullWidth
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Name of reviewer (optional)"
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={handleClose} size="small" disabled={loading}>{t('cancel')}</Button>
        <Button onClick={handleConfirm} variant="contained" size="small" disableElevation disabled={loading}>
          {loading ? t('loading') : actionLabel || t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
