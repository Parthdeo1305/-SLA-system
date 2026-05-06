'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { Truck, AlertCircle } from 'lucide-react';

const ROLES = [
  { value: 'operations_manager', label: 'Operations Manager' },
  { value: 'warehouse_operator', label: 'Warehouse Staff' },
  { value: 'admin', label: 'Admin' },
];

export default function SignupPage() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'warehouse_operator',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email is required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) e.password = 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(form.password)) e.password = 'Password must contain at least one number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    try {
      document.cookie = `sts_auth=1; path=/; max-age=${7 * 86400}; SameSite=Lax`;
      await register(form.name, form.email, form.password, form.role);
    } catch (err: unknown) {
      document.cookie = 'sts_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Registration failed. Please try again.';
      setGlobalError(msg);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Truck size={18} className="text-[var(--color-text-primary)]" />
          </div>
          <p className="font-bold text-[var(--color-text-primary)] text-xl">ShipTrack</p>
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Create your account</h2>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Join your team on the operations dashboard
        </p>

        {globalError && (
          <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-[var(--color-danger-bg)] border border-red-900/50 text-[var(--color-danger-text)] text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="signup-name"
            label="Full name"
            placeholder="Sarah Chen"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
          />
          <Input
            id="signup-email"
            type="email"
            label="Work email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            id="signup-password"
            type="password"
            label="Password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            hint="Must be at least 8 characters with one uppercase letter and one number"
            autoComplete="new-password"
          />

          {/* Role selector */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-role" className="text-sm font-medium text-[var(--color-text-secondary)]">
              Role
            </label>
            <select
              id="signup-role"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm
                bg-[var(--color-surface-3)] border border-[var(--color-border)]
                text-[var(--color-text-primary)]
                focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                transition-all duration-150"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#18181f]">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--color-brand-text)] hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
