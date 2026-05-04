'use client';

import { useAuth } from '@/hooks/useAuth';
import {
  Package,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  ChevronRight,
  Truck,
  Users,
  UserCircle,
  ShieldCheck,
  Briefcase,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  canCreateOrder,
  canManageUsers,
  canViewFleet,
  isDeliveryAgent,
  roleLabel,
  roleBadgeClass,
  canManageAgents,
} from '@/lib/rbac';

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/** Icon to represent each role in the sidebar badge */
function RoleIcon({ role }: { role: string }) {
  if (role === 'admin') return <ShieldCheck size={11} />;
  if (role === 'operations_manager') return <Briefcase size={11} />;
  if (role === 'warehouse_operator') return <Warehouse size={11} />;
  if (role === 'delivery_agent') return <Truck size={11} />;
  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: isDeliveryAgent(user) ? 'My Orders' : 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: '/orders',
      label: 'All Orders',
      icon: Package,
      show: !isDeliveryAgent(user),
    },
    {
      href: '/orders/new',
      label: 'New Order',
      icon: PlusCircle,
      show: canCreateOrder(user),
    },
    {
      href: '/dashboard/agents',
      label: 'Fleet',
      icon: Users,
      show: canViewFleet(user),
    },
    {
      href: '/dashboard/users',
      label: 'Users',
      icon: UserCircle,
      show: canManageUsers(user),
    },
  ].filter((item) => item.show);

  // Keep cookie in sync with auth state for middleware
  useEffect(() => {
    const token = localStorage.getItem('sts_token');
    if (token) {
      setCookie('sts_auth', '1', 7);
    } else {
      deleteCookie('sts_auth');
    }
  }, [user]);

  const handleLogout = () => {
    deleteCookie('sts_auth');
    logout();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Truck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">ShipTrack</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Logistics Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-600/20'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-current'} />
                {label}
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-[var(--color-border)]">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                {/* Role badge */}
                <span
                  className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${roleBadgeClass(user.role)}`}
                >
                  <RoleIcon role={user.role} />
                  {roleLabel(user.role)}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-red-900/20 transition-all duration-150"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
