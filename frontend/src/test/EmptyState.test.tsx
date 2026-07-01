import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '../components/EmptyState/EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No projects found" />);
    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Create a new project to get started" />);
    expect(screen.getByText('Create a new project to get started')).toBeInTheDocument();
  });

  it('renders action button when action and onAction provided', () => {
    const onAction = vi.fn();
    render(<EmptyState title="Empty" action onAction={onAction} actionLabel="Create Project" />);
    const btn = screen.getByRole('button', { name: /create project/i });
    expect(btn).toBeInTheDocument();
    btn.click();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when action is false', () => {
    render(<EmptyState title="Empty" actionLabel="Create" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders EmptyIllustration SVG icon', () => {
    const { container } = render(<EmptyState title="Empty" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
