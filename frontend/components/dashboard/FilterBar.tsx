'use client';

import Button from '@/components/ui/Button';
import { Search, Filter, AlertTriangle, X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Created', label: 'Created' },
  { value: 'Picked', label: 'Picked' },
  { value: 'In Transit', label: 'In Transit' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Failed', label: 'Failed' },
];

interface FilterBarProps {
  statusFilter: string;
  onStatusChange: (s: string) => void;
  delayedOnly: boolean;
  onDelayedToggle: () => void;
  search: string;
  onSearchChange: (s: string) => void;
  totalResults: number;
}

export default function FilterBar({
  statusFilter,
  onStatusChange,
  delayedOnly,
  onDelayedToggle,
  search,
  onSearchChange,
  totalResults,
}: FilterBarProps) {
  const hasFilters = statusFilter !== 'all' || delayedOnly || search;

  const clearFilters = () => {
    onStatusChange('all');
    if (delayedOnly) onDelayedToggle();
    onSearchChange('');
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="text"
          placeholder="Search orders or customers..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm
            bg-[var(--color-surface-3)] border border-[var(--color-border)]
            text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
            focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
            transition-all duration-150"
        />
      </div>

      {/* Status Filter */}
      <div className="relative flex items-center gap-2">
        <Filter size={14} className="text-[var(--color-text-muted)]" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="pl-3 pr-8 py-2 rounded-lg text-sm appearance-none cursor-pointer
            bg-[var(--color-surface-3)] border border-[var(--color-border)]
            text-[var(--color-text-primary)]
            focus:outline-none focus:border-indigo-500
            transition-all duration-150"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#18181f]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Delayed Toggle */}
      <button
        onClick={onDelayedToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150 cursor-pointer
          ${
            delayedOnly
              ? 'bg-red-900/40 text-red-400 border-red-800'
              : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-red-800 hover:text-red-400'
          }`}
      >
        <AlertTriangle size={13} />
        Delayed Only
      </button>

      {/* Clear filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
          <X size={13} />
          Clear
        </Button>
      )}

      {/* Result count */}
      <p className="text-xs text-[var(--color-text-muted)] ml-auto whitespace-nowrap">
        {totalResults.toLocaleString()} order{totalResults !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
