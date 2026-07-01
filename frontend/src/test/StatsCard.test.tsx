import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import type { ReactElement } from 'react';
import StatsCard from '../components/StatsCard/StatsCard';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#141b2d' },
    secondary: { main: '#d4a030' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#3b82f6' },
    text: { secondary: '#718096' },
    background: { paper: '#ffffff' },
  },
});

const renderWithTheme = (ui: ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('StatsCard', () => {
  it('renders title and value', () => {
    renderWithTheme(<StatsCard title="Total Projects" value="42" />);
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders icon', () => {
    renderWithTheme(<StatsCard title="Test" value="1" icon={<span data-testid="custom-icon">*</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('has gold top border', () => {
    const { container } = renderWithTheme(<StatsCard title="Test" value="1" />);
    const card = container.firstChild;
    const goldBorder = card.firstChild;
    expect(goldBorder).toHaveStyle('background-color: #d4a030');
  });

  it('renders positive trend indicator', () => {
    renderWithTheme(<StatsCard title="Test" value="1" trend={15} />);
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('\u2191')).toBeInTheDocument();
  });

  it('renders negative trend indicator', () => {
    renderWithTheme(<StatsCard title="Test" value="1" trend={-8} />);
    expect(screen.getByText('8%')).toBeInTheDocument();
    expect(screen.getByText('\u2193')).toBeInTheDocument();
  });

  it('does not render trend when not provided', () => {
    renderWithTheme(<StatsCard title="Test" value="1" />);
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('handles click when onClick provided', () => {
    const onClick = vi.fn();
    renderWithTheme(<StatsCard title="Test" value="1" onClick={onClick} />);
    const card = screen.getByText('Test').closest('.MuiCard-root')!;
    card.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
