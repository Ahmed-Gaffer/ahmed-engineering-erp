import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, TextField, Button, Stack, Grid, Paper, Divider, Avatar, useTheme } from '@mui/material';
import { Save, Edit, Business } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { companyProfileService } from '../../services/api';
import DataGridSkeleton from '../../components/Skeleton/DataGridSkeleton';

export default function CompanyProfile() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    companyProfileService.list({ limit: 1 }).then((res: any) => {
      const items = res.data?.items || res.data || [];
      const p = Array.isArray(items) ? items[0] : items;
      if (p) {
        setProfile(p);
        setForm(p);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: Record<string, any>) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile?.id) {
        const res = await companyProfileService.update(profile.id, form);
        setProfile(res.data);
        setForm(res.data);
      } else {
        const res = await companyProfileService.create(form);
        setProfile(res.data);
        setForm(res.data);
      }
      setEditing(false);
      enqueueSnackbar(t('operationSuccess'), { variant: 'success' });
    } catch { enqueueSnackbar(t('operationFailed'), { variant: 'error' }) } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm(profile || {});
    setEditing(false);
  };

  if (loading) return <DataGridSkeleton />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>{t('companyProfile')}</Typography>
          {!editing ? (
            <Button variant="contained" startIcon={<Edit />} onClick={() => setEditing(true)}>{t('edit')}</Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={handleCancel}>{t('cancel')}</Button>
              <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving}>{saving ? t('loading') : t('save')}</Button>
            </Stack>
          )}
        </Stack>

        <Paper sx={{ p: 3, mb: 3, borderTop: '4px solid', borderTopColor: 'secondary.main', position: 'relative', overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}><Business sx={{ fontSize: 32 }} /></Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>{profile?.company_name_ar || t('companyProfile')}</Typography>
              <Typography variant="body2" color="text.secondary">{profile?.company_name_en || ''}</Typography>
            </Box>
          </Stack>

          <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('basicInfo')}</Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('companyNameAr')} value={form.company_name_ar || ''} onChange={handleChange('company_name_ar')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('companyNameEn')} value={form.company_name_en || ''} onChange={handleChange('company_name_en')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('establishedYear')} type="number" value={form.established_year || ''} onChange={handleChange('established_year')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('phone')} value={form.phone || ''} onChange={handleChange('phone')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('email')} value={form.email || ''} onChange={handleChange('email')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('website')} value={form.website || ''} onChange={handleChange('website')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('address')} value={form.address || ''} onChange={handleChange('address')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('commercialRegister')} value={form.commercial_register || ''} onChange={handleChange('commercial_register')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('taxCard')} value={form.tax_card || ''} onChange={handleChange('tax_card')} disabled={!editing} size="small" />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('aboutCompany')}</Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12}>
              <TextField fullWidth label={t('aboutAr')} multiline rows={3} value={form.about_ar || ''} onChange={handleChange('about_ar')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label={t('aboutEn')} multiline rows={3} value={form.about_en || ''} onChange={handleChange('about_en')} disabled={!editing} size="small" />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('visionMission')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('visionAr')} multiline rows={2} value={form.vision_ar || ''} onChange={handleChange('vision_ar')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('visionEn')} multiline rows={2} value={form.vision_en || ''} onChange={handleChange('vision_en')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('missionAr')} multiline rows={2} value={form.mission_ar || ''} onChange={handleChange('mission_ar')} disabled={!editing} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('missionEn')} multiline rows={2} value={form.mission_en || ''} onChange={handleChange('mission_en')} disabled={!editing} size="small" />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </motion.div>
  );
}
