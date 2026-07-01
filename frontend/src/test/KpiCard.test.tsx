import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import KpiCard from '../components/DashboardWidgets/KpiCard';

beforeEach(() => {
  document.documentElement.style.setProperty('--clr-gold-500', '#d4a030');
  document.documentElement.style.setProperty('--clr-green-500', '#10b981');
  document.documentElement.style.setProperty('--clr-amber-500', '#f59e0b');
  document.documentElement.style.setProperty('--clr-red-500', '#ef4444');
  document.documentElement.style.setProperty('--clr-blue-500', '#3b82f6');
  document.documentElement.style.setProperty('--clr-text', '#141b2d');
  document.documentElement.style.setProperty('--clr-text-secondary', '#718096');
});

describe('KpiCard', () => {
  it('renders title and value', () => {
    render(<KpiCard title="Active Projects" value="18" />);
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<KpiCard title="Test" value="5" subtitle="Since last month" />);
    expect(screen.getByText('Since last month')).toBeInTheDocument();
  });

  it('renders icon with default chart icon', () => {
    const { container } = render(<KpiCard title="Test" value="1" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with different color variants', () => {
    const colors = ['gold', 'green', 'amber', 'red', 'blue'];
    for (const color of colors) {
      const { unmount } = render(<KpiCard title={color} value="1" color={color} />);
      expect(screen.getByText(color)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders custom icon name', () => {
    const { container } = render(<KpiCard title="Test" value="1" icon="projects" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
