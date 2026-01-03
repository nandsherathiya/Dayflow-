import { cn } from '@/lib/utils';

type StatusType = 'pending' | 'approved' | 'rejected' | 'present' | 'absent' | 'half_day' | 'leave';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'status-pending',
  },
  approved: {
    label: 'Approved',
    className: 'status-approved',
  },
  rejected: {
    label: 'Rejected',
    className: 'status-rejected',
  },
  present: {
    label: 'Present',
    className: 'status-present',
  },
  absent: {
    label: 'Absent',
    className: 'status-absent',
  },
  half_day: {
    label: 'Half Day',
    className: 'status-half-day',
  },
  leave: {
    label: 'On Leave',
    className: 'status-leave',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
