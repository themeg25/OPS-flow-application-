const STATUS_STYLES = {
  // deployment
  REQUESTED: 'warning',
  APPROVED: 'info',
  REJECTED: 'danger',
  IN_PROGRESS: 'info',
  COMPLETED_SUCCESS: 'success',
  COMPLETED_FAILED: 'danger',
  ROLLED_BACK: 'warning',

  // access
  ACCESS_GIVEN: 'success',

  // issue / production issue
  OPEN: 'warning',
  RESOLVED: 'success',

  // user
  PENDING: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'neutral',

  // generic
  DELETED: 'neutral',
};

const STYLES = {
  success: 'bg-success-bg text-success-text',
  danger: 'bg-danger-bg text-danger-text',
  warning: 'bg-warning-bg text-warning-text',
  info: 'bg-info-bg text-info-text',
  neutral: 'bg-neutral-bg text-neutral-text',
};

const LABELS = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  IN_PROGRESS: 'In Progress',
  COMPLETED_SUCCESS: 'Success',
  COMPLETED_FAILED: 'Failed',
  ROLLED_BACK: 'Rolled Back',

  ACCESS_GIVEN: 'Access Given',

  OPEN: 'Open',
  RESOLVED: 'Resolved',

  PENDING: 'Pending',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DELETED: 'Deleted',
};

export function StatusBadge({ status, className = '' }) {
  const tone = STATUS_STYLES[status] || 'neutral';
  const label = LABELS[status] || status;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        text-xs font-semibold
        ${STYLES[tone]}
        ${className}
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 rounded-full
          ${
            tone === 'success'
              ? 'bg-success'
              : tone === 'danger'
              ? 'bg-danger'
              : tone === 'warning'
              ? 'bg-warning'
              : tone === 'info'
              ? 'bg-info'
              : 'bg-neutral'
          }
        `}
      />

      {label}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| PRIORITY BADGE
|--------------------------------------------------------------------------
|
| Low      -> 50% red
| Medium   -> 80% red
| High     -> very strong red
| Critical -> maximum / darkest red
|
| All priority text is WHITE.
|
*/

const PRIORITY_STYLES = {
  // LOW - approximately 50% red
  Low: `
    bg-red-500/50
    text-white
    border
    border-red-500/60
  `,

  // MEDIUM - approximately 80% red
  Medium: `
    bg-red-600/80
    text-white
    border
    border-red-600
  `,

  // HIGH - stronger than 100% visual intensity
  // using a darker red rather than invalid opacity > 100%
  High: `
    bg-red-700
    text-white
    border
    border-red-800
  `,

  // CRITICAL - maximum / darkest red
  Critical: `
    bg-red-950
    text-white
    border
    border-red-950
  `,
};

export function PriorityBadge({ priority }) {
  const style =
    PRIORITY_STYLES[priority] ||
    `
      bg-red-500/50
      text-white
      border
      border-red-500/60
    `;

  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-0.5
        rounded-md
        text-[11px]
        font-bold
        uppercase
        tracking-wide
        ${style}
      `}
    >
      {priority}
    </span>
  );
}

export function RecordIdBadge({ id, className = '' }) {
  const prefix = (id || '').split('-')[0];

  const colors = {
    DEP: 'border-brand-400 text-brand-600',
    ACC: 'border-info text-info-text',
    ISS: 'border-warning text-warning-text',
    PRD: 'border-danger text-danger-text',
    USR: 'border-ink-400 text-ink-600',
  };

  return (
    <span
      className={`
        font-mono
        text-xs
        font-semibold
        border-l-[3px]
        pl-2
        pr-1
        py-0.5
        ${colors[prefix] || 'border-ink-300 text-ink-600'}
        ${className}
      `}
    >
      {id}
    </span>
  );
}