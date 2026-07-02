import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Card, Typography, Stack, Chip, Button, Divider, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, alpha,
} from '@mui/material';
import { ArrowBack, Edit, Business } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AxiosResponse } from 'axios';
import { useEntity } from './useEntity';
import { useQuery } from '@tanstack/react-query';

export interface SubItemConfig {
  titleKey: string;
  fetchFn: (parentId: number | string) => Promise<AxiosResponse>;
  columns: { field: string; labelKey: string; type?: 'text' | 'number' | 'date' }[];
  linkTo?: (item: Record<string, unknown>) => string;
}

export interface FieldDef {
  key: string;
  labelKey: string;
  type?: 'text' | 'number' | 'date' | 'status' | 'chip';
}

interface EntityDetailProps {
  titleKey: string;
  backPath: string;
  fetchById: (id: number | string) => Promise<AxiosResponse>;
  fields?: FieldDef[];
  subItems?: SubItemConfig[];
  icon?: ReactNode;
  accentColor?: string;
}

function renderValue(value: unknown, field: FieldDef | undefined, accentColor: string) {
  if (value == null || value === '') return <Typography variant="body2" color="text.disabled">—</Typography>;
  if (field?.type === 'date' && typeof value === 'string') {
    return <Typography variant="body2">{new Date(value).toLocaleDateString()}</Typography>;
  }
  if (field?.type === 'number' && typeof value === 'number') {
    return <Typography variant="body2" fontWeight={700}>{value.toLocaleString()}</Typography>;
  }
  if (field?.type === 'status' || field?.type === 'chip') {
    const strVal = String(value).toLowerCase();
    const chipColors: Record<string, string> = {
      open: '#ef4444', closed: '#10b981', approved: '#10b981', rejected: '#ef4444',
      pending: '#f59e0b', in_progress: '#3b82f6', completed: '#10b981',
      submitted: '#3b82f6', verified: '#10b981', failed: '#ef4444',
    };
    const c = chipColors[strVal] || accentColor;
    return (
      <Chip
        label={String(value)}
        size="small"
        sx={{ backgroundColor: alpha(c, 0.12), color: c, border: `1px solid ${alpha(c, 0.25)}`, fontWeight: 500 }}
      />
    );
  }
  return <Typography variant="body2">{String(value)}</Typography>;
}

function SubItemSection({
  config, parentId, accentColor,
}: {
  config: SubItemConfig; parentId: string; accentColor: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: items = [], isLoading, error } = useQuery<Record<string, unknown>[], Error>({
    queryKey: ['entity-subitems', parentId, config.titleKey],
    queryFn: async () => {
      const res = await config.fetchFn(parentId);
      const raw = Array.isArray(res.data) ? res.data : (res.data as Record<string, unknown>).items;
      if (!Array.isArray(raw)) return [];
      return raw as Record<string, unknown>[];
    },
    enabled: !!parentId,
  });

  if (error) return null;

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ height: 3, bgcolor: accentColor, borderRadius: '12px 12px 0 0' }} />
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={600}>{t(config.titleKey)}</Typography>
      </Box>
      {isLoading ? (
        <Box textAlign="center" py={4}><CircularProgress size={28} sx={{ color: accentColor }} /></Box>
      ) : items.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">{t('noData')}</Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ '& th': { fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2.5 }}>#</TableCell>
                {config.columns.map((col) => (
                  <TableCell key={col.field}>{t(col.labelKey)}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, i) => (
                <TableRow
                  key={(item.id as string | number) || i}
                  hover
                  sx={{ cursor: config.linkTo ? 'pointer' : 'default' }}
                  onClick={() => { if (config.linkTo) navigate(config.linkTo(item)); }}
                >
                  <TableCell sx={{ pl: 2.5, color: 'text.secondary' }}>{i + 1}</TableCell>
                  {config.columns.map((col) => {
                    const v = item[col.field];
                    return (
                      <TableCell key={col.field}>
                        {col.type === 'date' && typeof v === 'string'
                          ? new Date(v).toLocaleDateString()
                          : col.type === 'number' && typeof v === 'number'
                            ? v.toLocaleString()
                            : (v ?? '—')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Card>
  );
}

export default function EntityDetail({
  titleKey, backPath, fetchById, fields, subItems, icon, accentColor = '#D97706',
}: EntityDetailProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError } = useEntity<Record<string, unknown>>(fetchById, id);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <CircularProgress size={44} sx={{ color: accentColor }} />
        <Typography variant="body2" color="text.secondary" mt={2}>{t('loading')}</Typography>
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box textAlign="center" py={10}>
        <Business sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="h6" color="text.secondary">{t('noData')}</Typography>
        <Button variant="outlined" onClick={() => navigate(backPath)} sx={{ mt: 2 }}>
          {t('back')}
        </Button>
      </Box>
    );
  }

  const skipKeys = new Set(['id', 'created_at', 'updated_at', 'deleted_at']);
  const autoFields = fields || Object.keys(data)
    .filter((k) => !skipKeys.has(k))
    .map((k): FieldDef => ({ key: k, labelKey: k }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate(backPath)}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          >
            {t('back')}
          </Button>
          <Box flex={1} />
          <Button
            variant="outlined"
            startIcon={<Edit />}
            size="small"
            onClick={() => navigate(backPath)}
            sx={{ borderRadius: 2 }}
          >
            {t('edit')}
          </Button>
        </Stack>

        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'visible' }}>
          <Box sx={{ height: 4, bgcolor: accentColor, borderRadius: '12px 12px 0 0' }} />
          <Box sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              {icon || <Business sx={{ color: accentColor }} />}
              <Typography variant="h6" fontWeight={700}>{t(titleKey)} #{String(data.id ?? '')}</Typography>
            </Stack>
            <Divider sx={{ mb: 2.5 }} />
            <Stack spacing={2}>
              {autoFields.map((field) => {
                const value = data[field.key];
                if (value == null || value === '' || value === false) return null;
                return (
                  <Stack key={field.key} direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, fontWeight: 500 }}>
                      {t(field.labelKey)}:
                    </Typography>
                    <Box flex={1}>{renderValue(value, field, accentColor)}</Box>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </Card>

        {subItems?.map((sub) => (
          <SubItemSection key={sub.titleKey} config={sub} parentId={id!} accentColor={accentColor} />
        ))}
      </Stack>
    </motion.div>
  );
}
