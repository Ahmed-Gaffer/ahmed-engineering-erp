import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
  Box, Stack, Divider, Typography, Fade, useMediaQuery, useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack';

export default function FormDialog({
  open, onClose, onSubmit, fields, initialValues, title, loading,
}) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [errors, setErrors] = useState({});

  useEffect(() => { if (open) setErrors({}); }, [open]);

  const validate = (data) => {
    const newErrors = {};
    fields.forEach((f) => {
      if (f.required && (data[f.name] === '' || data[f.name] == null)) {
        newErrors[f.name] = t('fieldRequired');
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {};
    fields.forEach((f) => {
      const val = form.get(f.name);
      data[f.name] = f.type === 'number' ? (val === '' ? null : Number(val)) :
                     f.type === 'date' ? (val || null) : val;
    });
    if (!validate(data)) return;
    try {
      await onSubmit(data);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    }
  };

  const requiredFields = fields.filter(f => f.required);
  const optionalFields = fields.filter(f => !f.required);

  const renderField = (f) => {
    const val = initialValues?.[f.name] ?? '';
    const isSelect = f.options?.length > 0;
    return (
      <TextField
        key={f.name}
        name={f.name}
        label={t(f.label || f.name)}
        type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
        defaultValue={val}
        select={isSelect}
        required={f.required}
        size="small"
        fullWidth
        multiline={f.type === 'textarea' || f.rows > 0}
        minRows={f.rows || (f.type === 'textarea' ? 3 : undefined)}
        error={Boolean(errors[f.name])}
        helperText={errors[f.name]}
        slotProps={f.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
      >
        {isSelect && f.options.map((o) => (
          <MenuItem key={o.value} value={o.value}>{t(o.label) || o.label}</MenuItem>
        ))}
      </TextField>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}
      TransitionComponent={Fade}
      transitionDuration={250}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {initialValues ? t('editDescription') : t('createDescription')}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2.5 }}>
          {requiredFields.length > 0 && (
            <Box mb={2.5}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em" mb={1.5} display="block">
                {t('requiredInfo')}
              </Typography>
              <Stack spacing={2}>
                {requiredFields.map(renderField)}
              </Stack>
            </Box>
          )}
          {requiredFields.length > 0 && optionalFields.length > 0 && <Divider sx={{ mb: 2.5 }} />}
          {optionalFields.length > 0 && (
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em" mb={1.5} display="block">
                {t('optionalInfo')}
              </Typography>
              <Stack spacing={2}>
                {optionalFields.map(renderField)}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose} size="small">{t('cancel')}</Button>
          <Button type="submit" variant="contained" disabled={loading} size="small" disableElevation>
            {loading ? t('loading') : t('save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
