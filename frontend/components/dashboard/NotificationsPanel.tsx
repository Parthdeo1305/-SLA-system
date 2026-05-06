import { Bell, Clock } from 'lucide-react';
import Link from 'next/link';

interface NotificationsPanelProps {
  alerts: {
    id: string;
    orderId: string;
    status: string;
    timestamp: string;
    agent?: string;
    note?: string;
  }[];
}

export default function NotificationsPanel({ alerts }: NotificationsPanelProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col h-full shadow-xl">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[var(--color-brand-text)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Recent Activity</h3>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {alerts.length === 0 ? (
          <p className="text-center text-xs text-[var(--color-text-muted)] py-10 italic">
            No recent activity.
          </p>
        ) : (
          alerts.map((alert, i) => (
            <Link key={i} href={`/orders/${alert.id || alert.orderId}`} className="flex gap-3 hover:bg-[var(--color-surface-hover)] p-2 -mx-2 rounded-lg transition-colors cursor-pointer group">
              <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
              <div className="space-y-1">
                <p className="text-xs text-[var(--color-text-primary)] font-medium leading-relaxed">
                  <span className="font-bold text-[var(--color-brand-text)] group-hover:underline">{alert.orderId}</span> moved to{' '}
                  <span className="text-indigo-300">{alert.status}</span>
                  {alert.agent && <span> by {alert.agent}</span>}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                  <Clock size={10} />
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
