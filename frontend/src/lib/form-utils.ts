import { useForm, type UseFormReturn, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface FormField {
  name: string;
  label?: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  rows?: number;
}

export function buildSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    let field: z.ZodTypeAny;
    if (f.type === 'number') {
      field = f.required ? z.number({ invalid_type_error: 'Required' }) : z.number().nullable().optional();
    } else if (f.type === 'date') {
      field = f.required ? z.string().min(1, 'Required') : z.string().optional();
    } else {
      field = f.required ? z.string().min(1, 'Required') : z.string().optional();
    }
    shape[f.name] = field;
  }
  return z.object(shape);
}

export function formDefaults(fields: FormField[], initialValues?: Record<string, unknown>) {
  const defaults: Record<string, unknown> = {};
  for (const f of fields) {
    if (initialValues && initialValues[f.name] !== undefined) {
      defaults[f.name] = initialValues[f.name];
    } else {
      defaults[f.name] = f.type === 'number' ? null : '';
    }
  }
  return defaults;
}

export function useFormDialog(
  fields: FormField[],
  initialValues?: Record<string, unknown>,
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>,
) {
  const schema = buildSchema(fields);
  const defaults = formDefaults(fields, initialValues);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults as FieldValues,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (onSubmit) await onSubmit(data as Record<string, unknown>);
  });

  return { form, handleSubmit, schema };
}
