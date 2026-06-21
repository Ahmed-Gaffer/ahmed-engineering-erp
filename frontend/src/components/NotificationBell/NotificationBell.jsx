import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton, Badge, Popover, Box, Typography, Button, Divider, List, ListItemButton,
  ListItemText, ListItemIcon, Stack, Chip, Tooltip,
} from '@mui/material';
import { Notifications as BellIcon, Circle, DoneAll } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { notificationsApi } from '../../services/api';

export default function NotificationBell() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [anchor, setAnchor] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef = useRef(null);

  const fetchUnread = async () => {
    try {
      const res = await notificationsApi.unreadCount();
      setUnreadCount(res.data.count);
    } catch { /* ignore */ }
  };

  const fetchNotifs = async () => {
    try {
      const res = await notificationsApi.list({ limit: 10 });
      setNotifs(res.data.items);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUnread();
    pollRef.current = setInterval(fetchUnread, 15000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleOpen = async (e) => {
    setAnchor(e.currentTarget);
    await fetchNotifs();
  };

  const handleClose = () => setAnchor(null);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  return (
    <>
      <Tooltip title={t('notifications')}>
        <IconButton size="small" onClick={handleOpen}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <BellIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 480, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight={700}>{t('notifications')}</Typography>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<DoneAll fontSize="small" />} onClick={handleMarkAllRead}>
              {t('markAllRead')}
            </Button>
          )}
        </Box>
        <Divider />
        {notifs.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">{t('noNotifications')}</Typography>
          </Box>
        ) : (
          <List disablePadding dense>
            {notifs.map((n) => (
              <ListItemButton key={n.id} sx={{ px: 2, py: 1.25, opacity: n.is_read ? 0.6 : 1 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Circle sx={{ fontSize: 10, color: n.is_read ? 'text.disabled' : '#6366f1' }} />
                </ListItemIcon>
                <ListItemText
                  primary={n.title}
                  secondary={n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: n.is_read ? 400 : 600 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
