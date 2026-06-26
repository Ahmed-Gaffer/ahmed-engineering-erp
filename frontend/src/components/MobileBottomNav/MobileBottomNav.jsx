import { useTranslation } from 'react-i18next';
import { Box, Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
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

export default function MobileBottomNav({ onMore }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentValue = navItems.findIndex((item) =>
    item.path && location.pathname.startsWith(item.path)
  );

  const handleChange = (_, index) => {
    const item = navItems[index];
    if (item.path) {
      navigate(item.path);
    } else if (onMore) {
      onMore();
    }
  };

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }}
      elevation={8}
    >
      <BottomNavigation
        value={currentValue >= 0 ? currentValue : 0}
        onChange={handleChange}
        showLabels
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={t(item.label)}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
