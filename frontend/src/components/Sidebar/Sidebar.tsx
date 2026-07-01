import React, { useState } from 'react';
import { Tooltip, useMediaQuery, useTheme, IconButton, Collapse } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Drawer, ListItemButton, ListItemIcon, Toolbar, Typography, Box,
  Stack, Divider,
} from '@mui/material';
import { ChevronLeft, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useNavigate, useLocation, Pathname } from 'react-router-dom';
import BrandLogo from '../BrandLogo/BrandLogo';
import Icon from '../SvgIcon/SvgIcon';

const DRAWER_WIDTH = 280;
const DRAWER_MINI = 72;

const isActive = (path: string, location: { pathname: Pathname }) => location.pathname === path;

interface SectionItem {
  label: string;
  icon: React.ReactElement;
  path: string;
}

interface Section {
  title: string;
  defaultOpen: boolean;
  items: SectionItem[];
}

const sections: Section[] = [
    {
      title: 'overview', defaultOpen: true, items: [
        { label: 'dashboard', icon: <Icon name="dashboard" />, path: '/engineering/dashboard' },
        { label: 'reports', icon: <Icon name="chart" />, path: '/engineering/reports' },
      ],
    },
    {
      title: 'projects', defaultOpen: false, items: [
        { label: 'projects', icon: <Icon name="projects" />, path: '/engineering/projects' },
        { label: 'contractsPage', icon: <Icon name="document" />, path: '/engineering/contracts-list' },
        { label: 'boq', icon: <Icon name="tool" />, path: '/engineering/boq' },
        { label: 'phases', icon: <Icon name="layers" />, path: '/engineering/phases' },
        { label: 'workOrders', icon: <Icon name="list" />, path: '/engineering/work-orders' },
        { label: 'schedulesPage', icon: <Icon name="schedule" />, path: '/engineering/schedules' },
        { label: 'ipc', icon: <Icon name="ipc" />, path: '/engineering/ipc' },
      ],
    },
    {
      title: 'engineering', defaultOpen: false, items: [
        { label: 'submittals', icon: <Icon name="list" />, path: '/engineering/submittals' },
        { label: 'inspectionRequests', icon: <Icon name="check" />, path: '/engineering/inspection-requests' },
        { label: 'punchList', icon: <Icon name="list" />, path: '/engineering/punch-list' },
        { label: 'transmittals', icon: <Icon name="document" />, path: '/engineering/transmittals' },
        { label: 'ncr', icon: <Icon name="ncr" />, path: '/engineering/ncr' },
        { label: 'rfis', icon: <Icon name="search" />, path: '/engineering/rfis' },
        { label: 'drawings', icon: <Icon name="drawing" />, path: '/engineering/drawings' },
      ],
    },
    {
      title: 'commercial', defaultOpen: false, items: [
        { label: 'contractors', icon: <Icon name="people" />, path: '/engineering/contractors' },
        { label: 'subcontractorsPage', icon: <Icon name="people" />, path: '/engineering/subcontractors' },
        { label: 'variationOrders', icon: <Icon name="ipc" />, path: '/engineering/variation-orders' },
        { label: 'costCodes', icon: <Icon name="code" />, path: '/engineering/cost-codes' },
      ],
    },
    {
      title: 'administration', defaultOpen: false, items: [
        { label: 'hseDashboard', icon: <Icon name="chart" />, path: '/engineering/hse/dashboard' },
        { label: 'safetyIncidents', icon: <Icon name="alert" />, path: '/engineering/safety-incidents' },
        { label: 'documents', icon: <Icon name="document" />, path: '/engineering/documents' },
        { label: 'employees', icon: <Icon name="people" />, path: '/engineering/employees' },
        { label: 'adminPanel', icon: <Icon name="settings" />, path: '/engineering/admin' },
      ],
    },
  ];

interface SidebarProps {
  open: boolean;
  mini: boolean;
  onToggle?: () => void;
  mobileOpen: boolean;
  onMobileToggle?: () => void;
}

