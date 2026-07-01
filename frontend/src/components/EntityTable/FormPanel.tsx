import { useEffect } from 'react';
import { Drawer, Box, Typography, Stack, TextField, MenuItem, Button, Divider, IconButton } from '@mui/material';
import { Controller } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import Icon from '../SvgIcon/SvgIcon';
import { useFormDialog, formDefaults } from '../../lib/form-utils';

interface FormFieldConfig {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
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
            multiline={field.type === 'textarea'}
            minRows={field.type === 'textarea' ? 3 : undefined}
            value={rf.value ?? ''}
            onChange={(e) => rf.onChange(field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
            slotProps={field.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
          />
        );
      }}
    />
  );
}

interface FormPanelProps {
  open: boolean;
  onClose: () => void;
  fields?: FormFieldConfig[];
  onSubmit: (data: any) => Promise<void> | void;
  initialValues?: any;
  title: string;
  loading?: boolean;
}

export default function FormPanel({ open, onClose, fields = [], onSubmit, initialValues = {}, title, loading = false }: FormPanelProps) {
  const { form, handleSubmit } = useFormDialog(fields, initialValues, onSubmit);
  const { control, handleSubmit: rhfSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    if (open) reset(formDefaults(fields, initialValues));
  }, [open, initialValues, reset, fields]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: 480, maxWidth: '100vw' } }}
    >
      <form onSubmit={rhfSubmit(handleSubmit)} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Icon name="document" size={20} />
          <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>{title}</Typography>
          <IconButton size="small" onClick={onClose}><Icon name="close" size={16} /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          <Stack spacing={2}>
            {fields.map((f) => (
              <FormField key={f.name} field={f} control={control} errors={errors} />
            ))}
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ p: 2.5, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="outlined" size="small">Cancel</Button>
          <LoadingButton type="submit" variant="contained" loading={loading} size="small">Save</LoadingButton>
        </Box>
      </form>
    </Drawer>
  );
}
