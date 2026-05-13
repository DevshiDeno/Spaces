import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Ticket, Users } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useEvent } from '@/hooks/useEvents';
import { eventsService } from '@/services/events.service';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/utils/format';

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading, isError, refetch } = useEvent(slug);
  const [tickets, setTickets] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  if (isLoading) return <FullPageSpinner />;
  if (isError || !event) {
    return (
      <Container className="py-20">
        <ErrorState title="Event not found" onRetry={() => refetch()} />
      </Container>
    );
  }

  const remaining = event.ticketsAvailable - event.ticketsSold;
  const soldOut = remaining <= 0;
  const total = event.pricePerTicket * tickets;

  async function handleRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setSubmitting(true);
    try {
      const res = await eventsService.rsvp(event.id, tickets);
      toast.success("You're registered!", `Reference: ${res.reference}`);
    } catch {
      toast.error('Failed to complete RSVP', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-10 sm:py-14">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl">
            <img src={event.coverImage} alt={event.title} className="aspect-[16/10] w-full object-cover" />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="accent">{event.category}</Badge>
            {event.isFeatured && <Badge variant="primary">Featured</Badge>}
            {soldOut && <Badge variant="warning">Sold Out</Badge>}
          </div>
          <h1 className="heading-display mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{event.description}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <DetailRow icon={<Calendar className="h-4 w-4 text-primary" />}
              label="When"
              value={`${formatDate(event.startDate, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} — ${formatDate(event.endDate, { hour: '2-digit', minute: '2-digit' })}`}
            />
            <DetailRow icon={<MapPin className="h-4 w-4 text-primary" />}
              label="Where"
              value={`${event.venueName ?? 'TBA'}, ${event.city}`}
            />
            <DetailRow icon={<Users className="h-4 w-4 text-primary" />}
              label="Organizer"
              value={event.organizer}
            />
            <DetailRow icon={<Ticket className="h-4 w-4 text-primary" />}
              label="Price"
              value={formatCurrency(event.pricePerTicket)}
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>RSVP to this event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRsvp} className="space-y-4">
                <Input
                  label="Number of tickets"
                  type="number"
                  min={1}
                  max={Math.max(1, remaining)}
                  value={tickets}
                  onChange={(e) => setTickets(Number(e.target.value) || 1)}
                  hint={soldOut ? 'Sold out' : `${remaining} tickets remaining`}
                  disabled={soldOut}
                />
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-base font-semibold">{formatCurrency(total)}</span>
                </div>
                <Button type="submit" fullWidth size="lg" isLoading={submitting} disabled={soldOut}>
                  {soldOut ? 'Sold Out' : 'Complete Registration'}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  A confirmation email will be sent to your account.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
