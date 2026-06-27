import { createTheme } from '@mui/material/styles';

const getTheme = (lang, mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    direction: lang === 'ar' ? 'rtl' : 'ltr',
    palette: {
      mode,
      primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', contrastText: '#fff' },
      secondary: { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2', contrastText: '#fff' },
      success: { main: '#10b981', light: '#34d399', dark: '#059669', contrastText: '#fff' },
      warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706', contrastText: '#fff' },
      error: { main: '#ef4444', light: '#f87171', dark: '#dc2626', contrastText: '#fff' },
      info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', contrastText: '#fff' },
      ...(isDark ? {
        background: { default: '#0f172a', paper: '#1e293b' },
        text: { primary: '#f1f5f9', secondary: '#94a3b8' },
        divider: 'rgba(255,255,255,0.08)',
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
      caption: { fontSize: '0.75rem', lineHeight: 1.4 },
    },
    shape: { borderRadius: 10 },
    shadows: [
      'none',
      isDark
        ? '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)'
        : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
      isDark
        ? '0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)'
        : '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
      isDark
        ? '0 10px 15px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.4)'
        : '0 10px 15px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.04)',
      isDark
        ? '0 20px 25px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.3)'
        : '0 20px 25px rgba(0,0,0,0.04), 0 10px 10px rgba(0,0,0,0.02)',
      isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.1)',
      ...Array(19).fill(isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.04)'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#475569 transparent' : '#cbd5e1 transparent',
            '&::-webkit-scrollbar': { width: 6, height: 6 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? '#475569' : '#cbd5e1',
              borderRadius: 3,
            },
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
            borderRadius: 14,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)'
              : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
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
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backdropFilter: 'blur(12px)' },
          colorInherit: {
            backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
          },
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
              '&:hover': { backgroundColor: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.03)' },
              '&.Mui-selected': { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)' },
            },
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              backgroundColor: isDark ? '#1a2332' : '#fafbfc',
            },
            '& .MuiDataGrid-columnHeader': { fontWeight: 600, color: isDark ? '#cbd5e1' : '#475569' },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            },
            '& .MuiCheckbox-root': { color: isDark ? '#64748b' : '#94a3b8' },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
              transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
              '&:hover': { boxShadow: `0 2px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)'}` },
              '&.Mui-focused': { boxShadow: '0 2px 12px rgba(99,102,241,0.12)' },
            },
            '& .MuiInputBase-input': {
              color: isDark ? '#f1f5f9' : undefined,
              ...(isDark ? {
                '&:-webkit-autofill': {
                  WebkitTextFillColor: '#f1f5f9',
                  WebkitBoxShadow: '0 0 0px 1000px #1e293b inset',
                  transition: 'background-color 5000s ease-in-out 0s',
                },
                '&:-webkit-autofill:hover': {
                  WebkitTextFillColor: '#f1f5f9',
                  WebkitBoxShadow: '0 0 0px 1000px #1e293b inset',
                },
                '&:-webkit-autofill:focus': {
                  WebkitTextFillColor: '#f1f5f9',
                  WebkitBoxShadow: '0 0 0px 1000px #1e293b inset',
                },
              } : {}),
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16, boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.1)' },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontSize: '1.125rem', fontWeight: 700, paddingBottom: 8 } },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500, fontSize: '0.75rem', borderRadius: 6 },
          filled: {
            '&.MuiChip-colorSuccess': {
              backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)',
              color: isDark ? '#34d399' : '#059669',
            },
          },
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
      MuiInputLabel: {
        styleOverrides: {
          root: {
            '&.Mui-focused': { color: '#6366f1' },
          },
        },
      },
    },
  });
};

export default getTheme;
