import { OrderStatus } from '@/services/api/orders';

interface StatusBadgeProps {
  status: OrderStatus;
  isDelayed?: boolean;
  delayDuration?: string | null;
  timeUntilDue?: string | null;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  Created: 'bg-[var(--badge-created-bg)] text-[var(--badge-created-text)] border-[var(--badge-created-border)]',
  Picked: 'bg-[var(--badge-picked-bg)] text-[var(--badge-picked-text)] border-[var(--badge-picked-border)]',
  'In Transit': 'bg-[var(--badge-transit-bg)] text-[var(--badge-transit-text)] border-[var(--badge-transit-border)]',
  Delivered: 'bg-[var(--badge-delivered-bg)] text-[var(--badge-delivered-text)] border-[var(--badge-delivered-border)]',
  Failed: 'bg-[var(--badge-failed-bg)] text-[var(--badge-failed-text)] border-[var(--badge-failed-border)]',
};

const STATUS_DOTS: Record<OrderStatus, string> = {
  Created: 'bg-slate-400',
  Picked: 'bg-blue-400',
  'In Transit': 'bg-amber-400',
  Delivered: 'bg-emerald-400',
  Failed: 'bg-red-500',
};

export default function StatusBadge({
  status,
  isDelayed,
  delayDuration,
  timeUntilDue,
  size = 'md',
}: StatusBadgeProps) {
  const isWarning = !!timeUntilDue && !isDelayed;

  const baseClasses = `inline-flex items-center gap-1.5 font-medium rounded-full border
    ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}
    ${isDelayed ? 'bg-[var(--badge-failed-bg)] text-[var(--badge-failed-text)] border-[var(--badge-failed-border)]' : isWarning ? 'bg-[var(--badge-transit-bg)] text-[var(--badge-transit-text)] border-[var(--badge-transit-border)]' : STATUS_STYLES[status]}`;

  const dotClass = isDelayed
    ? 'bg-red-500 animate-pulse'
    : isWarning
    ? 'bg-amber-400 animate-pulse'
    : STATUS_DOTS[status];

  return (
    <div className="flex flex-col gap-1">
      <span className={baseClasses}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
        {status}
      </span>
      {isDelayed && delayDuration && (
        <span className="text-xs text-[var(--color-danger-text)] font-medium pl-1">
          +{delayDuration} late
        </span>
      )}
      {isWarning && timeUntilDue && (
        <span className="text-xs text-[var(--badge-transit-text)] font-medium pl-1">
          ⚡ {timeUntilDue}
        </span>
      )}
    </div>
  );
}
