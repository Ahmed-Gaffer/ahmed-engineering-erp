import React from 'react';
import { Tooltip as MuiTooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Drawer, ListItemButton, ListItemIcon, Toolbar, Typography, Box,
  Stack, Divider,
} from '@mui/material';
import {
  Dashboard, People, Folder, AccountTree, Code, Assignment, ListAlt, Image,
  DocumentScanner, Receipt, Engineering, Construction, Badge, Search, Assessment,
  Description, EventNote, GroupWork, CalendarMonth, Business,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const DRAWER_WIDTH = 280;
const DRAWER_MINI = 72;
const isActive = (path, location) => location.pathname === path;

const iconBg = (color) => ({
  width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center',
  justifyContent: 'center', backgroundColor: color,
});

const sections = [
  {
    title: 'overview', items: [
      { label: 'dashboard', icon: <Dashboard />, path: '/engineering/dashboard', bg: 'rgba(99,102,241,0.2)', color: '#818cf8' },
      { label: 'companyProfile', icon: <Business />, path: '/engineering/company-profile', bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
      { label: 'reports', icon: <Assessment />, path: '/engineering/reports', bg: 'rgba(16,185,129,0.2)', color: '#34d399' },
    ],
  },
  {
    title: 'dataManagement', items: [
      { label: 'contractors', icon: <People />, path: '/engineering/contractors', bg: 'rgba(16,185,129,0.2)', color: '#34d399' },
      { label: 'projects', icon: <Folder />, path: '/engineering/projects', bg: 'rgba(59,130,246,0.2)', color: '#60a5fa' },
      { label: 'phases', icon: <AccountTree />, path: '/engineering/phases', bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
      { label: 'codes', icon: <Code />, path: '/engineering/codes', bg: 'rgba(168,85,247,0.2)', color: '#c084fc' },
    ],
  },
  {
    title: 'operations', items: [
      { label: 'workOrders', icon: <Assignment />, path: '/engineering/work-orders', bg: 'rgba(6,182,212,0.2)', color: '#22d3ee' },
      { label: 'workOrderItems', icon: <ListAlt />, path: '/engineering/work-order-items', bg: 'rgba(99,102,241,0.2)', color: '#818cf8' },
      { label: 'drawings', icon: <Image />, path: '/engineering/drawings', bg: 'rgba(251,146,60,0.2)', color: '#fb923c' },
      { label: 'drawingRevisions', icon: <DocumentScanner />, path: '/engineering/drawing-revisions', bg: 'rgba(236,72,153,0.2)', color: '#f472b6' },
      { label: 'boq', icon: <Construction />, path: '/engineering/boq', bg: 'rgba(168,85,247,0.2)', color: '#c084fc' },
      { label: 'contractsPage', icon: <Description />, path: '/engineering/contracts-list', bg: 'rgba(6,182,212,0.2)', color: '#22d3ee' },
      { label: 'schedulesPage', icon: <CalendarMonth />, path: '/engineering/schedules', bg: 'rgba(251,146,60,0.2)', color: '#fb923c' },
      { label: 'dailyReportsPage', icon: <EventNote />, path: '/engineering/daily-reports', bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
      { label: 'subcontractorsPage', icon: <GroupWork />, path: '/engineering/subcontractors', bg: 'rgba(236,72,153,0.2)', color: '#f472b6' },
    ],
  },
  {
    title: 'documents', items: [
      { label: 'documents', icon: <DocumentScanner />, path: '/engineering/documents', bg: 'rgba(16,185,129,0.2)', color: '#34d399' },
      { label: 'ipc', icon: <Receipt />, path: '/engineering/ipc', bg: 'rgba(59,130,246,0.2)', color: '#60a5fa' },
    ],
  },
  {
    title: 'hr', items: [
      { label: 'employees', icon: <Badge />, path: '/engineering/employees', bg: 'rgba(236,72,153,0.2)', color: '#f472b6' },
    ],
  },
];

export default function Sidebar({ open, mini, onToggle }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => { navigate(path); };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? (mini ? DRAWER_MINI : DRAWER_WIDTH) : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? (mini ? DRAWER_MINI : DRAWER_WIDTH) : 0,
          bgcolor: '#0f172a',
          color: '#e2e8f0',
          borderRight: i18n.language === 'ar' ? 'none' : '1px solid rgba(255,255,255,0.06)',
          borderLeft: i18n.language === 'ar' ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar sx={{ px: mini ? 1.5 : 2.5, justifyContent: 'center' }}>
        {mini ? (
          <Box sx={{
            width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', flexShrink: 0,
          }}>
            <Engineering sx={{ fontSize: 22, color: 'white' }} />
          </Box>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1.5} width={1}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', flexShrink: 0,
            }}>
              <Engineering sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} noWrap lineHeight={1.2}>
                {t('app')}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.4)" noWrap fontSize="0.65rem">
                ERP System
              </Typography>
            </Box>
          </Stack>
        )}
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0 }} />
      <Box sx={{ flex: 1, overflow: 'auto', px: mini ? 1 : 1.5, py: 1 }}>
        {sections.map((section) => (
          <Box key={section.title} sx={{ mb: 1.5 }}>
            {!mini && (
              <Typography
                variant="caption" noWrap
                sx={{ px: 1, py: 0.75, display: 'block', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.08em' }}
              >
                {t(section.title)}
              </Typography>
            )}
            {section.items.map((item) => {
              const active = isActive(item.path, location);
              const btn = (
                <ListItemButton
                  key={item.path}
                  selected={active}
                  onClick={() => handleNav(item.path)}
                  sx={{
                    borderRadius: 1.5, mb: 0.25, px: mini ? 1 : 1.5, py: 0.75,
                    justifyContent: mini ? 'center' : 'flex-start',
                    position: 'relative', overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&::before': active ? {
                      content: '""', position: 'absolute', insetInline: 0, top: 0, bottom: 0,
                      background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, transparent 100%)',
                      borderRadius: 1.5,
                    } : {},
                    '&::after': active ? {
                      content: '""', position: 'absolute', insetInlineStart: 0, top: '20%', bottom: '20%', width: 3,
                      background: 'linear-gradient(180deg, #6366f1, #818cf8)', borderRadius: '0 4px 4px 0',
                      ...(i18n.language === 'ar' ? { right: 0, left: 'auto', borderRadius: '4px 0 0 4px' } : {}),
                    } : {},
                    '&.Mui-selected': { backgroundColor: 'transparent' },
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
                    minWidth: mini ? 48 : 'auto',
                  }}
                >
                  <ListItemIcon sx={{ color: item.color, minWidth: mini ? 'auto' : 40 }}>
                    <Box sx={iconBg(item.bg)}>
                      {React.cloneElement(item.icon, { sx: { fontSize: mini ? 20 : 20 } })}
                    </Box>
                  </ListItemIcon>
                  {!mini && (
                    <motion.span
                      initial={false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: active ? 600 : 400,
                          color: active ? 'white' : 'rgba(255,255,255,0.7)',
                          ml: 1.5,
                        }}
                      >
                        {t(item.label)}
                      </Typography>
                    </motion.span>
                  )}
                </ListItemButton>
              );
              return mini ? (
                <MuiTooltip key={item.path} title={t(item.label)} placement="right" arrow>
                  {btn}
                </MuiTooltip>
              ) : btn;
            })}
          </Box>
        ))}
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      {!mini && (
        <Box sx={{ px: 2.5, py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              fontSize: '0.75rem', fontWeight: 700, color: 'white',
            }}>
              <Construction sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={600} color="rgba(255,255,255,0.5)" fontSize="0.6rem">
                v1.0.0 • Engineering
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
}
