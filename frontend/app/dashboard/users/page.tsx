'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usersApi, User } from '@/services/api/users';
import { roleLabel, roleBadgeClass } from '@/lib/rbac';
import { 
  Users as UsersIcon, 
  UserX, 
  UserCheck, 
  Search, 
  ShieldCheck, 
  Briefcase,
  Warehouse,
  Truck,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.list({ search });
      setUsers(data.users);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser?.role === 'admin') {
        fetchUsers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, currentUser]);

  const handleToggleActive = async (user: User) => {
    if (!window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.name}?`)) {
      return;
    }

    try {
      setActionLoading(user._id);
      if (user.isActive) {
        await usersApi.deactivate(user._id);
      } else {
        await usersApi.activate(user._id);
      }
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = window.confirm(
      `DANGER: Are you sure you want to PERMANENTLY REMOVE ${user.name} (${user.email})? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setDeleteLoading(user._id);
      await usersApi.delete(user._id);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <UsersIcon className="text-indigo-400" />
            User Management
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Manage organization access, roles, and account status.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-[var(--color-surface-hover)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                          u.isActive ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-gray-800 text-gray-500 border border-gray-700'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${u.isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] line-through'}`}>
                            {u.name} {u._id === currentUser.id && <span className="ml-1 text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase">You</span>}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${roleBadgeClass(u.role)}`}>
                        {u.role === 'admin' && <ShieldCheck size={11} />}
                        {u.role === 'operations_manager' && <Briefcase size={11} />}
                        {u.role === 'warehouse_operator' && <Warehouse size={11} />}
                        {u.role === 'delivery_agent' && <Truck size={11} />}
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.isActive 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--color-text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u._id !== currentUser.id && (
                        <div className="flex items-center justify-end gap-2">
                          {/* Deactivate/Activate Button */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={actionLoading === u._id || deleteLoading === u._id}
                            className={`
                              p-2 rounded-lg transition-all duration-150
                              ${u.isActive 
                                ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                                : 'text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300'
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            title={u.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {actionLoading === u._id ? (
                              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : u.isActive ? (
                              <UserX size={18} />
                            ) : (
                              <UserCheck size={18} />
                            )}
                          </button>

                          {/* Permanent Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={actionLoading === u._id || deleteLoading === u._id}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Permanently Remove User"
                          >
                            {deleteLoading === u._id ? (
                              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
