import { useRef, useEffect, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
  Box, Stack, Divider, Typography, Fade, useMediaQuery, useTheme,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useFormDialog, formDefaults } from '../../lib/form-utils';

interface FormFieldConfig {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
}

interface FormFieldProps {
  field: FormFieldConfig;
  control: any;
  errors: any;
}

function FormField({ field, control, errors }: FormFieldProps) {
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: rf }) => {
        if (field.options?.length > 0) {
          return (
            <TextField
              {...rf}
              select
              label={field.label || field.name}
              size="small" fullWidth
              required={field.required}
              error={!!errors[field.name]}
              helperText={errors[field.name]?.message}
              value={rf.value ?? ''}
              onChange={(e) => rf.onChange(e.target.value)}
            >
              <MenuItem value=""><em>— Select —</em></MenuItem>
              {field.options.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
          );
        }
        return (
          <TextField
            {...rf}
            label={field.label || field.name}
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            size="small" fullWidth
            required={field.required}
            error={!!errors[field.name]}
            helperText={errors[field.name]?.message}
            multiline={field.type === 'textarea' || (field.rows ?? 0) > 0}
            minRows={field.rows || (field.type === 'textarea' ? 3 : undefined)}
            value={rf.value ?? ''}
            onChange={(e) => rf.onChange(field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
            slotProps={field.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
          />
        );
      }}
    />
  );
}

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
  fields: FormFieldConfig[];
  initialValues?: any;
  title: string;
  loading?: boolean;
  icon?: ReactElement | null;
  accentColor?: string;
}

export default function FormDialog({
  open, onClose, onSubmit, fields, initialValues, title, loading, icon = null, accentColor = '#D97706',
}: FormDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { form, handleSubmit } = useFormDialog(fields, initialValues, onSubmit);
  const { control, handleSubmit: rhfSubmit, formState: { errors }, reset } = form;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) reset(formDefaults(fields, initialValues));
  }, [open, initialValues, reset, fields]);

  const onSubmitForm = handleSubmit;

  const requiredFields = fields.filter(f => f.required);
  const optionalFields = fields.filter(f => !f.required);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}
      TransitionComponent={Fade}
      transitionDuration={250}
    >
      <form ref={formRef} onSubmit={rhfSubmit(onSubmitForm)}>
        <DialogTitle sx={{ pb: 0, borderTop: '3px solid', borderColor: accentColor, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {icon && icon}
            <Box>
              <Typography variant="h6" fontWeight={700}>{title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {initialValues ? t('editDescription') : t('createDescription')}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {requiredFields.length > 0 && (
            <Box mb={2.5}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em" mb={1.5} display="block">
                {t('requiredInfo')}
              </Typography>
              <Stack spacing={2}>
                {requiredFields.map((f) => (
                  <FormField key={f.name} field={f} control={control} errors={errors} />
                ))}
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
                {optionalFields.map((f) => (
                  <FormField key={f.name} field={f} control={control} errors={errors} />
                ))}
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
