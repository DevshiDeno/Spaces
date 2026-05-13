import { CalendarDays } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DashboardBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track all reservations across your venues.</p>
      </div>
      <EmptyState
        icon={<CalendarDays className="h-6 w-6" />}
        title="No bookings yet"
        description="Bookings will show up here once guests reserve your spaces."
      />
    </div>
  );
}
