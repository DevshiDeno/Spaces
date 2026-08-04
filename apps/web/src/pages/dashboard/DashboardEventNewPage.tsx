import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateEvent } from '@/hooks/useEvents';
import { useMyVenues } from '@/hooks/useVenues';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/useToast';
import {
  EventForm,
  EVENT_FORM_EMPTY_DEFAULTS,
  type EventFormValues,
} from '@/features/dashboard/EventForm';

export default function DashboardEventNewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const create = useCreateEvent();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: venues } = useMyVenues(isAuthenticated);

  async function handleSubmit(values: EventFormValues) {
    try {
      const event = await create.mutateAsync({
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
      });
      toast.success('Event created', `${event.title} is now live.`);
      navigate('/dashboard/events');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Could not create the event.';
      toast.error('Creation failed', message);
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
        <h1 className="heading-display text-3xl font-bold tracking-tight">Create an event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish a ticketed or free event. Guests can RSVP once it's live.
        </p>
      </div>

      <EventForm
        defaultValues={EVENT_FORM_EMPTY_DEFAULTS}
        venues={(venues ?? []).map((v) => ({ id: v.id, name: v.name }))}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/dashboard/events')}
        submitLabel="Create event"
      />
    </div>
  );
}
