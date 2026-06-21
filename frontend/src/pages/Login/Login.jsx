import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import { Engineering, Construction, AccountTree } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const form = new FormData(e.target);
      await login(form.get('username'), form.get('password'));
      navigate('/engineering/dashboard');
    } catch {
      setError(t('operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{
        flex: { md: 1 }, display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', p: 6,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.05, background: 'radial-gradient(circle at 30% 40%, #6366f1 0%, transparent 60%), radial-gradient(circle at 70% 60%, #06b6d4 0%, transparent 50%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Stack direction="row" spacing={-1} justifyContent="center" mb={2}>
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
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: { xs: 2, md: 6 },
        bgcolor: 'background.default',
      }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }} style={{ width: '100%', maxWidth: 420 }}>
          <Card sx={{
            maxWidth: 420, width: '100%', position: 'relative', overflow: 'visible',
            '&::before': {
              content: '""', position: 'absolute', top: 0, insetInline: 0, height: 4,
              background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)', borderRadius: '14px 14px 0 0',
            },
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={700} textAlign="center" mb={0.5}>
                {t('welcomeBack')}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={3.5}>
                {t('signInToAccount')}
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
              )}
              <form onSubmit={handleSubmit}>
                <TextField
                  name="username" label={t('username')} fullWidth required
                  size="small" autoComplete="username" autoFocus
                  sx={{ mb: 2.5 }}
                />
                <TextField
                  name="password" label={t('password')} type="password"
                  fullWidth required size="small" autoComplete="current-password"
                  sx={{ mb: 3.5 }}
                />
                <Button
                  type="submit" variant="contained" fullWidth size="large"
                  disabled={loading} disableElevation
                >
                  {loading ? t('loading') : t('login')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
}
