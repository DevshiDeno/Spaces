import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export type DashboardRole = 'USER' | 'SPACE_OWNER' | 'ADMIN';

interface RoleGateProps {
  allow: DashboardRole[];
  children: ReactNode;
  fallback?: string;
}

export function RoleGate({ allow, children, fallback = '/dashboard' }: RoleGateProps) {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? 'USER').toString().toUpperCase() as DashboardRole;
  if (!allow.includes(role)) {
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
}

export function hasDashboardRole(
  role: string | undefined,
  allow: DashboardRole[]
): boolean {
  const normalized = (role ?? 'USER').toString().toUpperCase() as DashboardRole;
  return allow.includes(normalized);
}
