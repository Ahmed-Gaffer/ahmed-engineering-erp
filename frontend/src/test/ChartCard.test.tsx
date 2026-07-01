import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChartCard from '../components/DashboardWidgets/ChartCard';

beforeEach(() => {
  document.documentElement.style.setProperty('--clr-gold-500', '#d4a030');
  document.documentElement.style.setProperty('--clr-text-secondary', '#718096');
});

describe('ChartCard', () => {
  it('renders title', () => {
    render(<ChartCard title="Monthly Revenue">content</ChartCard>);
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<ChartCard title="Chart"><div data-testid="chart-content">Chart Here</div></ChartCard>);
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    expect(screen.getByText('Chart Here')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<ChartCard title="Chart" action={<button data-testid="chart-action">Filter</button>}>content</ChartCard>);
    expect(screen.getByTestId('chart-action')).toBeInTheDocument();
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<ChartCard title="Chart" subtitle="Last 30 days">content</ChartCard>);
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });
});
