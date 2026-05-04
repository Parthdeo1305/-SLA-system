/**
 * Frontend RBAC Utility
 *
 * Central module for all role-based permission checks.
 * Import these helpers instead of inlining role string comparisons.
 */

export type AppRole = 'admin' | 'operations_manager' | 'warehouse_operator' | 'delivery_agent';

export interface RbacUser {
  role: AppRole | string;
}

// ─── Role predicates ──────────────────────────────────────────────────────────

export const isAdmin = (user: RbacUser | null): boolean =>
  user?.role === 'admin';

export const isOperationsManager = (user: RbacUser | null): boolean =>
  user?.role === 'operations_manager';

export const isWarehouseOperator = (user: RbacUser | null): boolean =>
  user?.role === 'warehouse_operator';

export const isDeliveryAgent = (user: RbacUser | null): boolean =>
  user?.role === 'delivery_agent';

// ─── Permission gates ─────────────────────────────────────────────────────────

/** User can view and manage other users */
export const canManageUsers = (user: RbacUser | null): boolean =>
  isAdmin(user);

/** User can create or deactivate Agent records */
export const canManageAgents = (user: RbacUser | null): boolean =>
  isAdmin(user) || isOperationsManager(user);

/** User can deactivate/activate an agent (lifecycle control) */
export const canToggleAgentLifecycle = (user: RbacUser | null): boolean =>
  isAdmin(user);

/** User can assign a delivery agent to an order */
export const canAssignAgent = (user: RbacUser | null): boolean =>
  isAdmin(user) || isOperationsManager(user);

/** User can create new orders */
export const canCreateOrder = (user: RbacUser | null): boolean =>
  isAdmin(user) || isOperationsManager(user) || isWarehouseOperator(user);

/** User can view aggregate analytics and stats */
export const canViewAnalytics = (user: RbacUser | null): boolean =>
  isAdmin(user) || isOperationsManager(user) || isWarehouseOperator(user);

/** User can view the fleet / agents dashboard */
export const canViewFleet = (user: RbacUser | null): boolean =>
  isAdmin(user) || isOperationsManager(user) || isWarehouseOperator(user);

/** User can view the full unfiltered orders list */
export const canViewAllOrders = (user: RbacUser | null): boolean =>
  !isDeliveryAgent(user);

// ─── Generic helper ───────────────────────────────────────────────────────────

/** Returns true if the user's role is in the given allowed list */
export const hasRole = (user: RbacUser | null, roles: AppRole[]): boolean =>
  !!user && roles.includes(user.role as AppRole);

/** Human-readable label for a role value */
export const roleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    admin: 'Administrator',
    operations_manager: 'Operations Manager',
    warehouse_operator: 'Warehouse Operator',
    delivery_agent: 'Delivery Agent',
  };
  return labels[role] ?? role.replace(/_/g, ' ');
};

/** Tailwind color classes for role badges */
export const roleBadgeClass = (role: string): string => {
  const classes: Record<string, string> = {
    admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    operations_manager: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    warehouse_operator: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    delivery_agent: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  };
  return classes[role] ?? 'bg-white/10 text-white border-white/20';
};
