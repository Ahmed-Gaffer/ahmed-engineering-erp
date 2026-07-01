import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SvgIcon from '../components/SvgIcon/SvgIcon';

describe('SvgIcon', () => {
  it('renders with default size 24', () => {
    const { container } = render(<SvgIcon name="dashboard" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('renders with custom size', () => {
    const { container } = render(<SvgIcon name="projects" size={32} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('renders with custom color', () => {
    const { container } = render(<SvgIcon name="dashboard" color="#ff0000" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders common icons', () => {
    const icons = ['dashboard', 'projects', 'people', 'document', 'ipc', 'check', 'search', 'close'];
    for (const icon of icons) {
      const { container, unmount } = render(<SvgIcon name={icon} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      unmount();
    }
  });

  it('returns null for unknown icon name', () => {
    const { container } = render(<SvgIcon name="nonexistent-icon" />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
