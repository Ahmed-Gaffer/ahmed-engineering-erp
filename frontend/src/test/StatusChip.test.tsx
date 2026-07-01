import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusChip from '../components/EntityTable/StatusChip';

describe('StatusChip', () => {
  it('renders with label', () => {
    render(<StatusChip label="Approved" status="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders with known status colors', () => {
    const statuses = ['approved', 'rejected', 'pending', 'draft', 'submitted'];
    for (const status of statuses) {
      const { container, unmount } = render(<StatusChip label={status} status={status} />);
      const chip = container.firstChild;
      expect(chip).toBeInTheDocument();
      unmount();
    }
  });

  it('renders with custom status', () => {
    render(<StatusChip label="Custom" status="custom_status" />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});
