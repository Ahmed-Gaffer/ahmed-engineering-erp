import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Fade } from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionComponent={Fade} transitionDuration={200}>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Delete color="error" fontSize="small" />
        {title || t('confirm')}
      </DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Typography variant="body2" color="text.secondary">{children || t('confirmDelete')}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small">{t('cancel')}</Button>
        <Button onClick={onConfirm} variant="contained" color="error" size="small" disableElevation>
          {confirmLabel || t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
