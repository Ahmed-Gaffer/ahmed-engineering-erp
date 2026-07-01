import { createTheme } from '@mui/material/styles';

const getCssVar = (name: string, fallback: string): string => {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

const getTheme = (lang: string, mode: 'light' | 'dark' = 'light') => {
  const isDark = mode === 'dark';
  const gold = getCssVar('--clr-gold-500', '#d4a030');
  const goldLight = getCssVar('--clr-gold-400', '#e2b94c');
  const goldDark = getCssVar('--clr-gold-600', '#b8860b');
  const navy = getCssVar('--clr-navy-800', '#141b2d');

  return createTheme({
    direction: lang === 'ar' ? 'rtl' : 'ltr',
    palette: {
      mode,
      primary: { main: navy, light: '#1a2338', dark: '#0a0f1e', contrastText: '#fff' },
      secondary: { main: gold, light: goldLight, dark: goldDark, contrastText: '#fff' },
      success: { main: '#10b981', light: '#34d399', dark: '#059669', contrastText: '#fff' },
      warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706', contrastText: navy },
      error: { main: '#ef4444', light: '#f87171', dark: '#dc2626', contrastText: '#fff' },
      info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', contrastText: '#fff' },
      ...(isDark ? {
        background: { default: '#0a0f1e', paper: '#141b2d' },
        text: { primary: '#e8ecf1', secondary: '#8896a6' },
        divider: 'rgba(255,255,255,0.06)',
      } : {
        background: { default: '#f0f4f8', paper: '#ffffff' },
        text: { primary: '#141b2d', secondary: '#718096' },
        divider: 'rgba(0,0,0,0.06)',
      }),
    },
    typography: {
      fontFamily: lang === 'ar' ? '"Cairo", sans-serif' : '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.03em', fontSize: '2.25rem' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.75rem' },
      h3: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.5rem' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.25rem' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.0625rem' },
      h6: { fontWeight: 600, fontSize: '0.8125rem' },
      subtitle1: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.5 },
      subtitle2: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.5 },
      body1: { fontSize: '0.875rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      caption: { fontSize: '0.75rem', lineHeight: 1.4, fontWeight: 400 },
      overline: { fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    shadows: [
      'none',
      getCssVar('--shadow-xs', isDark ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(10,15,30,0.04)'),
      getCssVar('--shadow-sm', isDark ? '0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.2)' : '0 1px 3px rgba(10,15,30,0.05), 0 1px 2px rgba(10,15,30,0.04)'),
      getCssVar('--shadow-md', isDark ? '0 4px 6px rgba(0,0,0,0.25)' : '0 4px 6px rgba(10,15,30,0.06)'),
      getCssVar('--shadow-lg', isDark ? '0 8px 16px rgba(0,0,0,0.3)' : '0 8px 16px rgba(10,15,30,0.06)'),
      'none', 'none', 'none', 'none', 'none',
      'none', 'none', 'none', 'none', 'none',
      'none', 'none', 'none', 'none', 'none',
      'none', 'none', 'none', 'none', 'none',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#2d3a50 transparent' : '#cbd5e0 transparent',
            '&::-webkit-scrollbar': { width: 5, height: 5 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? '#2d3a50' : '#cbd5e0',
              borderRadius: 3,
              '&:hover': { backgroundColor: isDark ? '#4a5568' : '#a0aec0' },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8, padding: '10px 20px', fontSize: '0.8125rem',
            transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
          },
          containedPrimary: {
            '&:hover': { boxShadow: `0 4px 12px rgba(20,27,45,0.3)`, transform: 'translateY(-1px)' },
          },
          containedSecondary: {
            '&:hover': { boxShadow: `0 4px 12px ${gold}40`, transform: 'translateY(-1px)' },
          },
          sizeSmall: { padding: '6px 12px', fontSize: '0.75rem' },
          sizeLarge: { padding: '14px 28px', fontSize: '0.875rem' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: { root: { padding: 24, '&:last-child': { paddingBottom: 24 } } },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backdropFilter: 'blur(16px)' },
          colorInherit: {
            backgroundColor: isDark ? 'rgba(10,15,30,0.8)' : 'rgba(255,255,255,0.78)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: { paper: { border: 'none' } },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none', borderRadius: 12,
            '& .MuiDataGrid-cell': { py: 1.25, '&:focus': { outline: 'none' } },
            '& .MuiDataGrid-row': {
              transition: 'background-color 0.15s ease',
              '&:hover': { backgroundColor: isDark ? 'rgba(212,160,48,0.06)' : 'rgba(212,160,48,0.03)' },
              '&.Mui-selected': { backgroundColor: isDark ? 'rgba(212,160,48,0.12)' : 'rgba(212,160,48,0.05)' },
            },
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              backgroundColor: isDark ? '#0f1525' : '#f8fafc',
            },
            '& .MuiDataGrid-columnHeader': { fontWeight: 600, color: isDark ? '#a0aec0' : '#4a5568' },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
              transition: 'all 0.2s ease',
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${gold}30`,
              },
              '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
              '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16, boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(10,15,30,0.15)' },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontSize: '1rem', fontWeight: 600, padding: '20px 24px 8px' } },
      },
      MuiDialogContent: {
        styleOverrides: { root: { padding: '8px 24px' } },
      },
      MuiDialogActions: {
        styleOverrides: { root: { padding: '16px 24px 20px' } },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.75rem', borderRadius: 6 },
          filled: {
            '&.MuiChip-colorPrimary': { backgroundColor: isDark ? 'rgba(212,160,48,0.2)' : 'rgba(212,160,48,0.1)', color: isDark ? goldLight : goldDark },
            '&.MuiChip-colorSuccess': { backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)', color: isDark ? '#34d399' : '#059669' },
          },
          outlined: {
            '&.MuiChip-colorPrimary': { borderColor: isDark ? 'rgba(212,160,48,0.4)' : 'rgba(212,160,48,0.3)', color: isDark ? goldLight : goldDark },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem',
            borderRadius: 8, minHeight: 40, padding: '8px 16px',
            '&.Mui-selected': { color: gold },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 3, borderRadius: '2px 2px 0 0', backgroundColor: gold },
        },
      },
      MuiToggleButton: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 6, '&.Mui-selected': { backgroundColor: isDark ? `rgba(212,160,48,0.2)` : `rgba(212,160,48,0.1)`, color: gold } } },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: 10, marginTop: 4, boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(10,15,30,0.1)' },
          list: { padding: 4 },
        },
      },
      MuiMenuItem: {
        styleOverrides: { root: { borderRadius: 6, margin: '2px 4px', padding: '10px 16px', fontSize: '0.8125rem' } },
      },
      MuiCheckbox: {
        styleOverrides: { root: { borderRadius: 4, '&.Mui-checked': { color: gold } } },
      },
      MuiSwitch: {
        styleOverrides: {
          root: { width: 44, height: 26, padding: 0, '& .MuiSwitch-switchBase': { padding: 0, margin: 3, '&.Mui-checked': { transform: 'translateX(18px)', color: '#fff', '&+.MuiSwitch-track': { backgroundColor: gold, opacity: 1 } } } },
          thumb: { width: 20, height: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
          track: { borderRadius: 13, backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', opacity: 1 },
        },
      },
      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: 8, transform: 'none' } },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4, height: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
          bar: { borderRadius: 4 },
          barColorPrimary: { backgroundColor: navy },
          barColorSecondary: { backgroundColor: gold },
        },
      },
      MuiBadge: {
        styleOverrides: { badge: { fontWeight: 700, fontSize: '0.6rem', minWidth: 18, height: 18, borderRadius: 9 } },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { borderRadius: 6, padding: '6px 12px', fontSize: '0.75rem' } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, padding: '12px 16px' },
          head: { fontWeight: 600, fontSize: '0.7rem', color: isDark ? '#a0aec0' : '#718096', textTransform: 'uppercase', letterSpacing: '0.04em' },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10, padding: '10px 20px', alignItems: 'flex-start' },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { '&.Mui-focused': { color: gold } },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: { separator: { color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' } },
      },
      MuiBackdrop: {
        styleOverrides: { root: { backdropFilter: 'blur(4px)' } },
      },
    },
  });
};

export default getTheme;
