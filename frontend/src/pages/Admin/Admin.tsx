import { useState, useEffect, useCallback, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Tabs, Tab, Paper, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Select, MenuItem, FormControl,
  InputLabel, Chip, Stack, CircularProgress, Alert, useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Refresh, Edit as EditIcon, Add, AdminPanelSettings } from '@mui/icons-material';
import { adminApi } from '../../services/api';

export default function Admin() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState({ settings: false, activity: false, logs: false });
  const [logLines, setLogLines] = useState(100);
  const [actionFilter, setActionFilter] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, key: '', value: '' });
  const [createDialog, setCreateDialog] = useState({ open: false, key: '', value: '', description: '' });

  const fetchSettings = useCallback(async () => {
    setLoading(prev => ({ ...prev, settings: true }));
    try {
      const { data } = await adminApi.listSettings();
      setSettings(data);
    } catch { /* ignore */ }
    setLoading(prev => ({ ...prev, settings: false }));
  }, []);

  const fetchActivity = useCallback(async () => {
    setLoading(prev => ({ ...prev, activity: true }));
    try {
      const params: Record<string, any> = { limit: 50 };
      if (actionFilter) params.action = actionFilter;
      const { data } = await adminApi.activity(params);
      setActivity(data);
    } catch { /* ignore */ }
    setLoading(prev => ({ ...prev, activity: false }));
  }, [actionFilter]);

  const fetchLogs = useCallback(async () => {
    setLoading(prev => ({ ...prev, logs: true }));
    try {
      const { data } = await adminApi.logs({ lines: logLines });
      setLogs(data.lines || []);
    } catch { /* ignore */ }
    setLoading(prev => ({ ...prev, logs: false }));
  }, [logLines]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => { fetchActivity(); }, [fetchActivity]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleEditSave = async () => {
    try {
      await adminApi.updateSetting(editDialog.key, { value: editDialog.value });
      setEditDialog({ open: false, key: '', value: '' });
      fetchSettings();
    } catch { /* ignore */ }
  };

  const handleCreateSave = async () => {
    try {
      await adminApi.createSetting({
        key: createDialog.key,
        value: createDialog.value,
        description: createDialog.description,
      });
      setCreateDialog({ open: false, key: '', value: '', description: '' });
      fetchSettings();
    } catch { /* ignore */ }
  };

  const settingColumns = [
    { field: 'key', headerName: t('settingKey'), flex: 1, minWidth: 180 },
    {
      field: 'value', headerName: t('settingValue'), flex: 1, minWidth: 200,
      renderCell: (params: any) => (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value}
          </Typography>
          <Tooltip title={t('edit')}>
            <IconButton size="small" onClick={() => setEditDialog({ open: true, key: params.row.key, value: params.row.value })}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    { field: 'description', headerName: t('settingDescription'), flex: 1, minWidth: 150 },
    {
      field: 'updated_at', headerName: t('date'), width: 180,
      valueFormatter: (v: string) => v ? new Date(v).toLocaleString() : '',
    },
  ];

  const activityColumns = [
    { field: 'username', headerName: t('username'), width: 130 },
    {
      field: 'action', headerName: t('actions'), width: 120,
      renderCell: (params: any) => <Chip label={params.value} size="small" color={(params.value === 'create' ? 'success' : params.value === 'delete' ? 'error' : 'primary') as any} variant="outlined" />,
    },
    { field: 'resource', headerName: t('type'), width: 120 },
    { field: 'details', headerName: t('description'), flex: 1, minWidth: 150 },
    { field: 'ip_address', headerName: 'IP', width: 130 },
    {
      field: 'created_at', headerName: t('date'), width: 180,
      valueFormatter: (v: string) => v ? new Date(v).toLocaleString() : '',
    },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <AdminPanelSettings color="primary" />
        <Typography variant="h5" fontWeight={700}>{t('adminPanel')}</Typography>
      </Stack>

      <Paper sx={{ mb: 3, borderTop: '4px solid', borderTopColor: 'secondary.main', position: 'relative', overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_: SyntheticEvent, v: number) => setTab(v)}>
          <Tab label={t('systemSettings')} />
          <Tab label={t('activityLog')} />
          <Tab label={t('logsViewer')} />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper sx={{ p: 2, borderTop: '4px solid', borderTopColor: 'secondary.main', position: 'relative', overflow: 'hidden' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">{t('systemSettings')}</Typography>
            <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setCreateDialog({ open: true, key: '', value: '', description: '' })}>
              {t('add')}
            </Button>
          </Stack>
          <DataGrid
            rows={settings}
            columns={settingColumns}
            loading={loading.settings}
            getRowId={(r: any) => r.key}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            density="compact"
          />
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2, borderTop: '4px solid', borderTopColor: 'secondary.main', position: 'relative', overflow: 'hidden' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('filter')}</InputLabel>
              <Select value={actionFilter} label={t('filter')} onChange={(e: any) => setActionFilter(e.target.value)}>
                <MenuItem value="">{t('all')}</MenuItem>
                <MenuItem value="create">Create</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
                <MenuItem value="approve">Approve</MenuItem>
                <MenuItem value="reject">Reject</MenuItem>
                <MenuItem value="submit">Submit</MenuItem>
                <MenuItem value="pay">Pay</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title={t('refresh')}>
              <IconButton onClick={fetchActivity}><Refresh /></IconButton>
            </Tooltip>
          </Stack>
          <DataGrid
            rows={activity}
            columns={activityColumns}
            loading={loading.activity}
            getRowId={(r: any) => r.id}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            density="compact"
          />
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 2, borderTop: '4px solid', borderTopColor: 'secondary.main', position: 'relative', overflow: 'hidden' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('lines')}</InputLabel>
              <Select value={logLines} label={t('lines')} onChange={(e: any) => setLogLines(Number(e.target.value))}>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={200}>200</MenuItem>
                <MenuItem value={500}>500</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title={t('refresh')}>
              <IconButton onClick={fetchLogs}><Refresh /></IconButton>
            </Tooltip>
          </Stack>
          {loading.logs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : logs.length === 0 ? (
            <Alert severity="info">{t('noData')}</Alert>
          ) : (
            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.900', color: 'success.light', p: 2, borderRadius: 1,
                fontFamily: 'monospace', fontSize: '0.75rem', maxHeight: 600, overflow: 'auto',
                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}
            >
              {logs.join('\n')}
            </Box>
          )}
        </Paper>
      )}

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, key: '', value: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('edit')}: {editDialog.key}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth margin="dense" label={t('settingValue')}
            value={editDialog.value} onChange={(e: any) => setEditDialog(prev => ({ ...prev, value: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, key: '', value: '' })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleEditSave}>{t('save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createDialog.open} onClose={() => setCreateDialog({ open: false, key: '', value: '', description: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('add')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth margin="dense" label={t('settingKey')}
            value={createDialog.key} onChange={(e: any) => setCreateDialog(prev => ({ ...prev, key: e.target.value }))}
          />
          <TextField
            fullWidth margin="dense" label={t('settingValue')}
            value={createDialog.value} onChange={(e: any) => setCreateDialog(prev => ({ ...prev, value: e.target.value }))}
          />
          <TextField
            fullWidth margin="dense" label={t('settingDescription')}
            value={createDialog.description} onChange={(e: any) => setCreateDialog(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog({ open: false, key: '', value: '', description: '' })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleCreateSave}>{t('save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
