import { Chip } from '@mui/material';

const defaultColors: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'rgba(148,163,184,0.15)', color: 'var(--clr-navy-400)' },
  active: { bg: 'rgba(59,130,246,0.15)', color: 'var(--clr-blue-500)' },
  submitted: { bg: 'rgba(245,158,11,0.2)', color: 'var(--clr-amber-500)' },
  under_review: { bg: 'rgba(217,119,6,0.2)', color: 'var(--clr-gold-500)' },
  approved: { bg: 'rgba(16,185,129,0.2)', color: 'var(--clr-green-500)' },
  rejected: { bg: 'rgba(239,68,68,0.2)', color: 'var(--clr-red-500)' },
  closed: { bg: 'rgba(148,163,184,0.15)', color: 'var(--clr-navy-400)' },
  completed: { bg: 'rgba(16,185,129,0.15)', color: 'var(--clr-green-500)' },
  suspended: { bg: 'rgba(245,158,11,0.15)', color: 'var(--clr-amber-500)' },
};

const priorityColors: Record<string, { color: string }> = {
  low: { color: 'var(--clr-navy-400)' },
  medium: { color: 'var(--clr-amber-500)' },
  high: { color: 'var(--clr-red-500)' },
  urgent: { color: 'var(--clr-red-600)' },
};

interface StatusChipProps {
  status: string;
  type?: 'status' | 'priority';
  label?: string;
}

export default function StatusChip({ status, type = 'status', label }: StatusChipProps) {
  const map = type === 'priority' ? priorityColors : defaultColors;
  const sc = map[status] || defaultColors.draft;
  const isStatus = type === 'status';
  return (
    <Chip
      label={label || status}
      size="small"
      sx={{
        backgroundColor: sc.bg,
        color: sc.color,
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
        ...(isStatus && { '&::before': { content: '""', display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: sc.color, marginRight: 4 } }),
      }}
    />
  );
}
