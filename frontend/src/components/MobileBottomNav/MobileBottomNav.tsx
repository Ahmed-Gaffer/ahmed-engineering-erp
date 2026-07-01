import { useTranslation } from 'react-i18next';
import { Box, Paper, BottomNavigation, BottomNavigationAction, Badge, useTheme } from '@mui/material';
import {
  Dashboard, Folder, Assignment, Description, MoreHoriz,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'dashboard', icon: <Dashboard />, path: '/engineering/dashboard' },
  { label: 'projects', icon: <Folder />, path: '/engineering/projects' },
  { label: 'workOrders', icon: <Assignment />, path: '/engineering/work-orders' },
  { label: 'documents', icon: <Description />, path: '/engineering/documents' },
  { label: 'more', icon: <MoreHoriz />, path: null },
];

interface MobileBottomNavProps {
  onMore?: () => void;
  unreadCount?: number;
}

export default function MobileBottomNav({ onMore, unreadCount = 0 }: MobileBottomNavProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const currentValue = navItems.findIndex((item) =>
    item.path && location.pathname.startsWith(item.path)
  );

  const handleChange = (_: React.SyntheticEvent, index: number) => {
    const item = navItems[index];
    if (item.path) {
      navigate(item.path);
    } else if (onMore) {
      onMore();
    }
  };

  const moreIcon = (
    <Badge badgeContent={unreadCount} color="warning">
      <MoreHoriz />
    </Badge>
  );

  return (
    <Paper
      sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200,
        borderTop: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }}
      elevation={4}
    >
      <BottomNavigation
        value={currentValue >= 0 ? currentValue : 0}
        onChange={handleChange}
        showLabels
        sx={{
          '& .Mui-selected': {
            '& .MuiBottomNavigationAction-label': { color: '#D97706', fontWeight: 700 },
            '& .MuiSvgIcon-root': { color: '#D97706' },
          },
        }}
      >
        {navItems.map((item, idx) => (
          <BottomNavigationAction
            key={item.label}
            label={t(item.label)}
            icon={idx === navItems.length - 1 ? moreIcon : item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
