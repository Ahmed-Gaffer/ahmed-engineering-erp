import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Stack,
  Tabs, Tab, IconButton, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import { Engineering, DarkMode, LightMode, Construction, AccountTree, Key, Person } from '@mui/icons-material';
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
          <Box sx={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
            top: '10%', left: '5%',
            '@keyframes float1': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(40px, -30px) scale(1.1)' },
            },
            animation: 'float1 8s ease-in-out infinite',
          }} />
          <Box sx={{
            position: 'absolute', width: 250, height: 250, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
            bottom: '15%', right: '5%',
            '@keyframes float2': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-30px, 20px) scale(1.15)' },
            },
            animation: 'float2 10s ease-in-out infinite',
          }} />
          <Box sx={{
            position: 'absolute', width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)',
            top: '50%', left: '60%',
            '@keyframes float3': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(20px, -40px) scale(1.05)' },
            },
            animation: 'float3 7s ease-in-out infinite',
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
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Engineering sx={{ fontSize: 56, color: '#818cf8' }} />
              </motion.div>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              >
                <Construction sx={{ fontSize: 44, color: '#34d399', mt: 2, ml: -1 }} />
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              >
                <AccountTree sx={{ fontSize: 48, color: '#22d3ee', mt: 1 }} />
              </motion.div>
            </Stack>
            <Typography variant="h3" fontWeight={800} color="white" letterSpacing="-0.03em" mb={1}>
              {t('app')}
            </Typography>
            <Typography variant="h6" color="rgba(255,255,255,0.85)" fontWeight={500}>
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
        <Box sx={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          opacity: isDark ? 0.04 : 0.06,
          backgroundImage: `radial-gradient(circle, ${isDark ? '#818cf8' : '#6366f1'} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <Card sx={{
            maxWidth: 420, width: '100%', position: 'relative', overflow: 'visible',
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
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
              <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{
                mb: 3,
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                },
                '& .Mui-selected': {
                  color: isDark ? '#a5b4fc' : '#6366f1',
                },
              }}>
                <Tab icon={<Key />} iconPosition="start" label={t('login')} />
                <Tab icon={<Person />} iconPosition="start" label={t('register')} />
              </Tabs>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
              )}
              <form onSubmit={handleSubmit}>
                <TextField
                  name="username" label={t('username')} fullWidth required
                  size="small" autoComplete="username" autoFocus
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                        borderColor: '#6366f1',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6366f1',
                    },
                  }}
                />
                {tab === 1 && (
                  <TextField
                    name="email" label={t('email')} type="email" fullWidth required
                    size="small" autoComplete="email"
                    sx={{
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderWidth: 2,
                          borderColor: '#6366f1',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#6366f1',
                      },
                    }}
                  />
                )}
                <TextField
                  name="password" label={t('password')} type="password"
                  fullWidth required size="small"
                  autoComplete={tab === 1 ? 'new-password' : 'current-password'}
                  sx={{
                    mb: tab === 1 ? 2.5 : 3.5,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                        borderColor: '#6366f1',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6366f1',
                    },
                  }}
                />
                {tab === 1 && (
                  <TextField
                    name="confirmPassword" label={t('confirmPassword')} type="password"
                    fullWidth required size="small" autoComplete="new-password"
                    sx={{
                      mb: 3.5,
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderWidth: 2,
                          borderColor: '#6366f1',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#6366f1',
                      },
                    }}
                  />
                )}
                <Button
                  type="submit" variant="contained" fullWidth size="large"
                  disabled={loading} disableElevation
                  sx={{
                    position: 'relative', overflow: 'hidden',
                    '@keyframes shimmer': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' },
                    },
                    ...(loading && {
                      '&::after': {
                        content: '""', position: 'absolute', inset: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                        animation: 'shimmer 1.5s infinite',
                      },
                    }),
                  }}
                >
                  {loading ? t('loading') : (tab === 1 ? t('register') : t('login'))}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        <Stack direction="row" alignItems="center" spacing={1} sx={{
          position: 'absolute', top: 16, [i18n.language === 'ar' ? 'left' : 'right']: 16,
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Theme
          </Typography>
          <Tooltip title={isDark ? t('lightMode') : t('darkMode')}>
            <IconButton
              onClick={toggleMode}
              sx={{
                color: 'text.secondary',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
              }}
            >
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
}
