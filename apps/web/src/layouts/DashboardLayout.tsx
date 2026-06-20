import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Banknote,
  CalendarDays,
  CalendarRange,
  Users,
  FileText,
  Image as ImageIcon,
  Send,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuthStore } from '@/store/auth.store';
import { hasDashboardRole, type DashboardRole } from '@/routes/RoleGate';
import { cn } from '@/utils/cn';

interface NavLinkSpec {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  allow: DashboardRole[];
}

const ALL: DashboardRole[] = ['USER', 'SPACE_OWNER', 'ADMIN'];
const OWNER: DashboardRole[] = ['SPACE_OWNER', 'ADMIN'];
const ADMIN: DashboardRole[] = ['ADMIN'];

const navLinks: NavLinkSpec[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true, allow: ALL },
  { to: '/dashboard/spaces', label: 'Spaces', icon: Building2, allow: OWNER },
  { to: '/dashboard/bookings', label: 'Bookings', icon: CalendarDays, allow: OWNER },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarRange, allow: OWNER },
  { to: '/dashboard/earnings', label: 'Earnings', icon: Banknote, allow: OWNER },
  { to: '/dashboard/applications', label: 'Applications', icon: Users, allow: ADMIN },
  { to: '/dashboard/payouts', label: 'Payouts', icon: Send, allow: ADMIN },
  { to: '/dashboard/pages', label: 'Pages', icon: FileText, allow: ADMIN },
  { to: '/dashboard/media', label: 'Media Library', icon: ImageIcon, allow: ADMIN },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, allow: ALL },
];

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const visibleLinks = navLinks.filter((link) => hasDashboardRole(user?.role, link.allow));

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Logo />
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user?.name?.[0] ?? 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name ?? 'Space User'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur lg:justify-end">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
