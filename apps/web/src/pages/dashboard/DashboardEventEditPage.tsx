import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { useMyVenues } from '@/hooks/useVenues';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/useToast';
import {
  EventForm,
  eventToFormValues,
  type EventFormValues,
} from '@/features/dashboard/EventForm';

export default function DashboardEventEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: event, isLoading, isError } = useEvent(slug);
  const update = useUpdateEvent();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: venues } = useMyVenues(isAuthenticated);

  async function handleSubmit(values: EventFormValues) {
    if (!event) return;
    try {
      const updated = await update.mutateAsync({
        id: event.id,
        payload: {
          title: values.title,
          category: values.category,
          description: values.description,
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
          city: values.city,
          venueId: values.venueId || undefined,
          pricePerTicket: values.pricePerTicket,
          ticketsAvailable: values.ticketsAvailable,
          coverImage: values.coverImage,
          isFeatured: values.isFeatured,
          organizer: values.organizer,
        },
      });
      toast.success('Changes saved', `${updated.title} updated.`);
      navigate('/dashboard/events');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Could not save changes.';
      toast.error('Save failed', message);
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/dashboard/events')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </button>

      <div>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Edit event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the details below. Changes go live as soon as you save.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : isError || !event ? (
        <EmptyState
          title="Event not found"
          description="The event you were trying to edit no longer exists."
          action={<Button onClick={() => navigate('/dashboard/events')}>Back to Events</Button>}
        />
      ) : (
        <EventForm
          defaultValues={eventToFormValues(event)}
          venues={(venues ?? []).map((v) => ({ id: v.id, name: v.name }))}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/events')}
          submitLabel="Save changes"
        />
      )}
    </div>
  );
}
