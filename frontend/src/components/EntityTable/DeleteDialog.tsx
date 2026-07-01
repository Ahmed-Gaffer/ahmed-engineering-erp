import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Icon from '../SvgIcon/SvgIcon';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
}

export default function DeleteDialog({ open, onClose, onConfirm, loading = false, title = 'Confirm Delete', message }: DeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(239,68,68,0.1)' }}>
            <Icon name="trash" size={18} />
          </Box>
          <Typography fontWeight={700}>{title}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Typography variant="body2" sx={{ color: 'var(--clr-text-secondary)' }}>
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" size="small">Cancel</Button>
        <LoadingButton onClick={onConfirm} loading={loading} variant="contained" color="error" size="small">Delete</LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
