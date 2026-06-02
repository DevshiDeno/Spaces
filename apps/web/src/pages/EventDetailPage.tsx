import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Check,
  Loader2,
  MapPin,
  Phone,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useEvent } from '@/hooks/useEvents';
import { eventsService } from '@/services/events.service';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Rsvp } from '@/types';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60_000;
const PHONE_REGEX = /^(?:\+?254|0)?(7|1)\d{8}$/;

type Phase = 'form' | 'awaiting_payment' | 'success' | 'failed';

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading, isError, refetch } = useEvent(slug);
  const [tickets, setTickets] = useState(1);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [activeRsvp, setActiveRsvp] = useState<Rsvp | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollDeadline = useRef<number>(0);
  const toast = useToast();

  useEffect(
    () => () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    },
    []
  );

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  function startPollingRsvp(rsvpId: string) {
    pollDeadline.current = Date.now() + POLL_TIMEOUT_MS;
    pollTimer.current = setInterval(async () => {
      try {
        const fresh = await eventsService.getRsvp(rsvpId);
        setActiveRsvp(fresh);
        if (fresh.paymentStatus === 'SUCCEEDED') {
          stopPolling();
          setPhase('success');
          toast.success("You're registered!", `Reference: ${fresh.reference}`);
          return;
        }
        if (fresh.paymentStatus === 'FAILED') {
          stopPolling();
          setPhase('failed');
          setStatusMessage('Payment failed or was cancelled on your phone.');
          return;
        }
        if (Date.now() > pollDeadline.current) {
          stopPolling();
          setPhase('failed');
          setStatusMessage(
            "We didn't get confirmation within 60s. Check the M-Pesa prompt on your phone, or try again."
          );
        }
      } catch (err) {
        console.warn('RSVP poll failed', err);
      }
    }, POLL_INTERVAL_MS);
  }

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
  const isPaid = event.pricePerTicket > 0;
  const total = event.pricePerTicket * tickets;
  const phoneInvalid = isPaid && phone.trim() !== '' && !PHONE_REGEX.test(phone.trim());

  async function handleRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    if (isPaid && !PHONE_REGEX.test(phone.trim())) {
      toast.error('Enter a valid Kenyan phone number for M-Pesa');
      return;
    }
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await eventsService.rsvp(event.id, {
        attendees: tickets,
        paymentMethod: isPaid ? 'MPESA' : undefined,
        phone: isPaid ? phone.trim() : undefined,
      });
      setActiveRsvp(res.rsvp);

      if (!isPaid) {
        setPhase('success');
        toast.success("You're registered!", `Reference: ${res.reference}`);
        return;
      }
      if (res.rsvp.paymentStatus === 'SUCCEEDED') {
        setPhase('success');
        toast.success('Payment confirmed', `Reference: ${res.reference}`);
        return;
      }
      if (res.rsvp.paymentStatus === 'FAILED') {
        setPhase('failed');
        setStatusMessage('Could not start the payment. Please try again.');
        return;
      }
      setPhase('awaiting_payment');
      startPollingRsvp(res.rsvp.id);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to complete RSVP.';
      toast.error('RSVP failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    stopPolling();
    setActiveRsvp(null);
    setStatusMessage(null);
    setPhase('form');
  }

  return (
    <Container className="py-10 sm:py-14">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={event.coverImage}
              alt={event.title}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="accent">{event.category}</Badge>
            {event.isFeatured && <Badge variant="primary">Featured</Badge>}
            {soldOut && <Badge variant="warning">Sold Out</Badge>}
            {!isPaid && <Badge variant="success">Free</Badge>}
          </div>
          <h1 className="heading-display mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{event.description}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <DetailRow
              icon={<Calendar className="h-4 w-4 text-primary" />}
              label="When"
              value={`${formatDate(event.startDate, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} — ${formatDate(event.endDate, { hour: '2-digit', minute: '2-digit' })}`}
            />
            <DetailRow
              icon={<MapPin className="h-4 w-4 text-primary" />}
              label="Where"
              value={`${event.venueName ?? 'TBA'}, ${event.city}`}
            />
            <DetailRow
              icon={<Users className="h-4 w-4 text-primary" />}
              label="Organizer"
              value={event.organizer}
            />
            <DetailRow
              icon={<Ticket className="h-4 w-4 text-primary" />}
              label="Price"
              value={isPaid ? `${formatCurrency(event.pricePerTicket)} / ticket` : 'Free'}
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          {phase === 'success' && activeRsvp ? (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                    <Check className="h-4 w-4" />
                  </span>
                  You're in
                </CardTitle>
                <CardDescription>{event.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <StatusRow label="Tickets" value={`${activeRsvp.attendees}`} />
                {isPaid && (
                  <StatusRow label="Paid" value={formatCurrency(activeRsvp.totalAmount)} />
                )}
                <StatusRow label="Reference" value={activeRsvp.reference} />
                <Button variant="outline" fullWidth onClick={resetForm}>
                  Done
                </Button>
              </CardContent>
            </Card>
          ) : phase === 'awaiting_payment' ? (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Waiting for M-Pesa
                </CardTitle>
                <CardDescription>
                  Check your phone for the STK prompt and enter your PIN to confirm.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <StatusRow label="Amount" value={formatCurrency(total)} />
                <StatusRow label="Phone" value={phone} />
                <p className="text-xs text-muted-foreground">
                  This may take up to 60 seconds.
                </p>
                <Button variant="outline" fullWidth onClick={resetForm}>
                  Cancel & start over
                </Button>
              </CardContent>
            </Card>
          ) : phase === 'failed' ? (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                    <X className="h-4 w-4" />
                  </span>
                  Payment didn't go through
                </CardTitle>
                <CardDescription>{statusMessage ?? 'Please try again.'}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button fullWidth onClick={resetForm}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{isPaid ? 'Reserve your tickets' : 'RSVP to this event'}</CardTitle>
                {isPaid && (
                  <CardDescription>
                    Paid event — you'll receive an M-Pesa prompt after submitting.
                  </CardDescription>
                )}
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

                  {isPaid && (
                    <Input
                      label="M-Pesa phone number"
                      type="tel"
                      inputMode="numeric"
                      placeholder="07XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      leftIcon={<Phone className="h-4 w-4" />}
                      hint={
                        phoneInvalid
                          ? 'Use a Kenyan number e.g. 0712345678 or +254712345678'
                          : "We'll send a Lipa Na M-Pesa prompt to this number."
                      }
                      error={phoneInvalid ? ' ' : undefined}
                      required
                      disabled={soldOut}
                    />
                  )}

                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-base font-semibold">
                      {isPaid ? formatCurrency(total) : 'Free'}
                    </span>
                  </div>
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={submitting}
                    disabled={soldOut}
                  >
                    {soldOut
                      ? 'Sold Out'
                      : isPaid
                        ? 'Pay with M-Pesa'
                        : 'Complete Registration'}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    A confirmation email will be sent to your account.
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
