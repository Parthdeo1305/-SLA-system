import { Order } from '@/services/api/orders';
import StatusBadge from '@/components/ui/StatusBadge';
import { format } from 'date-fns';
import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrdersTableProps {
  orders: Order[];
  onRefresh: () => void;
  loading?: boolean;
}

export default function OrdersTable({ orders, loading }: OrdersTableProps) {
  const router = useRouter();

  if (!loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center mb-4">
          <ArrowUpDown size={24} className="text-[var(--color-text-muted)]" />
        </div>
        <p className="text-[var(--color-text-secondary)] font-medium">No orders found</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Try adjusting your filters or create a new order.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {[
              'Order ID',
              'Customer',
              'Status',
              'Agent',
              'Current Location',
              'SLA Deadline',
              'Last Updated',
              '', // For the arrow
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => router.push(`/orders/${order.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(`/orders/${order.id}`);
                }
              }}
              tabIndex={0}
              className={`
                group cursor-pointer transition-all duration-200 outline-none
                hover:bg-[var(--color-surface-hover)] hover:shadow-lg hover:shadow-black/20
                focus:bg-[var(--color-surface-hover)] focus:ring-2 focus:ring-inset focus:ring-indigo-500/50
                ${order.isDelayed ? 'bg-[var(--color-danger-bg-subtle)]' : ''}
              `}
            >
              {/* Order ID */}
              <td className="px-4 py-4">
                <span className="font-mono text-xs font-medium text-[var(--color-brand-text)] bg-[var(--color-brand-bg)] px-2 py-0.5 rounded border border-indigo-500/20">
                  {order.orderId}
                </span>
              </td>

              {/* Customer */}
              <td className="px-4 py-4">
                <p className="font-medium text-[var(--color-text-primary)] truncate max-w-[160px]">
                   {order.customer?.name || 'Unknown'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[160px] mt-0.5">
                  {order.customer?.phone || 'N/A'}
                </p>
              </td>

              {/* Status */}
              <td className="px-4 py-4">
                <StatusBadge
                  status={order.status}
                  isDelayed={order.isDelayed}
                  delayDuration={order.delayDuration}
                  timeUntilDue={order.timeUntilDue}
                />
                {order.isDelayed && order.delayReason && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[var(--color-danger-text)] bg-[var(--color-danger-bg-subtle)] px-1.5 py-0.5 rounded border border-red-400/20 uppercase tracking-tighter">
                      {order.delayReason}
                    </span>
                  </div>
                )}
              </td>

              {/* Agent */}
              <td className="px-4 py-4">
                {order.deliveryAgent?.name ? (
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{order.deliveryAgent.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      {order.deliveryAgent.phone || 'No phone'}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)] italic">Unassigned</span>
                )}
              </td>

              {/* Location */}
              <td className="px-4 py-4">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {order.transitLogs && order.transitLogs.length > 0
                    ? order.transitLogs[order.transitLogs.length - 1].location || 'Facility'
                    : 'Facility'}
                </span>
              </td>

              {/* SLA Deadline */}
              <td className="px-4 py-4">
                <p className={`text-sm ${order.isDelayed ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {format(new Date(order.promisedDeliveryTime), 'dd MMM yyyy')}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {format(new Date(order.promisedDeliveryTime), 'HH:mm')}
                </p>
              </td>

              {/* Last Updated */}
              <td className="px-4 py-4 text-[var(--color-text-muted)] text-xs">
                {format(new Date(order.updatedAt), 'dd MMM, HH:mm')}
              </td>

              {/* Right Arrow */}
              <td className="px-4 py-4 text-right">
                <ChevronRight 
                  size={18} 
                  className="inline-block text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] group-hover:translate-x-1 transition-all duration-300" 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
