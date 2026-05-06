import Card from '@/components/ui/Card';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'red' | 'slate';
  trend?: string;
  highlight?: boolean;
  onClick?: () => void;
  isActive?: boolean;
  loading?: boolean;
}

const COLOR_MAP = {
  indigo: {
    icon: 'text-indigo-400 bg-indigo-600/15 border-indigo-600/20',
    value: 'text-indigo-300',
    border: '',
  },
  emerald: {
    icon: 'text-emerald-400 bg-emerald-600/15 border-emerald-600/20',
    value: 'text-emerald-300',
    border: '',
  },
  amber: {
    icon: 'text-amber-400 bg-amber-600/15 border-amber-600/20',
    value: 'text-amber-300',
    border: '',
  },
  red: {
    icon: 'text-red-400 bg-red-600/15 border-red-600/20',
    value: 'text-red-400',
    border: 'border-red-900/40',
  },
  slate: {
    icon: 'text-slate-400 bg-slate-600/15 border-slate-600/20',
    value: 'text-slate-300',
    border: '',
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  highlight = false,
  onClick,
  isActive = false,
  loading = false,
}: StatsCardProps) {
  const styles = COLOR_MAP[color];

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 ${isActive ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-[var(--color-bg)] rounded-xl' : 'hover:scale-[1.02]'}`}
    >
      <Card
        hover
        className={`p-5 h-full ${highlight ? 'border-red-900/40 bg-red-950/20' : ''} ${isActive ? 'bg-indigo-600/5 border-indigo-600/30' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
              {title}
            </p>
            {loading ? (
              <div className="h-9 w-16 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
            ) : (
              <p className={`text-3xl font-bold ${styles.value}`}>
                {value.toLocaleString()}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={12} className="text-[var(--color-text-muted)]" />
                <span className="text-xs text-[var(--color-text-muted)]">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-xl border ${styles.icon}`}>
            <Icon size={20} />
          </div>
        </div>
        {highlight && value > 0 && (
          <div className="mt-3 pt-3 border-t border-red-900/30">
            <p className="text-xs text-red-400 font-medium">
              ⚠ Requires immediate attention
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
