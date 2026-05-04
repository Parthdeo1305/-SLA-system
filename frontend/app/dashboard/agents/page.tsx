'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { agentsApi, Agent } from '@/services/api/agents';
import { canManageAgents, canToggleAgentLifecycle } from '@/lib/rbac';
import {
  Users,
  Plus,
  Search,
  UserPlus,
  Phone,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function AgentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ agentId: '', name: '', phone: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Guard: delivery_agents have no access to fleet management
  useEffect(() => {
    if (user && user.role === 'delivery_agent') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchAgents = async () => {
    try {
      const data = await agentsApi.list();
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agentsApi.create(newAgent);
      setIsModalOpen(false);
      setNewAgent({ agentId: '', name: '', phone: '' });
      fetchAgents();
    } catch (error) {
      alert('Failed to create agent. Check console.');
    }
  };

  const toggleStatus = async (agent: Agent) => {
    if (!canToggleAgentLifecycle(user)) return;
    try {
      setActionLoading(agent._id);
      if (agent.isActive) {
        await agentsApi.deactivate(agent._id);
      } else {
        await agentsApi.activate(agent._id);
      }
      fetchAgents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Operation failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.agentId.toLowerCase().includes(search.toLowerCase())
  );

  const canAdd = canManageAgents(user);
  const canToggle = canToggleAgentLifecycle(user);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-indigo-400" />
            Agent Management
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-sm">
            Maintain your delivery fleet and monitor their availability.
          </p>
        </div>
        {/* Only admin / operations_manager can add agents */}
        {canAdd ? (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={16} /> Add New Agent
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm cursor-not-allowed">
            <Lock size={14} />
            View Only
          </div>
        )}
      </div>

      <Card>
        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input
              type="text"
              placeholder="Search agents by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-[var(--color-border)] rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Agent Info</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Contact</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Current Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Account</th>
                {/* Actions column visible only to admin */}
                {canToggle && <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr><td colSpan={canToggle ? 5 : 4} className="py-10 text-center text-[var(--color-text-muted)]">Loading fleet data...</td></tr>
              ) : filteredAgents.length === 0 ? (
                <tr><td colSpan={canToggle ? 5 : 4} className="py-10 text-center text-[var(--color-text-muted)]">No agents found matching your search.</td></tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{agent.name}</span>
                        <span className="text-xs text-indigo-400 font-mono">{agent.agentId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <Phone size={12} className="text-indigo-400/50" />
                        {agent.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${agent.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}
                      `}>
                        <div className={`w-1 h-1 rounded-full ${agent.status === 'available' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        {agent.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border
                        ${agent.isActive ? 'text-indigo-400 border-indigo-400/20' : 'text-red-400 border-red-400/20'}
                      `}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Actions — admin only */}
                    {canToggle && (
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleStatus(agent)}
                          disabled={actionLoading === agent._id}
                          className={`text-[10px] uppercase font-bold tracking-widest ${agent.isActive ? 'hover:text-red-400' : 'hover:text-emerald-400'}`}
                        >
                          {actionLoading === agent._id ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                          ) : agent.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal — only rendered if canAdd */}
      {isModalOpen && canAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-400" />
                Register New Agent
              </h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Internal Agent ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AG-001"
                  value={newAgent.agentId}
                  onChange={e => setNewAgent({...newAgent, agentId: e.target.value})}
                  className="w-full bg-white/5 border border-[var(--color-border)] rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newAgent.name}
                  onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                  className="w-full bg-white/5 border border-[var(--color-border)] rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={newAgent.phone}
                  onChange={e => setNewAgent({...newAgent, phone: e.target.value})}
                  className="w-full bg-white/5 border border-[var(--color-border)] rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">Register Agent</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
