import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, ListItemIcon,
  Avatar, Stack, Divider, Breadcrumbs, Link, Tooltip, useMediaQuery, useTheme,
  InputBase,
} from '@mui/material';
import {
  Menu as MenuIcon, Logout, Person, Settings, Engineering, Language,
  DarkMode, LightMode, ChevronLeft, ChevronRight, Search as SearchIcon,
} from '@mui/icons-material';
import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../Sidebar/Sidebar';
import MobileBottomNav from '../MobileBottomNav/MobileBottomNav';
import Footer from '../Footer/Footer';
import NavigationProgress from '../NavigationProgress/NavigationProgress';
import PageTransition from '../PageTransition/PageTransition';
import NotificationBell from '../NotificationBell/NotificationBell';
import { useAuthStore } from '../../stores/authStore';
import { useThemeMode } from '../../contexts/ThemeContext';

const DRAWER_WIDTH = 280;
const DRAWER_MINI = 72;

const breadcrumbMap: Record<string, string> = {
  dashboard: 'dashboard',
  reports: 'reports',
  search: 'search',
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
  evm: 'evm',
  employees: 'employees',
  'contracts-list': 'contractsPage',
  schedules: 'schedulesPage',
  'variation-orders': 'variationOrders',
  rfis: 'rfis',
  mar: 'mar',
  ncr: 'ncr',
  submittals: 'submittals',
  'inspection-requests': 'inspectionRequests',
  'punch-list': 'punchList',
  transmittals: 'transmittals',
  'daily-reports': 'dailyReportsPage',
  subcontractors: 'subcontractorsPage',
  'meeting-minutes': 'meetingMinutes',
  'company-profile': 'companyProfile',
  notifications: 'notifications',
  admin: 'adminPanel',
  branches: 'branches',
  categories: 'categories',
  'cost-codes': 'costCodes',
  'safety-incidents': 'safetyIncidents',
  'safety-observations': 'safetyObservations',
  hse: 'hseDashboard',
  'material-tests': 'materialTests',
  itps: 'itp',
  'method-statements': 'methodStatements',
  specifications: 'specifications',
  permits: 'permits',
  survey: 'survey',
};

export default function Layout() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { mode, toggleMode } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const segments = location.pathname.replace('/engineering/', '').split('/').filter(Boolean);
  const sidebarWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_MINI;

  const toggleLang = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const userInitial = user?.username?.charAt(0).toUpperCase() || 'U';

  const handleToggleSidebar = () => {
    if (isMobile) setMobileOpen(!mobileOpen);
    else setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavigationProgress />
      <Sidebar
        open={sidebarOpen}
        mini={!sidebarOpen}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen(false)}
      />
      <Box sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        ml: isMobile ? 0 : `${sidebarWidth}px`,
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <AppBar position="sticky" color="inherit" elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', zIndex: 1100 }}
        >
          <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 56, sm: 56 } }}>
            <IconButton edge="start" onClick={handleToggleSidebar} size="small">
              {isMobile ? (
                <MenuIcon />
              ) : (
                <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
                  {i18n.language === 'ar' ? <ChevronRight /> : <ChevronLeft />}
                </motion.div>
              )}
            </IconButton>
            <Stack spacing={0} flex={1} sx={{ overflow: 'hidden' }}>
              <Breadcrumbs separator="›" aria-label="breadcrumb"
                sx={{ '& .MuiBreadcrumbs-separator': { color: 'text.secondary', fontSize: '1.1rem' }, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
              >
                <Link component={RouterLink} to="/engineering/dashboard" underline="hover" color="text.secondary" fontSize="0.8125rem">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Engineering fontSize="inherit" />
                    <Typography variant="caption" component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t('app')}</Typography>
                  </Stack>
                </Link>
                {segments.map((seg, i) => {
                  const labelKey = breadcrumbMap[seg] || seg;
                  const isLast = i === segments.length - 1;
                  return isLast ? (
                    <Typography key={seg} variant="caption" color="text.primary" fontWeight={600}
                      sx={{ maxWidth: { xs: 100, sm: 200 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
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
            <IconButton size="small" onClick={() => setSearchOpen(!searchOpen)}>
              <SearchIcon fontSize="small" />
            </IconButton>
            {searchOpen && (
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 2, px: 2, py: 0.3, minWidth: 200, border: '1px solid', borderColor: 'divider', position: { xs: 'absolute', sm: 'static' }, top: 56, left: 0, right: 0, zIndex: 1200 }}>
                <SearchIcon sx={{ color: 'text.secondary', fontSize: '1rem', mr: 0.5 }} />
                <InputBase placeholder={t('search')} size="small" autoFocus
                  sx={{ fontSize: '0.8125rem', '& input': { py: 0.3 } }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) { navigate('/engineering/search?q=' + encodeURIComponent((e.target as HTMLInputElement).value.trim())); setSearchOpen(false); } }}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
              </Box>
            )}
            <NotificationBell />
            <Tooltip title={mode === 'dark' ? t('lightMode') : t('darkMode')}>
              <IconButton size="small" onClick={toggleMode}>
                {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Avatar
              onClick={(e: React.MouseEvent<HTMLDivElement>) => setProfileAnchor(e.currentTarget)}
              sx={{
                width: { xs: 30, sm: 32 }, height: { xs: 30, sm: 32 }, cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 700,
                bgcolor: 'primary.main',
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
                <Divider sx={{ my: 1 }} />
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
              <MenuItem onClick={() => { setProfileAnchor(null); toggleLang('ar'); }} dense selected={i18n.language === 'ar'}>
                <ListItemIcon><Language fontSize="small" /></ListItemIcon>
                العربية
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); toggleLang('en'); }} dense selected={i18n.language === 'en'}>
                <ListItemIcon><Language fontSize="small" /></ListItemIcon>
                English
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setProfileAnchor(null); logout(); }} dense>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                {t('logout')}
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, pb: { xs: 8, md: 3 }, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <PageTransition>
            <Outlet />
          </PageTransition>
          <Footer />
        </Box>
      </Box>
      {isMobile && <MobileBottomNav onMore={() => setMobileOpen(true)} />}
    </Box>
  );
}
