import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  Tabs, Tab, IconButton, Tooltip, useMediaQuery, useTheme,
  CircularProgress, Divider, Stack,
} from '@mui/material';
import {
  DarkMode, LightMode, Key, Person,
  AccountTree, AccountBalance, Description, Timeline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { auth as authApi } from '../../services/api';
import BrandLogo from '../../components/BrandLogo/BrandLogo';

const gold = '#d4a030';
const goldLight = '#e2b94c';
const navyDeep = '#070b14';

const capabilities = [
  { icon: <AccountTree />, text: 'Project Lifecycle Management', desc: 'From initiation to close-out' },
  { icon: <AccountBalance />, text: 'Budget & Cost Control', desc: 'Real-time financial oversight' },
  { icon: <Description />, text: 'Document Control & Workflow', desc: 'Automated approval routing' },
  { icon: <Timeline />, text: 'Progress & Performance Tracking', desc: 'EVM and KPI dashboards' },
];

const fieldFocusSx = {
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderWidth: 2,
      borderColor: gold,
    },
  },
};

export default function Login() {
  const { t, i18n } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const isDark = mode === 'dark';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const form = new FormData(e.currentTarget);
      if (tab === 1) {
        const pass = form.get('password') as string;
        const confirm = form.get('confirmPassword') as string;
        if (pass !== confirm) {
          setError(t('passwordsDoNotMatch'));
          setLoading(false);
          return;
        }
        await authApi.register({
          username: form.get('username') as string,
          email: form.get('email') as string,
          password: pass,
        });
      }
      await login(form.get('username') as string, form.get('password') as string);
      navigate('/engineering/dashboard');
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { detail?: string } } };
      setError(errorResponse.response?.data?.detail || t('operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    setTab(v);
    setError('');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isMobile && (
        <Box sx={{
          flex: 1.2, display: 'flex', flexDirection: 'column',
          background: `linear-gradient(160deg, ${navyDeep} 0%, #0f172a 50%, #141b2d 100%)`,
          p: 8, position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', top: '-20%', right: '-10%', width: 400, height: 400,
            borderRadius: '50%', background: `radial-gradient(circle, ${gold}15 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500,
            borderRadius: '50%', background: `radial-gradient(circle, ${gold}10 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <Box sx={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', maxWidth: 500,
            mx: 'auto', width: '100%', position: 'relative', zIndex: 1,
          }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <BrandLogo size={88} />
              <Typography variant="h3" fontWeight={800} color="white" letterSpacing="-0.03em" mb={0.5} mt={2}>
                360 Engineering
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.5)" fontWeight={400}>
                Premium Project Management Platform
              </Typography>
            </Box>
            <Stack spacing={1.5} sx={{ px: 2 }}>
              {capabilities.map((cap, i) => (
                <Box key={cap.text}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 1.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: `rgba(212,160,48,0.12)`, color: gold, flexShrink: 0,
                    }}>
                      {cap.icon}
                    </Box>
                    <Box>
                      <Typography color="white" fontWeight={600} fontSize="0.9rem">
                        {cap.text}
                      </Typography>
                      <Typography color="rgba(255,255,255,0.4)" fontSize="0.75rem">
                        {cap.desc}
                      </Typography>
                    </Box>
                  </Box>
                  {i < capabilities.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
          <Typography variant="caption" color="rgba(255,255,255,0.2)" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            &copy; 2026 360 Engineering ERP
          </Typography>
        </Box>
      )}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: { xs: 2, md: 6 }, position: 'relative',
        bgcolor: 'background.default',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <Card sx={{
            maxWidth: 420, width: '100%',
            bgcolor: 'background.paper',
            borderRadius: 2.5,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)'
              : '0 8px 32px rgba(10,15,30,0.08), 0 1px 4px rgba(10,15,30,0.04)',
            borderTop: `3px solid ${gold}`,
          }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {isMobile && (
                <Box textAlign="center" mb={3}>
                  <BrandLogo size={64} />
                  <Typography variant="h6" fontWeight={700} mt={1}>360 Engineering</Typography>
                </Box>
              )}
              <Typography variant="body1" fontWeight={600} textAlign="center" mb={0.5}>
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                Sign in to your account to continue
              </Typography>
              <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
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
                  sx={{ mb: 2.5, ...fieldFocusSx }}
                />
                {tab === 1 && (
                  <TextField
                    name="email" label={t('email')} type="email" fullWidth required
                    size="small" autoComplete="email"
                    sx={{ mb: 2.5, ...fieldFocusSx }}
                  />
                )}
                <TextField
                  name="password" label={t('password')} type="password"
                  fullWidth required size="small"
                  autoComplete={tab === 1 ? 'new-password' : 'current-password'}
                  sx={{ mb: tab === 1 ? 2.5 : 3.5, ...fieldFocusSx }}
                />
                {tab === 1 && (
                  <TextField
                    name="confirmPassword" label={t('confirmPassword')} type="password"
                    fullWidth required size="small" autoComplete="new-password"
                    sx={{ mb: 3.5, ...fieldFocusSx }}
                  />
                )}
                <Button
                  type="submit" variant="contained" fullWidth size="large"
                  disabled={loading} disableElevation
                  sx={{
                    height: 46, fontWeight: 600, fontSize: '0.875rem',
                    borderRadius: 1.5, backgroundColor: gold,
                    '&:hover': { backgroundColor: goldLight, transform: 'translateY(-1px)', boxShadow: `0 4px 16px ${gold}50` },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : (tab === 1 ? t('register') : t('login'))}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        <Box sx={{
          position: 'absolute', top: 16, [i18n.language === 'ar' ? 'left' : 'right']: 16,
        }}>
          <Tooltip title={isDark ? t('lightMode') : t('darkMode')}>
            <IconButton onClick={toggleMode} sx={{ color: 'text.secondary' }}>
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
