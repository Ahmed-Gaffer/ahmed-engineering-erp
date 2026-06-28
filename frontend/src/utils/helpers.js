export const formatNumber = (n) => {
  if (n == null) return '';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n));
};

export const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-CA');
};

export const statusColors = {
  // Submittal statuses
  submittal_draft: 'default',
  submittal_submitted: 'primary',
  submittal_under_review: 'info',
  submittal_approved: 'success',
  submittal_rejected_with_comments: 'error',
  submittal_resubmitted: 'warning',
  submittal_closed: 'default',
  // Inspection statuses
  inspection_planned: 'info',
  inspection_submitted: 'primary',
  inspection_inspected: 'warning',
  inspection_passed: 'success',
  inspection_failed: 'error',
  inspection_re_inspection: 'warning',
  // Punch list statuses
  punchlist_open: 'error',
  punchlist_in_progress: 'info',
  punchlist_completed: 'warning',
  punchlist_verified: 'primary',
  punchlist_accepted: 'success',
  // Transmittal statuses
  transmittal_draft: 'default',
  transmittal_sent: 'primary',
  transmittal_received: 'info',
  transmittal_acknowledged: 'success',
  transmittal_closed: 'default',
  active: 'success',
  planning: 'info',
  not_started: 'default',
  building: 'info',
  infrastructure: 'secondary',
  industrial: 'warning',
  residential: 'info',
  commercial: 'primary',
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
  // Safety Incident statuses
  incident_reported: 'error',
  incident_investigating: 'warning',
  incident_action_taken: 'info',
  incident_closed: 'success',
  // Safety Observation statuses
  observation_open: 'error',
  observation_acknowledged: 'warning',
  observation_resolved: 'success',
  observation_closed: 'default',
  // Branch statuses
  branch_active: 'success',
  branch_inactive: 'default',
  // Cost code statuses
  costcode_active: 'success',
  costcode_inactive: 'default',
};
