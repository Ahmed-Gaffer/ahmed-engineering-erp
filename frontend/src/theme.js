import { createTheme } from '@mui/material/styles';

const getTheme = (lang, mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    direction: lang === 'ar' ? 'rtl' : 'ltr',
    palette: {
      mode,
      primary: { main: '#0F172A', light: '#1E293B', dark: '#0B1222', contrastText: '#fff' },
      secondary: { main: '#D97706', light: '#F59E0B', dark: '#B45309', contrastText: '#fff' },
      success: { main: '#10b981', light: '#34d399', dark: '#059669', contrastText: '#fff' },
      warning: { main: '#D97706', light: '#F59E0B', dark: '#B45309', contrastText: '#fff' },
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
      h1: { fontFamily: '"Montserrat", "Inter", sans-serif', fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontFamily: '"Montserrat", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontFamily: '"Montserrat", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontFamily: '"Montserrat", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontFamily: '"Montserrat", "Inter", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      caption: { fontSize: '0.75rem', lineHeight: 1.4 },
    },
    shape: { borderRadius: 10 },
    shadows: [
      'none',
      isDark
        ? '0 1px 2px rgba(0,0,0,0.3)'
        : '0 1px 2px rgba(0,0,0,0.04)',
      isDark
        ? '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.3)'
        : '0 2px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.04)',
      isDark
        ? '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)'
        : '0 4px 8px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.04)',
      isDark
        ? '0 6px 12px rgba(0,0,0,0.3), 0 3px 6px rgba(0,0,0,0.25)'
        : '0 6px 12px rgba(0,0,0,0.04), 0 3px 6px rgba(0,0,0,0.04)',
      isDark
        ? '0 10px 20px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.25)'
        : '0 10px 20px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.04)',
      isDark
        ? '0 14px 28px rgba(0,0,0,0.35), 0 5px 12px rgba(0,0,0,0.25)'
        : '0 14px 28px rgba(0,0,0,0.04), 0 5px 12px rgba(0,0,0,0.04)',
      isDark
        ? '0 20px 40px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.25)'
        : '0 20px 40px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.04)',
      isDark
        ? '0 24px 48px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)'
        : '0 24px 48px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.04)',
      isDark
        ? '0 28px 56px rgba(0,0,0,0.45), 0 10px 24px rgba(0,0,0,0.25)'
        : '0 28px 56px rgba(0,0,0,0.04), 0 10px 24px rgba(0,0,0,0.04)',
      isDark
        ? '0 32px 64px rgba(0,0,0,0.5), 0 12px 28px rgba(0,0,0,0.3)'
        : '0 32px 64px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.04)',
      ...Array(14).fill(isDark
        ? '0 8px 24px rgba(0,0,0,0.35)'
        : '0 8px 24px rgba(0,0,0,0.06)'),
    ],
    transitions: {
      duration: { shortest: 150, shorter: 200, short: 250, standard: 300, complex: 375, enteringScreen: 225, leavingScreen: 195 },
      easing: { easeInOut: 'cubic-bezier(0.4,0,0.2,1)', easeOut: 'cubic-bezier(0,0,0.2,1)', easeIn: 'cubic-bezier(0.4,0,1,1)', sharp: 'cubic-bezier(0.4,0,0.6,1)' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#475569 transparent' : '#cbd5e1 transparent',
            '&::-webkit-scrollbar': { width: 5, height: 5 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? '#475569' : '#cbd5e1',
              borderRadius: 3,
              '&:hover': { backgroundColor: isDark ? '#64748b' : '#94a3b8' },
            },
          },
          '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
          '@keyframes shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
          '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
          '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
        },
      },
      MuiButtonBase: {
        defaultProps: { disableRipple: false },
        styleOverrides: {         root: { '&.Mui-focusVisible': { outline: `2px solid #D97706`, outlineOffset: 2 } } },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', fontWeight: 600, borderRadius: 8, padding: '8px 20px',
            fontSize: '0.875rem', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            '&:hover': { transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0)' },
          },
          containedPrimary: { background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', '&:hover': { boxShadow: '0 6px 20px rgba(15,23,42,0.35)' } },
          containedSecondary: { background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)', '&:hover': { boxShadow: '0 6px 20px rgba(217,119,6,0.35)' } },
          containedSuccess: { background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', '&:hover': { boxShadow: '0 6px 20px rgba(16,185,129,0.35)' } },
          containedWarning: { background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#1e293b', '&:hover': { boxShadow: '0 6px 20px rgba(245,158,11,0.35)' } },
          containedError: { background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', '&:hover': { boxShadow: '0 6px 20px rgba(239,68,68,0.35)' } },
          containedInfo: { background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', '&:hover': { boxShadow: '0 6px 20px rgba(59,130,246,0.35)' } },
          outlined: { '&:hover': { transform: 'translateY(-1px)' } },
          text: { '&:hover': { transform: 'translateY(-1px)', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' } },
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
            transition: 'box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.2s cubic-bezier(0.4,0,0.2,1)',
            '&:hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)'
                : '0 8px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: { root: { '&:last-child': { paddingBottom: 24 } } },
      },
      MuiCardActions: {
        styleOverrides: { root: { padding: '8px 16px 16px' } },
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
                '&:hover': { backgroundColor: isDark ? 'rgba(217,119,6,0.08)' : 'rgba(217,119,6,0.03)' },
                '&.Mui-selected': { backgroundColor: isDark ? 'rgba(217,119,6,0.15)' : 'rgba(217,119,6,0.06)' },
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
              '&.Mui-focused': { boxShadow: '0 2px 12px rgba(217,119,6,0.12)' },
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
          root: { fontWeight: 600, fontSize: '0.75rem', borderRadius: 6, transition: 'all 0.2s ease' },
          filled: {
            '&.MuiChip-colorPrimary': { backgroundColor: isDark ? 'rgba(217,119,6,0.2)' : 'rgba(217,119,6,0.1)', color: isDark ? '#F59E0B' : '#D97706' },
            '&.MuiChip-colorSecondary': { backgroundColor: isDark ? 'rgba(217,119,6,0.2)' : 'rgba(217,119,6,0.1)', color: isDark ? '#F59E0B' : '#D97706' },
            '&.MuiChip-colorSuccess': { backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)', color: isDark ? '#34d399' : '#059669' },
            '&.MuiChip-colorWarning': { backgroundColor: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.12)', color: isDark ? '#fbbf24' : '#b45309' },
            '&.MuiChip-colorError': { backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)', color: isDark ? '#fca5a5' : '#dc2626' },
            '&.MuiChip-colorInfo': { backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color: isDark ? '#93c5fd' : '#2563eb' },
          },
          outlined: {
            borderWidth: 1.5,
            '&.MuiChip-colorPrimary': { borderColor: isDark ? 'rgba(217,119,6,0.4)' : 'rgba(217,119,6,0.3)', color: isDark ? '#F59E0B' : '#D97706' },
            '&.MuiChip-colorSuccess': { borderColor: isDark ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.3)', color: isDark ? '#34d399' : '#10b981' },
            '&.MuiChip-colorWarning': { borderColor: isDark ? 'rgba(245,158,11,0.4)' : 'rgba(245,158,11,0.3)', color: isDark ? '#fbbf24' : '#f59e0b' },
            '&.MuiChip-colorError': { borderColor: isDark ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.3)', color: isDark ? '#fca5a5' : '#ef4444' },
          },
          deleteIcon: { fontSize: 16, '&:hover': { opacity: 0.7 } },
        },
      },
      MuiList: {
        styleOverrides: { padding: { paddingTop: 4, paddingBottom: 4 } },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            '&.Mui-focused': { color: '#D97706' },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none', fontWeight: 600, fontSize: '0.875rem',
            borderRadius: 8, minHeight: 40, padding: '6px 16px',
            '&.Mui-selected': { color: '#D97706' },
            '&.Mui-focusVisible': { outline: '2px solid #D97706', outlineOffset: -2 },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 3, borderRadius: '3px 3px 0 0', background: 'linear-gradient(90deg, #D97706, #F59E0B)' },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10, padding: '10px 16px', alignItems: 'flex-start' },
          standardSuccess: { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)', border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.15)'}`, color: isDark ? '#6ee7b7' : '#065f46' },
          standardWarning: { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.08)', border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.15)'}`, color: isDark ? '#fcd34d' : '#92400e' },
          standardError: { backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.15)'}`, color: isDark ? '#fca5a5' : '#991b1b' },
          standardInfo: { backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)', border: `1px solid ${isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.15)'}`, color: isDark ? '#93c5fd' : '#1e40af' },
          filledSuccess: { background: 'linear-gradient(135deg, #10b981, #34d399)' },
          filledWarning: { background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#1e293b' },
          filledError: { background: 'linear-gradient(135deg, #ef4444, #f87171)' },
          filledInfo: { background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
          icon: { alignItems: 'center', mr: 1.5 },
          message: { padding: 0 },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: { root: { borderRadius: 8, border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`, padding: 2 } },
      },
      MuiToggleButton: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 6, border: 'none', padding: '4px 14px', '&.Mui-selected': { backgroundColor: isDark ? 'rgba(217,119,6,0.2)' : 'rgba(217,119,6,0.1)', color: '#D97706' } } },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: { borderRadius: 10, boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)', marginTop: 4 },
          listbox: { padding: 4, '& .MuiAutocomplete-option': { borderRadius: 6, margin: '2px 0' } },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: 10, boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)', marginTop: 4 },
          list: { padding: 4 },
        },
      },
      MuiMenuItem: {
        styleOverrides: { root: { borderRadius: 6, margin: '2px 4px', padding: '8px 12px', '&.Mui-selected': { backgroundColor: isDark ? 'rgba(217,119,6,0.15)' : 'rgba(217,119,6,0.08)' }, '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' } } },
      },
      MuiSelect: {
        styleOverrides: { root: { borderRadius: 8 }, select: { padding: '8px 14px' } },
      },
      MuiCheckbox: {
        styleOverrides: { root: { borderRadius: 6, '&.Mui-checked': { color: '#D97706' } } },
      },
      MuiSwitch: {
        styleOverrides: {
          root: { width: 42, height: 26, padding: 0, '& .MuiSwitch-switchBase': { padding: 0, margin: 2, '&.Mui-checked': { transform: 'translateX(16px)', color: '#fff', '&+.MuiSwitch-track': { backgroundColor: '#D97706', opacity: 1 } } } },
          thumb: { width: 22, height: 22, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
          track: { borderRadius: 13, backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', opacity: 1 },
        },
      },
      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: 8, transform: 'none' } },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4, height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
          bar: { borderRadius: 4 },
          barColorPrimary: { background: 'linear-gradient(90deg, #0F172A, #1E293B)' },
          barColorSecondary: { background: 'linear-gradient(90deg, #D97706, #F59E0B)' },
        },
      },
      MuiBadge: {
        styleOverrides: { badge: { fontWeight: 700, fontSize: '0.65rem', minWidth: 18, height: 18, borderRadius: 9 } },
      },
      MuiAvatar: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { borderRadius: 6, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 500, boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)' } },
      },
      MuiTable: {
        styleOverrides: { root: { borderCollapse: 'separate', borderSpacing: 0 } },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.15s ease',
            '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' },
            '&.Mui-selected': { backgroundColor: isDark ? 'rgba(217,119,6,0.1)' : 'rgba(217,119,6,0.04)' },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, padding: '12px 16px' },
          head: { fontWeight: 600, fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
        },
      },
      MuiDialogContent: {
        styleOverrides: { root: { paddingTop: 8 } },
      },
      MuiDialogActions: {
        styleOverrides: { root: { padding: '12px 24px 20px' } },
      },
      MuiSnackbarContent: {
        styleOverrides: { root: { borderRadius: 10, fontWeight: 500 } },
      },
      MuiStepLabel: {
        styleOverrides: { label: { fontWeight: 600, '&.Mui-active': { color: '#D97706' }, '&.Mui-completed': { color: '#10b981' } } },
      },
      MuiStepIcon: {
        styleOverrides: { root: { '&.Mui-active': { color: '#D97706' }, '&.Mui-completed': { color: '#10b981' } } },
      },
      MuiBreadcrumbs: {
        styleOverrides: { separator: { color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' } },
      },
      MuiBackdrop: {
        styleOverrides: { root: { backdropFilter: 'blur(2px)' } },
      },
    },
  });
};

export default getTheme;
