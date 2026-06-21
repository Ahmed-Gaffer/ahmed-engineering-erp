import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, ListItemIcon,
  Avatar, Stack, Divider, Chip, Breadcrumbs, Link, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon, Logout, Person, Settings, Engineering,
  DarkMode, LightMode, ChevronLeft,
} from '@mui/icons-material';
import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../Sidebar/Sidebar';
import NavigationProgress from '../NavigationProgress/NavigationProgress';
import NotificationBell from '../NotificationBell/NotificationBell';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';

const DRAWER_WIDTH = 280;
const DRAWER_MINI = 72;

const breadcrumbMap = {
  dashboard: 'dashboard',
  contractors: 'contractors',
  projects: 'projects',
  phases: 'phases',
  codes: 'codes',
  'work-orders': 'workOrders',
  'work-order-items': 'workOrderItems',
  drawings: 'drawings',
  'drawing-revisions': 'drawingRevisions',
  documents: 'documents',
  'payment-certificates': 'paymentCertificates',
  boq: 'boq',
  ipc: 'ipc',
  employees: 'employees',
};

export default function Layout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [langAnchor, setLangAnchor] = useState(null);

  const segments = location.pathname.replace('/engineering/', '').split('/').filter(Boolean);
  const sidebarWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_MINI;

  const toggleLang = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    setLangAnchor(null);
  };

  const userInitial = user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavigationProgress />
      <Sidebar open={sidebarOpen} mini={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Box sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        ml: `${sidebarWidth}px`,
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <AppBar position="sticky" color="inherit" elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', zIndex: 1100 }}
        >
          <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 56 } }}>
            <IconButton edge="start" onClick={() => setSidebarOpen(!sidebarOpen)} size="small">
              <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
                <ChevronLeft />
              </motion.div>
            </IconButton>
            <Stack spacing={0} flex={1}>
              <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ '& .MuiBreadcrumbs-separator': { color: 'text.secondary', fontSize: '1.1rem' } }}>
                <Link component={RouterLink} to="/engineering/dashboard" underline="hover" color="text.secondary" fontSize="0.8125rem">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Engineering fontSize="inherit" />
                    <Typography variant="caption" component="span">{t('app')}</Typography>
                  </Stack>
                </Link>
                {segments.map((seg, i) => {
                  const labelKey = breadcrumbMap[seg] || seg;
                  const isLast = i === segments.length - 1;
                  return isLast ? (
                    <Typography key={seg} variant="caption" color="text.primary" fontWeight={600}>
                      {t(labelKey)}
                    </Typography>
                  ) : (
                    <Link key={seg} component={RouterLink} to={`/engineering/${seg}`} underline="hover" color="text.secondary" fontSize="0.8125rem">
                      {t(labelKey)}
                    </Link>
                  );
                })}
              </Breadcrumbs>
            </Stack>
            <NotificationBell />
            <Tooltip title={mode === 'dark' ? t('lightMode') : t('darkMode')}>
              <IconButton size="small" onClick={toggleMode}>
                {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Chip
              label={i18n.language === 'ar' ? 'AR' : 'EN'}
              size="small" variant="outlined"
              onClick={(e) => setLangAnchor(e.currentTarget)}
              sx={{ fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer', height: 28 }}
            />
            <Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)}>
              <MenuItem onClick={() => toggleLang('ar')} selected={i18n.language === 'ar'}>العربية</MenuItem>
              <MenuItem onClick={() => toggleLang('en')} selected={i18n.language === 'en'}>English</MenuItem>
            </Menu>
            <Avatar
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{
                width: 32, height: 32, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              }}
            >
              {userInitial}
            </Avatar>
            <Menu
              anchorEl={profileAnchor} open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{ paper: { sx: { minWidth: 200, mt: 1 } } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>{user?.username}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.role || 'user'}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setProfileAnchor(null); navigate('/engineering/dashboard'); }} dense>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                {t('profile')}
              </MenuItem>
              <MenuItem onClick={() => setProfileAnchor(null)} dense>
                <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                {t('settings')}
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setProfileAnchor(null); logout(); }} dense>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                {t('logout')}
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
