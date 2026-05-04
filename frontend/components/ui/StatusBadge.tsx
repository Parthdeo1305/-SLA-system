import { OrderStatus } from '@/services/api/orders';

interface StatusBadgeProps {
  status: OrderStatus;
  isDelayed?: boolean;
  delayDuration?: string | null;
  timeUntilDue?: string | null;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  Created: 'bg-slate-800 text-slate-300 border-slate-700',
  Picked: 'bg-blue-950 text-blue-300 border-blue-800',
  'In Transit': 'bg-amber-950 text-amber-300 border-amber-800',
  Delivered: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  Failed: 'bg-red-950 text-red-400 border-red-900',
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
    ${isDelayed ? 'bg-red-950 text-red-400 border-red-900' : isWarning ? 'bg-amber-950 text-amber-300 border-amber-800' : STATUS_STYLES[status]}`;

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
        <span className="text-xs text-red-400 font-medium pl-1">
          +{delayDuration} late
        </span>
      )}
      {isWarning && timeUntilDue && (
        <span className="text-xs text-amber-400 font-medium pl-1">
          ⚡ {timeUntilDue}
        </span>
      )}
    </div>
  );
}
