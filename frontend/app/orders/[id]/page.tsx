'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ordersApi, { Order, OrderStatus } from '@/services/api/orders';
import { agentsApi, Agent } from '@/services/api/agents';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Package,
  Truck,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_FLOW: OrderStatus[] = ['Created', 'Picked', 'In Transit', 'Delivered'];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  Created: 'Picked',
  Picked: 'In Transit',
  'In Transit': 'Delivered',
};

const FAIL_ALLOWED: OrderStatus[] = ['Picked', 'In Transit'];

const DELAY_REASONS = [
  'Traffic',
  'Weather',
  'Vehicle Issue',
  'Warehouse Delay',
  'Address Issue',
  'Other'
];

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  Created: <Package size={14} />,
  Picked: <CheckCircle2 size={14} />,
  'In Transit': <Truck size={14} />,
  Delivered: <CheckCircle2 size={14} />,
  Failed: <AlertTriangle size={14} />,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Form states for status updates
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [transitInfo, setTransitInfo] = useState({ location: '', note: '' });
  const [delayInfo, setDelayInfo] = useState<{ reason: string; note: string }>({ reason: '', note: '' });

  const fetchOrder = async () => {
    try {
      const { order: o } = await ordersApi.get(id);
      setOrder(o);
    } catch {
      setError('Order not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (pendingStatus === 'Picked') {
      agentsApi.list({ status: 'available', isActive: true }).then(setAvailableAgents);
    }
  }, [pendingStatus]);

  const handleUpdate = async (status: OrderStatus) => {
    if (!order) return;

    // Validation for Picked
    if (status === 'Picked' && !selectedAgentId) {
      setUpdateError('Please select a delivery agent.');
      return;
    }

    setUpdateError('');
    setUpdating(true);
    try {
      const payload: any = { status };
      if (status === 'Picked') {
        payload.deliveryAgent = { agent: selectedAgentId };
      }
      if (status === 'In Transit') {
        payload.location = transitInfo.location;
        payload.note = transitInfo.note;
      }
      if (status === 'Delivered' || status === 'Failed') {
        payload.note = transitInfo.note;
      }
      
      // Add delay info if the order is delayed and reason is provided
      if (order.isDelayed && delayInfo.reason) {
        payload.delayReason = delayInfo.reason;
        payload.delayNote = delayInfo.note;
      }

      const { order: updated } = await ordersApi.update(order.id, payload);
      setOrder(updated);
      setPendingStatus(null);
      setSelectedAgentId('');
      setTransitInfo({ location: '', note: '' });
      setDelayInfo({ reason: '', note: '' });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Update failed.';
      setUpdateError(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--color-danger-text)] mb-3">{error || 'Order not found.'}</p>
        <Link href="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_FLOW.indexOf(order.status as OrderStatus);
  const nextStatus = NEXT_STATUS[order.status];
  const canFail = FAIL_ALLOWED.includes(order.status);

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft size={14} />
              Back
            </Button>
          </Link>
          <div className="h-5 w-px bg-[var(--color-border)]" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Order Detail</h1>
              <span className="font-mono text-sm text-[var(--color-brand-text)] bg-[var(--color-brand-bg)] px-2 py-0.5 rounded">
                {order.orderId}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Created {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}
            </p>
          </div>
        </div>
        <StatusBadge
          status={order.status}
          isDelayed={order.isDelayed}
          delayDuration={order.delayDuration}
          timeUntilDue={order.timeUntilDue}
        />
      </div>

      {/* SLA Alert */}
      {order.isDelayed && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/30 border border-red-900/50">
          <AlertTriangle size={18} className="text-[var(--color-danger-text)] flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">
              SLA breached — {order.delayDuration} past deadline
            </p>
            <p className="text-xs text-[var(--color-danger-text)]/70 mt-0.5">
              Advance the status or escalate immediately to minimise penalty impact.
            </p>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <Card className="p-5">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-5">Status Timeline</p>
        <div className="flex items-center gap-0 relative">
          {STATUS_FLOW.map((s, i) => {
            const isDone = i <= currentStep && order.status !== 'Failed';
            const isCurrent = i === currentStep && order.status !== 'Failed';
            const isLast = i === STATUS_FLOW.length - 1;

            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0
                      transition-all duration-300
                      ${isDone ? 'bg-indigo-600 border-indigo-500 text-[var(--color-text-primary)]' : 'bg-[var(--color-surface-3)] border-[var(--color-border)] text-[var(--color-text-muted)]'}
                      ${isCurrent ? 'ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-[var(--color-surface-2)]' : ''}
                    `}
                  >
                    {STATUS_ICONS[s]}
                  </div>
                  <p
                    className={`text-xs text-center leading-tight ${isDone ? 'text-indigo-300 font-medium' : 'text-[var(--color-text-muted)]'}`}
                  >
                    {s}
                  </p>
                </div>
                {!isLast && (
                  <div
                    className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${i < currentStep && order.status !== 'Failed' ? 'bg-indigo-600' : 'bg-[var(--color-border)]'}`}
                  />
                )}
              </div>
            );
          })}
          {order.status === 'Failed' && (
            <div className="absolute right-0 top-0 flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 bg-red-950 border-red-800 text-[var(--color-danger-text)]">
                <AlertTriangle size={14} />
              </div>
              <p className="text-xs text-[var(--color-danger-text)] font-medium">Failed</p>
            </div>
          )}
        </div>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-4">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Order Information</p>
          <div className="space-y-3">
            {[
              { icon: <User size={14} />, label: 'Customer', value: order.customer?.name || 'Unknown' },
              { icon: <User size={14} />, label: 'Contact', value: order.customer?.phone || 'N/A' },
              {
                icon: <Clock size={14} />,
                label: 'SLA Deadline',
                value: format(new Date(order.promisedDeliveryTime), 'dd MMM yyyy, HH:mm'),
                danger: order.isDelayed,
              },
              {
                icon: <Clock size={14} />,
                label: 'Last Updated',
                value: format(new Date(order.updatedAt), 'dd MMM yyyy, HH:mm'),
              },
              ...(order.createdBy
                ? [
                    {
                      icon: <User size={14} />,
                      label: 'Created by',
                      value: (order.createdBy as { name: string }).name,
                    },
                  ]
                : []),
              ...(order.delayReason || order.isDelayed
                ? [
                    {
                      icon: <AlertTriangle size={14} />,
                      label: 'Delay Status',
                      value: order.delayReason || (order.isDelayed ? 'Awaiting Reason' : 'On Track'),
                      danger: order.isDelayed,
                    },
                  ]
                : []),
            ].map(({ icon, label, value, danger }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-[var(--color-text-muted)] mt-0.5">{icon}</span>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                  <p className={`text-sm font-medium ${danger ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-text-primary)]'}`}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Notes</p>
          {order.notes ? (
            <div className="flex gap-2">
              <FileText size={14} className="text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {order.notes}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] italic">No notes attached.</p>
          )}
        </Card>

        {/* Route Details */}
        {order.pickupAddress?.addressLine && (
          <Card className="p-5 md:col-span-2">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-6">Route Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-full bg-gradient-to-b from-indigo-500/20 via-indigo-500/20 to-transparent" />
              
              {/* Pickup */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-brand-text)] uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  Pickup (Origin)
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-primary)] font-medium">{order.pickupAddress.addressLine}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {order.pickupAddress.city}, {order.pickupAddress.pincode}
                  </p>
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--badge-delivered-text)] uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Delivery (Destination)
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-primary)] font-medium">{order.deliveryAddress.addressLine}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {order.deliveryAddress.city}, {order.deliveryAddress.pincode}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {order.deliveryAgent?.agentId && (
          <Card className="p-5 space-y-4 md:col-span-2">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Assigned Delivery Agent</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Agent Name', value: order.deliveryAgent.name },
                { label: 'Agent ID', value: order.deliveryAgent.agentId, mono: true },
                { label: 'Phone Number', value: order.deliveryAgent.phone },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">{item.label}</p>
                  <p className={`text-sm font-medium text-[var(--color-text-primary)] ${item.mono ? 'font-mono' : ''}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── Transit History Timeline ────────────────────────────────────── */}
      {order.transitLogs && order.transitLogs.length > 0 && (
        <Card className="p-6">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-6 uppercase tracking-wider">Operational Audit Trail</h2>
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-600 before:via-indigo-600/50 before:to-transparent">
            {order.transitLogs.slice().reverse().map((log, idx) => (
              <div key={idx} className="relative flex items-start gap-6 group">
                <div className={`
                  relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0
                  ${idx === 0 ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-[var(--color-surface-3)] border-[var(--color-border)]'}
                `}>
                  <span className={idx === 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}>
                    {STATUS_ICONS[log.status]}
                  </span>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <p className={`text-sm font-bold ${idx === 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                      Shipment {log.status}
                    </p>
                    <time className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
                      {format(new Date(log.updatedAt), 'dd MMM yyyy, HH:mm:ss')}
                    </time>
                  </div>
                  
                  {(log.location || log.note) && (
                    <div className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl p-3 space-y-2">
                      {log.location && (
                        <p className="text-xs text-[var(--color-brand-text)] font-medium">
                          📍 {log.location}
                        </p>
                      )}
                      {log.note && (
                        <p className="text-xs text-[var(--color-text-secondary)] italic leading-relaxed">
                          &ldquo;{log.note}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-2 uppercase tracking-tight">
                    Verified by OpID: <span className="text-[var(--color-text-muted)]">{log.updatedBy}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      {(nextStatus || canFail) && (
        <Card className="p-6 border-indigo-500/20 bg-indigo-500/5">
          <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1">Operational Update</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-6">
            Advance the shipment lifecycle. All updates are logged for accountability.
          </p>

          {updateError && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--color-danger-bg)] border border-red-900/50 text-[var(--color-danger-text)] text-sm flex items-center gap-3">
              <AlertTriangle size={18} />
              {updateError}
            </div>
          )}

          {!pendingStatus ? (
            <div className="flex flex-wrap gap-4">
              {nextStatus && (
                <Button
                  onClick={() => setPendingStatus(nextStatus)}
                  className="gap-2 px-6"
                >
                  <ChevronRight size={16} />
                  Proceed to {nextStatus}
                </Button>
              )}
              {canFail && (
                <Button
                  variant="danger"
                  onClick={() => setPendingStatus('Failed')}
                >
                  Mark as Failed
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6 bg-[var(--color-surface-2)] p-6 rounded-2xl border border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  Updating to {pendingStatus}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setPendingStatus(null)}>Cancel</Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingStatus === 'Picked' && (
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Select Available Agent
                    </label>
                    <select
                      className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                    >
                      <option value="">Select an agent...</option>
                      {availableAgents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.agentId})
                        </option>
                      ))}
                    </select>
                    {availableAgents.length === 0 && (
                      <p className="text-[10px] text-[var(--badge-transit-text)] mt-1 font-medium italic">
                        No available agents found. Please register or free up an agent first.
                      </p>
                    )}
                  </div>
                )}

                {pendingStatus === 'In Transit' && (
                  <>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Current Hub / Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Pune Sorting Facility"
                        className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        value={transitInfo.location}
                        onChange={(e) => setTransitInfo({ ...transitInfo, location: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {(pendingStatus === 'In Transit' || pendingStatus === 'Delivered' || pendingStatus === 'Failed') && (
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Operational Note</label>
                    <textarea
                      placeholder="Enter update details..."
                      rows={2}
                      className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                      value={transitInfo.note}
                      onChange={(e) => setTransitInfo({ ...transitInfo, note: e.target.value })}
                    />
                  </div>
                )}

                {order.isDelayed && (
                  <div className="space-y-4 sm:col-span-2 pt-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-[var(--color-danger-text)]" />
                      <p className="text-xs font-bold text-[var(--color-danger-text)] uppercase tracking-wider">Delay Explainability Required</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Primary Reason</label>
                        <select
                          className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          value={delayInfo.reason}
                          onChange={(e) => setDelayInfo({ ...delayInfo, reason: e.target.value })}
                        >
                          <option value="">Select a reason...</option>
                          {DELAY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Delay Note (Optional)</label>
                        <input
                          type="text"
                          placeholder="Short explanation..."
                          className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          value={delayInfo.note}
                          onChange={(e) => setDelayInfo({ ...delayInfo, note: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                loading={updating}
                onClick={() => handleUpdate(pendingStatus)}
              >
                Confirm {pendingStatus} Update
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
