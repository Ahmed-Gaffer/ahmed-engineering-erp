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
  // Material Test statuses
  materialTestStatus_requested: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  materialTestStatus_sampled: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  materialTestStatus_tested: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  materialTestStatus_completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  materialTestStatus_cancelled: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  // Specification statuses
  specStatus_active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  specStatus_superseded: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  specStatus_archived: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  // Survey Point statuses
  surveyStatus_active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  surveyStatus_destroyed: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  surveyStatus_replaced: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  // ITP statuses
  itpStatus_draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  itpStatus_submitted: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  itpStatus_review: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  itpStatus_approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  itpStatus_rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  itpStatus_archived: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  // Method Statement statuses
  methodStatementStatus_draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  methodStatementStatus_submitted: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  methodStatementStatus_under_review: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  methodStatementStatus_approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  methodStatementStatus_rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  // Permit statuses
  permitStatus_draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  permitStatus_submitted: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  permitStatus_approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  permitStatus_issued: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  permitStatus_activated: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  permitStatus_completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  permitStatus_cancelled: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  permitStatus_rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};
