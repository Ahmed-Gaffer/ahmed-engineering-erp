import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Chip, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DoneAll, Notifications as BellIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { notificationsApi } from '../../services/api';

const typeColors = {
  info: { bg: 'rgba(15,23,42,0.2)', color: '#D97706' },
  warning: { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
  success: { bg: 'rgba(16,185,129,0.2)', color: '#34d399' },
  error: { bg: 'rgba(239,68,68,0.2)', color: '#fca5a5' },
};

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await notificationsApi.list({ skip: page * pageSize, limit: pageSize });
      setData(r.data.items || []);
      setTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  const fetchUnread = async () => {
    try { const r = await notificationsApi.unreadCount(); setUnreadCount(r.data.count); } catch {}
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);
  useEffect(() => { fetchUnread(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setData((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const handleRowClick = async (params) => {
    const n = params.row;
    if (!n.is_read) {
      try {
        await notificationsApi.markRead(n.id);
        setData((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {}
    }
    if (n.link) navigate(n.link);
  };

  const columns = [
    {
      field: 'is_read', headerName: '', width: 50,
      renderCell: (p) => (
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.value ? 'transparent' : '#D97706' }} />
      ),
    },
    { field: 'title', headerName: t('title'), width: 250 },
    { field: 'message', headerName: t('message'), flex: 1, minWidth: 200 },
    {
      field: 'type', headerName: t('type'), width: 100,
      renderCell: (p) => {
        const tc = typeColors[p.value] || typeColors.info;
        return <Chip label={p.value} size="small" sx={{ bgcolor: tc.bg, color: tc.color, fontWeight: 500, borderRadius: 1 }} />;
      },
    },
    {
      field: 'created_at', headerName: t('date'), width: 180,
      renderCell: (p) => <Typography variant="body2">{p.value ? new Date(p.value).toLocaleString() : ''}</Typography>,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <BellIcon sx={{ color: '#D97706' }} />
          <Typography variant="h6" fontWeight={700}>{t('notifications')}</Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} ${t('unread')}`} size="small" color="error" />
          )}
        </Stack>
        {unreadCount > 0 && (
          <Button variant="outlined" size="small" startIcon={<DoneAll />} onClick={handleMarkAllRead}>
            {t('markAllRead')}
          </Button>
        )}
      </Stack>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          rowCount={total}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          paginationMode="server"
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          getRowId={(r) => r.id}
          getRowClassName={(p) => p.row.is_read ? '' : 'unread-row'}
          sx={{
            '& .unread-row': { fontWeight: 600, bgcolor: 'action.hover' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
          }}
          localeText={{
            noRowsLabel: t('noNotifications'),
            footerRowSelected: () => '',
          }}
        />
      </Box>
    </motion.div>
  );
}
