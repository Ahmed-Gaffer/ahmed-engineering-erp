import { describe, it, expect } from 'vitest';
import { buildSchema, formDefaults } from '../lib/form-utils';

describe('form-utils', () => {
  const fields = [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description' },
    { name: 'count', label: 'Count', type: 'number' },
    { name: 'active', label: 'Active', type: 'boolean' },
  ];

  it('buildSchema creates a valid zod schema with required strings', () => {
    const schema = buildSchema(fields);
    expect(schema).toBeDefined();
    const result = schema.safeParse({ title: 'Test' });
    expect(result.success).toBe(true);
  });

  it('buildSchema rejects missing required fields', () => {
    const schema = buildSchema(fields);
    const result = schema.safeParse({ description: 'no title' });
    expect(result.success).toBe(false);
  });

  it('formDefaults generates default values', () => {
    const defaults = formDefaults(fields);
    expect(defaults).toEqual({ title: '', description: '', count: null, active: '' });
  });

  it('formDefaults handles initial values', () => {
    const defaults = formDefaults(fields, { title: 'Initial', count: 10 });
    expect(defaults).toEqual({ title: 'Initial', description: '', count: 10, active: '' });
  });
});
