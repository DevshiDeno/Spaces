import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, ImagePlus, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useMyEvents, useDeleteEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/utils/format';
import type { AppEvent } from '@/types';

export default function DashboardEventsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading } = useMyEvents(isAuthenticated);
  const deleteEvent = useDeleteEvent();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AppEvent | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((e) =>
      `${e.title} ${e.city} ${e.category} ${e.organizer}`.toLowerCase().includes(q)
    );
  }, [data, query]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteEvent.mutateAsync(pendingDelete.id);
      toast.success('Event deleted', `${pendingDelete.title} was removed.`);
      setPendingDelete(null);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Could not delete the event.';
      toast.error('Deletion failed', message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl font-bold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your ticketed and free events.
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/dashboard/events/new')}>
          Create Event
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <Input
          placeholder="Search events..."
          leftIcon={<Search className="h-4 w-4" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-4 text-left">Event</th>
              <th className="p-4 text-left">When</th>
              <th className="p-4 text-left">City</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Tickets</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="p-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {e.coverImage ? (
                        <img
                          src={e.coverImage}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <ImagePlus className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium">{e.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{e.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(e.startDate, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-4 text-muted-foreground">{e.city}</td>
                  <td className="p-4">
                    {e.pricePerTicket > 0 ? formatCurrency(e.pricePerTicket) : 'Free'}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {e.ticketsSold}/{e.ticketsAvailable}
                  </td>
                  <td className="p-4">
                    <Badge variant={e.isFeatured ? 'success' : 'default'}>
                      {e.isFeatured ? 'Featured' : 'Standard'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/dashboard/events/${e.slug}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setPendingDelete(e)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-0">
                  <EmptyState
                    icon={<CalendarPlus className="h-6 w-6" />}
                    title={query ? 'No matching events' : 'No events yet'}
                    description={
                      query
                        ? 'Try a different search term.'
                        : 'Create your first event to start taking RSVPs.'
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this event?"
          description={`"${pendingDelete.title}" will be removed from your dashboard and all public listings. Existing guest RSVPs are kept for your records. This can't be undone from here.`}
          confirmLabel="Delete event"
          destructive
          isLoading={deleteEvent.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
