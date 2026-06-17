import { createTheme } from '@mui/material/styles';

const getTheme = (lang, mode = 'light') => createTheme({
  direction: lang === 'ar' ? 'rtl' : 'ltr',
  palette: {
    mode,
    primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', contrastText: '#fff' },
    secondary: { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2', contrastText: '#fff' },
    success: { main: '#10b981', light: '#34d399', dark: '#059669', contrastText: '#fff' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706', contrastText: '#fff' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626', contrastText: '#fff' },
    info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', contrastText: '#fff' },
    ...(mode === 'dark' ? {
      background: { default: '#0f172a', paper: '#1e293b' },
      text: { primary: '#f1f5f9', secondary: '#94a3b8' },
      divider: 'rgba(255,255,255,0.06)',
    } : {
      background: { default: '#f1f5f9', paper: '#ffffff' },
      text: { primary: '#1e293b', secondary: '#64748b' },
      divider: 'rgba(0,0,0,0.06)',
    }),
  },
  typography: {
    fontFamily: lang === 'ar' ? '"Cairo", sans-serif' : '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: '#64748b' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
    '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
    '0 10px 15px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.04)',
    '0 20px 25px rgba(0,0,0,0.04), 0 10px 10px rgba(0,0,0,0.02)',
    '0 25px 50px rgba(0,0,0,0.1)',
    ...Array(19).fill('0 4px 12px rgba(0,0,0,0.04)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent',
          '&::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 3 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', fontWeight: 600, borderRadius: 8, padding: '8px 20px',
          fontSize: '0.875rem', transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
        },
        containedPrimary: { background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' },
        containedSecondary: { background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)' },
        containedSuccess: { background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
        sizeSmall: { padding: '4px 14px', fontSize: '0.8125rem' },
        sizeLarge: { padding: '12px 28px', fontSize: '1rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14, border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { '&:last-child': { paddingBottom: 24 } } },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          '&[elevation]': { boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.85)' },
        colorInherit: { backgroundColor: 'rgba(255,255,255,0.85)' },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { border: 'none', boxShadow: 'none' } },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none', borderRadius: 14,
          '& .MuiDataGrid-cell': { py: 1.5, '&:focus': { outline: 'none' } },
          '& .MuiDataGrid-row': {
            transition: 'background-color 0.2s ease',
            '&:hover': { backgroundColor: 'rgba(99,102,241,0.03)' },
            '&.Mui-selected': { backgroundColor: 'rgba(99,102,241,0.06)', '&:hover': { backgroundColor: 'rgba(99,102,241,0.08)' } },
          },
          '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid rgba(0,0,0,0.06)', backgroundColor: '#fafbfc' },
          '& .MuiDataGrid-columnHeader': { fontWeight: 600, color: '#475569' },
          '& .MuiDataGrid-footerContainer': { borderTop: '1px solid rgba(0,0,0,0.06)' },
          '& .MuiCheckbox-root': { color: '#94a3b8' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, backgroundColor: '#fff',
            transition: 'box-shadow 0.2s ease',
            '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
            '&.Mui-focused': { boxShadow: '0 2px 12px rgba(99,102,241,0.12)' },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.1)' },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontSize: '1.125rem', fontWeight: 700, paddingBottom: 8 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: '0.75rem', borderRadius: 6 },
        filled: { '&.MuiChip-colorSuccess': { backgroundColor: 'rgba(16,185,129,0.12)', color: '#059669' } },
      },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: 6, padding: '6px 12px', fontSize: '0.75rem' } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { borderRadius: 8, margin: '2px 6px', '&.Mui-selected': { backgroundColor: 'rgba(99,102,241,0.08)' } } },
    },
    MuiList: {
      styleOverrides: { padding: { paddingTop: 4, paddingBottom: 4 } },
    },
  },
});

export default getTheme;
