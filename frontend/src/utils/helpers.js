export const formatNumber = (n) => {
  if (n == null) return '';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n));
};

export const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-CA');
};

export const statusColors = {
  active: 'success',
  suspended: 'warning',
  blacklisted: 'error',
  planned: 'info',
  in_progress: 'primary',
  completed: 'success',
  on_hold: 'warning',
  cancelled: 'error',
  pending: 'default',
  delayed: 'error',
  issued: 'info',
  under_execution: 'primary',
  closed: 'default',
  under_review: 'warning',
  approved: 'success',
  rejected: 'error',
  superseded: 'default',
  as_built: 'success',
  submitted: 'info',
  draft: 'default',
  final: 'success',
  archived: 'default',
  paid: 'success',
  low: 'default',
  medium: 'warning',
  high: 'error',
  urgent: 'error',
  partial: 'warning',
  done: 'success',
};
