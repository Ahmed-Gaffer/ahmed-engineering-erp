import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, CardContent, Chip, CircularProgress,
  List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider,
} from '@mui/material';
import {
  Search as SearchIcon, Business, Folder, Person, Engineering,
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { searchApi } from '../../services/api';

const entityMeta = {
  contractors: { icon: <Business />, color: '#6366f1', labelKey: 'contractors' },
  projects: { icon: <Folder />, color: '#10b981', labelKey: 'projects' },
  employees: { icon: <Person />, color: '#f59e0b', labelKey: 'employees' },
  drawings: { icon: <Engineering />, color: '#06b6d4', labelKey: 'drawings' },
  rfis: { icon: <Engineering />, color: '#8b5cf6', labelKey: 'rfis' },
  mar: { icon: <Engineering />, color: '#f97316', labelKey: 'mar' },
  ncr: { icon: <Engineering />, color: '#ef4444', labelKey: 'ncr' },
  contracts: { icon: <Engineering />, color: '#84cc16', labelKey: 'contractsPage' },
  variation_orders: { icon: <Engineering />, color: '#f43f5e', labelKey: 'variationOrders' },
  daily_reports: { icon: <Engineering />, color: '#f59e0b', labelKey: 'dailyReportsPage' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setDone(true); return; }
    const controller = new AbortController();
    setLoading(true);
    setDone(false);
    searchApi.search(query, controller.signal)
      .then(res => { if (!controller.signal.aborted) { setResults(res.data.results || []); setLoading(false); setDone(true); } })
      .catch(() => { if (!controller.signal.aborted) { setResults([]); setLoading(false); setDone(true); } });
    return () => controller.abort();
  }, [query]);

  const grouped = {};
  results.forEach(r => {
    if (!grouped[r.entity_type]) grouped[r.entity_type] = [];
    grouped[r.entity_type].push(r);
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <SearchIcon sx={{ color: 'text.secondary', fontSize: '1.5rem' }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>{t('searchResults')}</Typography>
            {query && (
              <Typography variant="body2" color="text.secondary">
                {t('resultsFor')} "<Typography component="span" fontWeight={600} color="text.primary">{query}</Typography>"
                {done && ` — ${results.length} ${t('results')}`}
              </Typography>
            )}
          </Box>
        </Stack>

        {loading && (
          <Box textAlign="center" py={8}>
            <CircularProgress size={40} sx={{ color: '#6366f1' }} />
            <Typography variant="body2" color="text.secondary" mt={2}>{t('searching')}</Typography>
          </Box>
        )}

        {done && results.length === 0 && (
          <motion.div variants={itemVariants}>
            <Card sx={{ borderRadius: 3, textAlign: 'center', py: 8, border: '1px solid', borderColor: 'divider' }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {query ? t('noResultsFound') : t('enterSearchQuery')}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {query ? t('tryDifferentSearch') : t('useSearchBarAbove')}
              </Typography>
            </Card>
          </motion.div>
        )}

        {done && results.length > 0 && Object.entries(grouped).map(([entityType, items]) => {
          const meta = entityMeta[entityType] || { icon: <Engineering />, color: '#6b7280', labelKey: entityType };
          return (
            <motion.div key={entityType} variants={itemVariants}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: meta.color, fontSize: '0.9rem' }}>
                    {meta.icon}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={600} flex={1}>{t(meta.labelKey)}</Typography>
                  <Chip label={`${items.length}`} size="small" sx={{ bgcolor: `${meta.color}18`, color: meta.color, fontWeight: 600 }} />
                </Stack>
                <List dense disablePadding>
                  {items.map((item, idx) => (
                    <Box key={item.id}>
                      {idx > 0 && <Divider component="li" sx={{ mx: 2 }} />}
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate(item.url)} sx={{ px: 2.5, py: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: `${meta.color}18`, color: meta.color, fontSize: '0.75rem', fontWeight: 700 }}>
                              {item.code?.charAt(0) || '#'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={item.label}
                            secondary={item.code}
                            primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <Chip label={item.code} size="small" variant="outlined" sx={{ fontSize: '0.7rem', opacity: 0.7 }} />
                        </ListItemButton>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Card>
            </motion.div>
          );
        })}
      </Stack>
    </motion.div>
  );
}
