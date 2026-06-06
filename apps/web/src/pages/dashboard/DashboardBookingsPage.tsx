import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { bookingsService } from '@/services/bookings.service';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Booking } from '@/types';

export default function DashboardBookingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'owner'],
    queryFn: () => bookingsService.listForOwner(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reservations across all your venues. Earnings detail is in the Earnings tab.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-md" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title="No bookings yet"
              description="Bookings will show up here once guests reserve your spaces."
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-4 text-left">Venue</th>
                <th className="p-4 text-left">When</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Guests</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium">{b.venue?.name ?? '—'}</td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(b.date, { month: 'short', day: 'numeric' })} · {b.startTime}–{b.endTime}
                  </td>
                  <td className="p-4 text-muted-foreground">{b.user?.name ?? '—'}</td>
                  <td className="p-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {b.guestCount}
                    </span>
                  </td>
                  <td className="p-4 text-right">{formatCurrency(b.totalAmount)}</td>
                  <td className="p-4">
                    <StatusBadge booking={b} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ booking }: { booking: Booking }) {
  if (booking.status === 'CONFIRMED') return <Badge variant="success">Confirmed</Badge>;
  if (booking.status === 'CANCELLED') return <Badge variant="warning">Cancelled</Badge>;
  if (booking.status === 'COMPLETED') return <Badge variant="success">Completed</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}
