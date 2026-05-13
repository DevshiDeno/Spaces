import { useQuery } from '@tanstack/react-query';
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
import { useFeaturedEvents } from '@/hooks/useEvents';
import { useFeaturedVenues } from '@/hooks/useVenues';
import { formatCurrency, formatNumber } from '@/utils/format';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.stats(),
  });
  const { data: events } = useFeaturedEvents();
  const { data: venues } = useFeaturedVenues();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Qreative'} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening across your network today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />}>Add New Space</Button>
          <Button leftIcon={<CalendarPlus className="h-4 w-4" />}>Create Event</Button>
        </div>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Pending Applications</h2>
            <span className="text-xs text-muted-foreground">Spaces awaiting approval</span>
          </div>
          <div className="mt-4 divide-y divide-border">
            {[
              { name: 'Mara House Nairobi', city: 'Nairobi', type: 'Restaurant' },
              { name: 'Lamu Soundroom', city: 'Mombasa', type: 'Studio Space' },
              { name: 'Kawi Studios', city: 'Nairobi', type: 'Event Space' },
            ].map((app) => (
              <div key={app.name} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{app.name}</p>
                  <p className="text-xs text-muted-foreground">{app.type} · {app.city}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <ActionItem icon={<Plus className="h-4 w-4" />} title="Add New Space" />
            <ActionItem icon={<CalendarPlus className="h-4 w-4" />} title="Create Event" />
            <ActionItem icon={<Inbox className="h-4 w-4" />} title="Review Applications" hint={`${stats?.pendingApplications ?? 0} pending`} />
            <ActionItem icon={<TrendingUp className="h-4 w-4" />} title="View Bookings" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Featured Venues</h2>
          <ul className="mt-4 divide-y divide-border">
            {venues?.slice(0, 4).map((v) => (
              <li key={v.id} className="flex items-center gap-3 py-3">
                <img src={v.coverImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{v.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{v.city} · {v.type}</p>
                </div>
                <span className="text-xs font-medium">{formatCurrency(v.pricePerHour)}/hr</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Upcoming Events</h2>
          <ul className="mt-4 divide-y divide-border">
            {events?.slice(0, 4).map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-3">
                <img src={e.coverImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.venueName ?? e.city}</p>
                </div>
                <span className="text-xs font-medium">{e.ticketsSold}/{e.ticketsAvailable}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ActionItem({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <button className="flex items-center gap-3 rounded-lg border border-transparent bg-muted/40 px-3 py-2.5 text-left text-sm font-medium transition hover:border-border hover:bg-muted">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="flex-1">{title}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}
