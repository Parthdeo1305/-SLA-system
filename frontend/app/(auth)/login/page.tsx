'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { Truck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      // Set auth cookie for middleware BEFORE redirecting
      document.cookie = `sts_auth=1; path=/; max-age=${7 * 86400}; SameSite=Lax`;
      await login(email, password);
    } catch (err: unknown) {
      document.cookie = 'sts_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Invalid email or password.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-[#0e0e1a] to-[var(--color-bg)] border-r border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-none">ShipTrack</p>
            <p className="text-xs text-indigo-400">Logistics Platform</p>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Operational visibility<br />
            <span className="text-indigo-400">in real time.</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
            Track every shipment, detect SLA breaches the moment they happen,
            and take action before customers notice.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'SLA Breach Detection', desc: 'Automatic delay flagging' },
              { label: 'Live Dashboard', desc: 'Real-time status overview' },
              { label: 'Role-Based Access', desc: 'Secure team management' },
              { label: 'Order Timeline', desc: 'Full audit history' },
            ].map((f) => (
              <div key={f.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          © 2026 ShipTrack. Production-grade logistics management.
        </p>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Truck size={18} className="text-white" />
            </div>
            <p className="font-bold text-white text-xl">ShipTrack</p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Sign in to your operations dashboard
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="login-email"
              type="email"
              label="Email address"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="login-password" 
                  className="text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full mt-2"
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