export default function Sidebar({ open, mini, onToggle, mobileOpen, onMobileToggle }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(s => { initial[s.title] = s.defaultOpen; });
    return initial;
  });

  const toggleSection = (title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onMobileToggle?.();
  };

  const gold = '#d4a030';
  const text = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.85)';
  const muted = 'rgba(255,255,255,0.4)';
  const divider = 'rgba(255,255,255,0.06)';
  const hoverBg = 'rgba(255,255,255,0.04)';
  const activeBg = 'rgba(212,160,48,0.12)';

  const sidebarContent = (
    <>
      <Toolbar sx={{ px: mini ? 1 : 3, justifyContent: mini ? 'center' : 'space-between' }}>
        {mini ? (
          <BrandLogo size={36} />
        ) : (
          <Stack direction="row" alignItems="center" spacing={2} width={1}>
            <BrandLogo size={40} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap lineHeight={1.2} color={text}>
                360 Engineering
              </Typography>
              <Typography variant="caption" noWrap color={muted} fontSize="0.6rem" letterSpacing="0.06em">
                ERP Premium
              </Typography>
            </Box>
            {isMobile && (
              <IconButton size="small" onClick={onMobileToggle} sx={{ color: muted }}>
                <ChevronLeft />
              </IconButton>
            )}
          </Stack>
        )}
      </Toolbar>
      <Divider sx={{ borderColor: divider }} />
      <Box sx={{
        flex: 1, overflow: 'auto', px: mini ? 0.5 : 1, py: 1,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.08)', borderRadius: 10 },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.16)' },
        scrollbarWidth: 'thin',
      }}>
        {sections.map((section) => (
          <Box key={section.title} sx={{ mb: 0.25 }}>
            {!mini && (
              <ListItemButton
                onClick={() => toggleSection(section.title)}
                sx={{ borderRadius: 1, px: 1, py: 0.5, mb: 0.25, '&:hover': { backgroundColor: hoverBg } }}
              >
                <Typography
                  variant="caption" noWrap sx={{ flex: 1, color: muted, fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  {t(section.title)}
                </Typography>
                {expanded[section.title] ? (
                  <ExpandLess sx={{ fontSize: 14, color: muted }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 14, color: muted }} />
                )}
              </ListItemButton>
            )}
            <Collapse in={expanded[section.title]} timeout="auto" unmountOnExit>
              {section.items.map((item) => {
                const active = isActive(item.path, location);
                const btn = (
                  <ListItemButton
                    key={item.path}
                    selected={active}
                    onClick={() => handleNav(item.path)}
                    sx={{
                      borderRadius: 1, mb: 0.25, px: mini ? 1 : 2, py: 1,
                      justifyContent: mini ? 'center' : 'flex-start',
                      transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                      backgroundColor: active ? activeBg : 'transparent',
                      '&:hover': {
                        backgroundColor: active ? activeBg : hoverBg,
                        '& .nav-icon': { color: active ? gold : gold },
                      },
                      minWidth: mini ? 48 : 'auto',
                      position: 'relative',
                    }}
                  >
                    {active && !mini && (
                      <Box sx={{
                        position: 'absolute', insetInlineStart: 0, top: 6, bottom: 6, width: 3,
                        backgroundColor: gold, borderRadius: '0 4px 4px 0',
                        boxShadow: `0 0 8px ${gold}80`,
                      }} />
                    )}
                    <ListItemIcon className="nav-icon" sx={{
                      color: active ? gold : muted,
                      minWidth: mini ? 'auto' : 36,
                      transition: 'color 0.2s ease',
                    }}>
                      {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                    </ListItemIcon>
                    {!mini && (
                      <Typography variant="body2" noWrap sx={{
                        fontWeight: active ? 600 : 400,
                        color: active ? '#ffffff' : text,
                        fontSize: '0.8125rem',
                      }}>
                        {t(item.label)}
                      </Typography>
                    )}
                  </ListItemButton>
                );
                return mini ? (
                  <Tooltip key={item.path} title={t(item.label)} placement="right" arrow>
                    {btn}
                  </Tooltip>
                ) : btn;
              })}
            </Collapse>
          </Box>
        ))}
      </Box>
      <Divider sx={{ borderColor: divider }} />
    </>
  );

  const paperSx = {
    bgcolor: 'rgba(10,15,30,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    color: text,
    borderRight: i18n.language === 'ar' ? 'none' : 'none',
    borderLeft: i18n.language === 'ar' ? 'none' : 'none',
    transition: 'width 0.35s cubic-bezier(0.16,1,0.3,1)',
    overflowX: 'hidden',
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            ...paperSx,
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: mini ? DRAWER_MINI : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: mini ? DRAWER_MINI : DRAWER_WIDTH,
          ...paperSx,
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
}
