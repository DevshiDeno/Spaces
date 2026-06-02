import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  CalendarCheck,
  Image as ImageIcon,
  Inbox,
  TrendingUp,
  Users,
  Plus,
  CalendarPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/features/dashboard/StatCard';
import { dashboardService } from '@/services/dashboard.service';
import { applicationsService } from '@/services/applications.service';
import { useFeaturedEvents } from '@/hooks/useEvents';
import { useFeaturedVenues } from '@/hooks/useVenues';
import { formatCurrency, formatNumber } from '@/utils/format';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { hasDashboardRole } from '@/routes/RoleGate';
import { useToast } from '@/hooks/useToast';

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const isAdmin = hasDashboardRole(user?.role, ['ADMIN']);
  const isOwner = hasDashboardRole(user?.role, ['SPACE_OWNER', 'ADMIN']);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.stats(),
  });
  const { data: events } = useFeaturedEvents();
  const { data: venues } = useFeaturedVenues();
  const { data: pendingApps } = useQuery({
    queryKey: ['applications', 'pending'],
    queryFn: () => applicationsService.pending(),
    enabled: isAdmin,
  });

  const comingSoon = (feature: string) =>
    toast.info(`${feature} coming soon`, 'This flow is not yet built.');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Qreative'} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening across your network today.</p>
        </div>
        {isOwner && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/dashboard/spaces/new')}
            >
              Add New Space
            </Button>
            <Button
              leftIcon={<CalendarPlus className="h-4 w-4" />}
              onClick={() => comingSoon('Event creation')}
            >
              Create Event
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : stats ? (
          <>
            <StatCard
              label="Total Bookings"
              value={formatNumber(stats.totalBookings)}
              icon={CalendarCheck}
              trend={{ value: '12%', positive: true }}
              hint="vs. last month"
            />
            <StatCard
              label="Revenue Overview"
              value={formatCurrency(stats.totalRevenue)}
              icon={Banknote}
              trend={{ value: '8.4%', positive: true }}
              hint="Total revenue from bookings"
            />
            <StatCard
              label="Total Users"
              value={formatNumber(stats.totalUsers)}
              icon={Users}
              hint={`+${stats.newUsersThisMonth} new this month`}
            />
            <StatCard
              label="Total Files"
              value={formatNumber(stats.totalFiles)}
              icon={ImageIcon}
              hint="Media library"
            />
          </>
        ) : null}
      </div>

      <div className={isAdmin ? 'grid gap-6 lg:grid-cols-3' : 'grid gap-6'}>
        {isAdmin && (
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Pending Applications</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/dashboard/applications')}
              >
                Review all →
              </Button>
            </div>
            <div className="mt-4 divide-y divide-border">
              {pendingApps && pendingApps.length > 0 ? (
                pendingApps.slice(0, 4).map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => navigate('/dashboard/applications')}
                    className="flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium">{app.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.venueType} · {app.city}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">Review →</span>
                  </button>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No pending applications.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            {isOwner && (
              <ActionItem
                icon={<Plus className="h-4 w-4" />}
                title="Add New Space"
                onClick={() => navigate('/dashboard/spaces/new')}
              />
            )}
            {isOwner && (
              <ActionItem
                icon={<CalendarPlus className="h-4 w-4" />}
                title="Create Event"
                onClick={() => comingSoon('Event creation')}
              />
            )}
            {isAdmin && (
              <ActionItem
                icon={<Inbox className="h-4 w-4" />}
                title="Review Applications"
                hint={`${stats?.pendingApplications ?? 0} pending`}
                onClick={() => navigate('/dashboard/applications')}
              />
            )}
            {isOwner && (
              <ActionItem
                icon={<TrendingUp className="h-4 w-4" />}
                title="View Bookings"
                onClick={() => navigate('/dashboard/bookings')}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Featured Venues</h2>
          {venues && venues.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {venues.slice(0, 4).map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/venues/${v.slug}`)}
                    className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/30"
                  >
                    <img src={v.coverImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{v.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{v.city} · {v.type}</p>
                    </div>
                    <span className="text-xs font-medium">{formatCurrency(v.pricePerHour)}/hr</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No venues yet" />
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Upcoming Events</h2>
          {events && events.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {events.slice(0, 4).map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/events/${e.slug}`)}
                    className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/30"
                  >
                    <img src={e.coverImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.venueName ?? e.city}</p>
                    </div>
                    <span className="text-xs font-medium">{e.ticketsSold}/{e.ticketsAvailable}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No upcoming events" />
          )}
        </div>
      </div>
    </div>
  );
}

function ActionItem({
  icon,
  title,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-transparent bg-muted/40 px-3 py-2.5 text-left text-sm font-medium transition hover:border-border hover:bg-muted"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="flex-1">{title}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}
