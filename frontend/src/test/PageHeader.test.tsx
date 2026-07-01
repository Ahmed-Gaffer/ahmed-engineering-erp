import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import type { ReactElement } from 'react';
import PageHeader from '../components/PageHeader/PageHeader';

vi.mock('framer-motion', () => ({
  motion: { div: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} /> },
}));

const theme = createTheme({
  palette: { mode: 'light', text: { secondary: '#718096' } },
  breakpoints: { keys: ['xs', 'sm', 'md', 'lg', 'xl'], values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
});

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('PageHeader', () => {
  it('renders title', () => {
    renderWithTheme(<PageHeader title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderWithTheme(<PageHeader title="Dashboard" subtitle="Overview of all projects" />);
    expect(screen.getByText('Overview of all projects')).toBeInTheDocument();
  });

  it('renders refresh button when onRefresh provided', () => {
    const onRefresh = vi.fn();
    renderWithTheme(<PageHeader title="Dashboard" onRefresh={onRefresh} />);
    const btn = screen.getByRole('button', { name: /refresh/i });
    btn.click();
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders export button when onExport provided', () => {
    const onExport = vi.fn();
    renderWithTheme(<PageHeader title="Dashboard" onExport={onExport} />);
    const btn = screen.getByRole('button', { name: /export/i });
    btn.click();
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('renders action button when action and onAction provided', () => {
    const onAction = vi.fn();
    renderWithTheme(<PageHeader title="Dashboard" action onAction={onAction} actionLabel="Create" />);
    const btn = screen.getByRole('button', { name: /create/i });
    expect(btn).toBeInTheDocument();
  });

  it('renders stats chips when stats provided', () => {
    const stats = [{ label: 'Active', value: 12 }, { label: 'Total', value: 45 }];
    renderWithTheme(<PageHeader title="Dashboard" stats={stats} />);
    expect(screen.getByText('Active: 12')).toBeInTheDocument();
    expect(screen.getByText('Total: 45')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    renderWithTheme(<PageHeader title="Dashboard" icon={<span data-testid="header-icon">*</span>} />);
    expect(screen.getByTestId('header-icon')).toBeInTheDocument();
  });
});
