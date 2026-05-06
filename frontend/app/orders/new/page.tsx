'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ordersApi from '@/services/api/orders';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, PlusCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { format, addDays, addHours } from 'date-fns';

// Helper to format a Date into the datetime-local input format
const toDatetimeLocal = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm");

const QUICK_DEADLINES = [
  { label: '+4 hours', value: () => addHours(new Date(), 4) },
  { label: '+8 hours', value: () => addHours(new Date(), 8) },
  { label: '+1 day', value: () => addDays(new Date(), 1) },
  { label: '+3 days', value: () => addDays(new Date(), 3) },
];

export default function NewOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    customer: { name: '', phone: '', email: '' },
    pickupAddress: { addressLine: '', city: '', pincode: '' },
    deliveryAddress: { addressLine: '', city: '', pincode: '' },
    promisedDeliveryTime: toDatetimeLocal(addDays(new Date(), 1)),
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customer.name.trim()) e['customer.name'] = 'Name is required';
    else if (form.customer.name.trim().length < 2) e['customer.name'] = 'Name must be at least 2 chars';
    
    if (!form.customer.phone.trim()) e['customer.phone'] = 'Phone is required';
    
    if (!form.pickupAddress.addressLine.trim()) e['pickupAddress.addressLine'] = 'Pickup address is required';
    if (!form.pickupAddress.city.trim()) e['pickupAddress.city'] = 'City is required';
    if (!form.pickupAddress.pincode.trim()) e['pickupAddress.pincode'] = 'Pincode is required';
    else if (form.pickupAddress.pincode.trim().length < 6) e['pickupAddress.pincode'] = 'Invalid pincode';
    
    if (!form.deliveryAddress.addressLine.trim()) e['deliveryAddress.addressLine'] = 'Delivery address is required';
    if (!form.deliveryAddress.city.trim()) e['deliveryAddress.city'] = 'City is required';
    if (!form.deliveryAddress.pincode.trim()) e['deliveryAddress.pincode'] = 'Pincode is required';
    else if (form.deliveryAddress.pincode.trim().length < 6) e['deliveryAddress.pincode'] = 'Invalid pincode';

    if (!form.promisedDeliveryTime)
      e.promisedDeliveryTime = 'Promised delivery time is required';
    else if (new Date(form.promisedDeliveryTime) <= new Date())
      e.promisedDeliveryTime = 'Delivery time must be in the future';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const { order } = await ordersApi.create({
        customer: form.customer,
        pickupAddress: form.pickupAddress,
        deliveryAddress: form.deliveryAddress,
        promisedDeliveryTime: new Date(form.promisedDeliveryTime).toISOString(),
        notes: form.notes.trim() || undefined,
      });
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.details) {
        const fieldErrors: Record<string, string> = {};
        errorData.details.forEach((d: { field: string; message: string }) => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
        setGlobalError('Please fix the highlighted errors.');
      } else {
        setGlobalError(errorData?.error || 'Failed to create order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setForm((prev) => ({
        ...prev,
        [parent]: { ...(prev as any)[parent], [child]: value }
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={14} />
            Back
          </Button>
        </Link>
        <div className="h-5 w-px bg-[var(--color-border)]" />
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Create New Order</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Order ID will be auto-assigned
          </p>
        </div>
      </div>

      {globalError && (
        <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-[var(--color-danger-bg)] border border-red-900/50 text-[var(--color-danger-text)] text-sm">
          <AlertCircle size={15} className="flex-shrink-0" />
          {globalError}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Customer Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-brand-text)] uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Customer Name"
                placeholder="e.g. Rahul Sharma"
                value={form.customer.name}
                onChange={(e) => handleChange('customer.name', e.target.value)}
                error={errors['customer.name']}
              />
              <Input
                label="Phone Number"
                placeholder="9876543210"
                value={form.customer.phone}
                onChange={(e) => handleChange('customer.phone', e.target.value)}
                error={errors['customer.phone']}
              />
            </div>
          </div>

          {/* Pickup Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-brand-text)] uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Pickup Origin
            </h3>
            <Input
              label="Address Line"
              placeholder="Warehouse location, area details..."
              value={form.pickupAddress.addressLine}
              onChange={(e) => handleChange('pickupAddress.addressLine', e.target.value)}
              error={errors['pickupAddress.addressLine']}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="e.g. Mumbai"
                value={form.pickupAddress.city}
                onChange={(e) => handleChange('pickupAddress.city', e.target.value)}
                error={errors['pickupAddress.city']}
              />
              <Input
                label="Pincode"
                placeholder="400001"
                value={form.pickupAddress.pincode}
                onChange={(e) => handleChange('pickupAddress.pincode', e.target.value)}
                error={errors['pickupAddress.pincode']}
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-brand-text)] uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Delivery Destination
            </h3>
            <Input
              label="Address Line"
              placeholder="Flat no, building, street..."
              value={form.deliveryAddress.addressLine}
              onChange={(e) => handleChange('deliveryAddress.addressLine', e.target.value)}
              error={errors['deliveryAddress.addressLine']}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="e.g. Pune"
                value={form.deliveryAddress.city}
                onChange={(e) => handleChange('deliveryAddress.city', e.target.value)}
                error={errors['deliveryAddress.city']}
              />
              <Input
                label="Pincode"
                placeholder="411001"
                value={form.deliveryAddress.pincode}
                onChange={(e) => handleChange('deliveryAddress.pincode', e.target.value)}
                error={errors['deliveryAddress.pincode']}
              />
            </div>
          </div>

          {/* Promised Delivery Time */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="order-sla"
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              SLA — Promised delivery time
            </label>

            {/* Quick presets */}
            <div className="flex gap-2 flex-wrap mb-1">
              {QUICK_DEADLINES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() =>
                    handleChange('promisedDeliveryTime', toDatetimeLocal(p.value()))
                  }
                  className="px-3 py-1 text-xs rounded-full border border-[var(--color-border)]
                    text-[var(--color-text-secondary)] hover:border-indigo-500 hover:text-[var(--color-brand-text)]
                    transition-all duration-150 cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Input
              id="order-sla"
              type="datetime-local"
              value={form.promisedDeliveryTime}
              onChange={(e) => handleChange('promisedDeliveryTime', e.target.value)}
              error={errors.promisedDeliveryTime}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="order-notes"
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Notes{' '}
              <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
            </label>
            <textarea
              id="order-notes"
              rows={3}
              placeholder="Special handling instructions, fragile cargo, access restrictions..."
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              maxLength={500}
              className="w-full px-3 py-2.5 rounded-lg text-sm resize-none
                bg-[var(--color-surface-3)] border border-[var(--color-border)]
                text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                transition-all duration-150"
            />
            <p className="text-xs text-[var(--color-text-muted)] self-end">
              {form.notes.length}/500
            </p>
          </div>

          {/* Info box */}
          <div className="flex gap-2 p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40">
            <Info size={14} className="text-[var(--color-brand-text)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[var(--color-brand-text)]/80">
              Order will be created with status <strong>Created</strong>. Warehouse staff
              can advance it through the status flow: Created → Picked → In Transit → Delivered.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="secondary" size="md" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} size="md" className="flex-1 gap-2">
              <PlusCircle size={15} />
              Create Order
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
