import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Stack,
  Tabs, Tab, IconButton, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import { Engineering, DarkMode, LightMode, Construction, AccountTree } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { auth as authApi } from '../../services/api';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const isDark = mode === 'dark';
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const form = new FormData(e.target);
      if (tab === 1) {
        const pass = form.get('password');
        const confirm = form.get('confirmPassword');
        if (pass !== confirm) {
          setError(t('passwordsDoNotMatch'));
          setLoading(false);
          return;
        }
        await authApi.register({
          username: form.get('username'),
          email: form.get('email'),
          password: pass,
        });
      }
      await login(form.get('username'), form.get('password'));
      navigate('/engineering/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || t('operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_, v) => {
    setTab(v);
    setError('');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isMobile && (
        <Box sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', p: 6,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', inset: 0,
            opacity: 0.05,
            background: 'radial-gradient(circle at 30% 40%, #6366f1 0%, transparent 60%), radial-gradient(circle at 70% 60%, #06b6d4 0%, transparent 50%)',
          }} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
          >
            <Stack
              direction={i18n.language === 'ar' ? 'row-reverse' : 'row'}
              spacing={-1} justifyContent="center" mb={2}
            >
              <Engineering sx={{ fontSize: 56, color: '#818cf8' }} />
              <Construction sx={{ fontSize: 44, color: '#34d399', mt: 2, ml: -1 }} />
              <AccountTree sx={{ fontSize: 48, color: '#22d3ee', mt: 1 }} />
            </Stack>
            <Typography variant="h3" fontWeight={800} color="white" letterSpacing="-0.03em" mb={1}>
              {t('app')}
            </Typography>
            <Typography variant="h6" color="rgba(255,255,255,0.6)" fontWeight={400}>
              {t('appSubtitle')}
            </Typography>
          </motion.div>
        </Box>
      )}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: { xs: 2, md: 6 }, position: 'relative',
        bgcolor: 'background.default',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <Card sx={{
            maxWidth: 420, width: '100%', position: 'relative', overflow: 'visible',
            '&::before': {
              content: '""', position: 'absolute', top: 0, insetInline: 0, height: 4,
              background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)',
              borderRadius: '14px 14px 0 0',
            },
          }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {isMobile && (
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2} justifyContent="center">
                  <Engineering sx={{ fontSize: 32, color: '#818cf8' }} />
                  <Typography variant="h6" fontWeight={700}>{t('app')}</Typography>
                </Stack>
              )}
              <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
                <Tab label={t('login')} />
                <Tab label={t('register')} />
              </Tabs>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
              )}
              <form onSubmit={handleSubmit}>
                <TextField
                  name="username" label={t('username')} fullWidth required
                  size="small" autoComplete="username" autoFocus
                  sx={{ mb: 2.5 }}
                />
                {tab === 1 && (
                  <TextField
                    name="email" label={t('email')} type="email" fullWidth required
                    size="small" autoComplete="email"
                    sx={{ mb: 2.5 }}
                  />
                )}
                <TextField
                  name="password" label={t('password')} type="password"
                  fullWidth required size="small"
                  autoComplete={tab === 1 ? 'new-password' : 'current-password'}
                  sx={{ mb: tab === 1 ? 2.5 : 3.5 }}
                />
                {tab === 1 && (
                  <TextField
                    name="confirmPassword" label={t('confirmPassword')} type="password"
                    fullWidth required size="small" autoComplete="new-password"
                    sx={{ mb: 3.5 }}
                  />
                )}
                <Button
                  type="submit" variant="contained" fullWidth size="large"
                  disabled={loading} disableElevation
                >
                  {loading ? t('loading') : (tab === 1 ? t('register') : t('login'))}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        <Tooltip title={isDark ? t('lightMode') : t('darkMode')}>
          <IconButton
            onClick={toggleMode}
            sx={{
              position: 'absolute', top: 16, [i18n.language === 'ar' ? 'left' : 'right']: 16,
              color: 'text.secondary',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
            }}
          >
            {isDark ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
