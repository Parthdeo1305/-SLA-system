import Link from 'next/link';
import { Plus, Search, UserPlus, Zap } from 'lucide-react';

export default function QuickActionPanel() {
  const ACTIONS = [
    { 
      label: 'Create Order', 
      icon: Plus, 
      href: '/orders/new', 
      color: 'bg-indigo-600 hover:bg-indigo-500 text-[var(--color-text-primary)] shadow-indigo-600/20' 
    },
    { 
      label: 'View Delayed', 
      icon: Search, 
      href: '/orders?delayed=true', 
      color: 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)]' 
    },
    { 
      label: 'Assign Agent', 
      icon: UserPlus, 
      href: '/orders?status=Created', 
      color: 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)]' 
    },
  ];

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-amber-400" />
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Quick Actions</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`
              flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold
              transition-all duration-150 active:scale-95 shadow-lg
              ${action.color}
            `}
          >
            <action.icon size={18} />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
