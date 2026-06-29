import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Stack, Card, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, MenuItem, Tooltip, CircularProgress,
} from '@mui/material';
import {
  Add, Delete, Edit, Refresh, LibraryBooks, Article,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { arSD, enUS } from '@mui/x-data-grid/locales';
import { useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { engineeringApi } from '../../services/api';
import { formatDate, statusColors } from '../../utils/helpers';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import PageHeader from '../../components/PageHeader/PageHeader';

const specStatusOptions = ['active', 'superseded', 'archived'];

export default function Specifications() {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project_id') || '');
  const [scope, setScope] = useState('global');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionDialog, setSectionDialog] = useState({ open: false, specId: null, sections: [], loading: false });
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [editSection, setEditSection] = useState(null);

  useEffect(() => {
    engineeringApi.projects.list().then((r) => {
      const items = r.data || [];
      setProjects(items);
      const urlPid = searchParams.get('project_id');
      if (urlPid && items.some((p) => p.id === Number(urlPid))) {
        setSelectedProjectId(Number(urlPid));
        setScope('project');
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (scope === 'project' && selectedProjectId) params.project_id = selectedProjectId;
      const [listRes, statsRes] = await Promise.all([
        engineeringApi.specifications.list(params),
        engineeringApi.specifications.stats(),
      ]);
      setData(listRes.data || []);
      setStats(statsRes.data || null);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [scope, selectedProjectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = async (q) => {
    setSearchTerm(q);
    if (!q.trim()) { fetchData(); return; }
    setLoading(true);
    try {
      const params = { q };
      if (scope === 'project' && selectedProjectId) params.project_id = selectedProjectId;
      const res = await engineeringApi.specifications.search(params);
      setData(res.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = { ...formData };
      if (scope === 'project' && selectedProjectId) payload.project_id = Number(selectedProjectId);
      if (editItem) await engineeringApi.specifications.update(editItem.id, payload);
      else await engineeringApi.specifications.create(payload);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setFormOpen(false);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await engineeringApi.specifications.delete(id);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setDeleteId(null);
      fetchData();
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const openSections = async (specId) => {
    setSectionDialog(prev => ({ ...prev, open: true, specId, loading: true }));
    try {
      const res = await engineeringApi.specifications.get(specId);
      setSectionDialog(prev => ({ ...prev, sections: res.data?.sections || [], loading: false }));
    } catch {
      setSectionDialog(prev => ({ ...prev, sections: [], loading: false }));
    }
  };

  const handleSectionSubmit = async (formData) => {
    try {
      if (editSection) await engineeringApi.specifications.updateSection(editSection.id, formData);
      else await engineeringApi.specifications.createSection(sectionDialog.specId, formData);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      setSectionFormOpen(false);
      setEditSection(null);
      openSections(sectionDialog.specId);
    } catch (e) {
      enqueueSnackbar(e.response?.data?.detail || t('operationFailed'), { variant: 'error' });
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      await engineeringApi.specifications.deleteSection(sectionId);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
      openSections(sectionDialog.specId);
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }); }
  };

  const columns = [
    { field: 'spec_code', headerName: t('specCode'), width: 130 },
    { field: 'title', headerName: t('title'), flex: 1.5, minWidth: 180 },
    { field: 'division', headerName: t('division'), width: 100 },
    { field: 'issuing_body', headerName: t('issuingBody'), width: 120 },
    { field: 'revision', headerName: t('revision'), width: 90 },
    { field: 'status', headerName: t('status'), width: 110,
      renderCell: (params) => {
        const sc = statusColors[`specStatus_${params.value}`] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
        return <Chip label={t(`specStatus_${params.value}`, params.value)} size="small" sx={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 500 }} />;
      },
    },
    { field: 'actions', headerName: t('actions'), width: 160, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('sections')}>
            <IconButton size="small" onClick={() => openSections(params.row.id)} sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)' }}>
              <Article fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => { setEditItem(params.row); setFormOpen(true); }} sx={{ color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const fields = [
    { name: 'spec_code', label: t('specCode'), required: true },
    { name: 'title', label: t('title'), required: true },
    { name: 'division', label: t('division') },
    { name: 'section', label: t('section') },
    { name: 'issuing_body', label: t('issuingBody') },
    { name: 'revision', label: t('revision') },
    { name: 'effective_date', label: t('effectiveDate'), type: 'date' },
    { name: 'body', label: t('body'), type: 'textarea' },
    { name: 'keywords', label: t('keywords') },
    { name: 'status', label: t('status'), options: specStatusOptions.map(s => ({ value: s, label: t(`specStatus_${s}`) })) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={t('specifications')}
        subtitle="Standards and specifications library"
        icon={<LibraryBooks />}
        action actionLabel={t('create')}
        onAction={() => { setEditItem(null); setFormOpen(true); }}
        stats={[
          { label: t('total'), value: stats?.total || 0 },
          { label: t('byDivision'), value: stats?.by_division || 0 },
          { label: t('byBody'), value: stats?.by_body || 0 },
        ]}
      />
      <Stack direction="row" spacing={1.5} mb={2.5} alignItems="center">
        <Chip label={t('global')} color={scope === 'global' ? 'primary' : 'default'} onClick={() => setScope('global')} size="small" />
        <Chip label={t('byProject')} color={scope === 'project' ? 'primary' : 'default'} onClick={() => setScope('project')} size="small" />
        {scope === 'project' && (
          <TextField select size="small" value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); const p = new URLSearchParams(searchParams); p.set('project_id', e.target.value); setSearchParams(p, { replace: true }); }}
            sx={{ minWidth: 240 }}>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} — {p.name}</MenuItem>)}
          </TextField>
        )}
        <TextField size="small" placeholder={t('searchByKeyword')} value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)} sx={{ minWidth: 200 }} />
        <Button variant="outlined" startIcon={<Refresh />} size="small" onClick={fetchData}>{t('refresh')}</Button>
      </Stack>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={data} columns={columns} getRowId={(r) => r.id}
              pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick
              localeText={i18n.language === 'ar' ? arSD : enUS}
            />
          </Box>
        )}
      </Card>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); const data = {}; fields.forEach(f => { data[f.name] = fd.get(f.name); }); handleSubmit(data); }}>
          <DialogTitle>{editItem ? `${t('edit')} ${t('specification')}` : `${t('create')} ${t('specification')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {fields.map((f) => (
                f.options ? (
                  <TextField key={f.name} select name={f.name} label={f.label} defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth>
                    {f.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                ) : (
                  <TextField key={f.name} name={f.name} label={f.label} type={f.type === 'date' ? 'date' : 'text'}
                    defaultValue={editItem?.[f.name] || ''} required={f.required} size="small" fullWidth
                    multiline={f.type === 'textarea'} minRows={f.type === 'textarea' ? 3 : undefined}
                    slotProps={f.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
                  />
                )
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="contained" disabled={formLoading}>{formLoading ? t('saving') : t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={sectionDialog.open} onClose={() => setSectionDialog({ open: false, specId: null, sections: [] })} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('sections')}</Typography>
            <Button size="small" variant="contained" startIcon={<Add />}
              onClick={() => { setEditSection(null); setSectionFormOpen(true); }}>
              {t('addSection')}
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {sectionDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : sectionDialog.sections.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>{t('noSections')}</Typography>
          ) : (
            <Stack spacing={1.5}>
              {sectionDialog.sections.map((sec) => (
                <Card key={sec.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {sec.section_number && `${sec.section_number}. `}{sec.title}
                      </Typography>
                      {sec.content && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                          {sec.content}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => { setEditSection(sec); setSectionFormOpen(true); }} sx={{ color: '#10b981' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteSection(sec.id)} sx={{ color: '#ef4444' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionDialog({ open: false, specId: null, sections: [] })}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={sectionFormOpen} onClose={() => { setSectionFormOpen(false); setEditSection(null); }} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); const data = { section_number: fd.get('section_number'), title: fd.get('title'), content: fd.get('content') }; handleSectionSubmit(data); }}>
          <DialogTitle>{editSection ? `${t('edit')} ${t('section')}` : `${t('add')} ${t('section')}`}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField name="section_number" label={t('sectionNumber')} defaultValue={editSection?.section_number || ''} size="small" fullWidth />
              <TextField name="title" label={t('title')} defaultValue={editSection?.title || ''} required size="small" fullWidth />
              <TextField name="content" label={t('content')} defaultValue={editSection?.content || ''} multiline minRows={4} size="small" fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setSectionFormOpen(false); setEditSection(null); }}>{t('cancel')}</Button>
            <Button type="submit" variant="contained">{t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
    </motion.div>
  );
}
