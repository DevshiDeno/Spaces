import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  Loader2,
  Phone,
  Smartphone,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { bookingsService } from '@/services/bookings.service';
import { formatCurrency } from '@/utils/format';
import type { Booking, PaymentMethod, Venue } from '@/types';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60_000;
const PHONE_REGEX = /^(?:\+?254|0)?(7|1)\d{8}$/;

interface BookingFormProps {
  venue: Venue;
}

type Phase = 'form' | 'awaiting_payment' | 'success' | 'failed';

export function BookingForm({ venue }: BookingFormProps) {
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>('form');
  const [isSubmitting, setSubmitting] = useState(false);
  const [date, setDate] = useState('');
  const [start, setStart] = useState('17:00');
  const [end, setEnd] = useState('22:00');
  const [guests, setGuests] = useState(20);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MPESA');
  const [phone, setPhone] = useState('');
  const [requests, setRequests] = useState('');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollDeadline = useRef<number>(0);

  useEffect(
    () => () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    },
    []
  );

  const startHour = Number(start.split(':')[0] ?? 0);
  const endHour = Number(end.split(':')[0] ?? 0);
  const hours = Math.max(1, endHour - startHour);
  const subtotal = venue.pricePerHour * hours;
  const total = subtotal + venue.bookingFee;
  const phoneInvalid =
    paymentMethod === 'MPESA' && phone.trim() !== '' && !PHONE_REGEX.test(phone.trim());

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  function startPollingBooking(bookingId: string) {
    pollDeadline.current = Date.now() + POLL_TIMEOUT_MS;
    pollTimer.current = setInterval(async () => {
      try {
        const fresh = await bookingsService.getById(bookingId);
        setActiveBooking(fresh);
        if (fresh.paymentStatus === 'SUCCEEDED') {
          stopPolling();
          setPhase('success');
          toast.success('Payment confirmed', `${venue.name} is booked.`);
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
        // Transient — keep polling until deadline
        console.warn('Booking poll failed', err);
      }
    }, POLL_INTERVAL_MS);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    if (paymentMethod === 'MPESA' && !PHONE_REGEX.test(phone.trim())) {
      toast.error('Enter a valid Kenyan phone number for M-Pesa');
      return;
    }
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const booking = await bookingsService.create({
        venueId: venue.id,
        date,
        startTime: start,
        endTime: end,
        guestCount: guests,
        paymentMethod,
        phone: paymentMethod === 'MPESA' ? phone.trim() : undefined,
        specialRequests: requests || undefined,
        totalAmount: total,
      });
      setActiveBooking(booking);

      if (booking.paymentStatus === 'SUCCEEDED') {
        setPhase('success');
        toast.success('Booking confirmed!', `${venue.name} is reserved.`);
        return;
      }
      if (booking.paymentStatus === 'FAILED') {
        setPhase('failed');
        setStatusMessage('Could not start the payment. Please try again.');
        return;
      }
      // PENDING — start polling
      setPhase('awaiting_payment');
      startPollingBooking(booking.id);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Booking failed.';
      toast.error('Booking failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    stopPolling();
    setActiveBooking(null);
    setStatusMessage(null);
    setPhase('form');
  }

  if (phase === 'success' && activeBooking) {
    return (
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
              <Check className="h-4 w-4" />
            </span>
            Booking confirmed
          </CardTitle>
          <CardDescription>{venue.name} on {date}, {start}–{end}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Total paid" value={formatCurrency(activeBooking.totalAmount)} />
          <Row label="Reference" value={activeBooking.paymentRef ?? activeBooking.id} />
          <Button variant="outline" fullWidth onClick={resetForm}>
            Make another booking
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'awaiting_payment') {
    return (
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
          <Row label="Amount" value={formatCurrency(total)} />
          <Row label="Phone" value={phone} />
          <p className="text-xs text-muted-foreground">
            This may take up to 60 seconds. You can leave this page; the booking will appear in
            your dashboard once payment succeeds.
          </p>
          <Button variant="outline" fullWidth onClick={resetForm}>
            Cancel & start over
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'failed') {
    return (
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
          <Button fullWidth onClick={resetForm}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Book this venue</CardTitle>
        <CardDescription>
          Reserve in minutes — confirmation emailed instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Start time"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              leftIcon={<Clock className="h-4 w-4" />}
              required
            />
            <Input
              label="End time"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              leftIcon={<Clock className="h-4 w-4" />}
              required
            />
          </div>
          <Input
            label="Guest count"
            type="number"
            min={1}
            max={venue.capacity}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            leftIcon={<Users className="h-4 w-4" />}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium">Payment method</label>
            <div className="grid grid-cols-2 gap-2">
              <PaymentTile
                active={paymentMethod === 'MPESA'}
                onClick={() => setPaymentMethod('MPESA')}
                icon={<Smartphone className="h-4 w-4" />}
                title="M-Pesa"
                hint="STK push"
              />
              <PaymentTile
                active={paymentMethod === 'CARD'}
                onClick={() => setPaymentMethod('CARD')}
                icon={<CreditCard className="h-4 w-4" />}
                title="Card"
                hint="Visa / MC"
              />
            </div>
          </div>

          {paymentMethod === 'MPESA' && (
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
            />
          )}

          <Textarea
            label="Special requests (optional)"
            placeholder="Any dietary requirements, accessibility needs, etc."
            value={requests}
            onChange={(e) => setRequests(e.target.value)}
            rows={3}
          />

          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{formatCurrency(venue.pricePerHour)} × {hours}h</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Booking fee</span>
              <span>{formatCurrency(venue.bookingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
            {paymentMethod === 'MPESA' ? 'Pay with M-Pesa' : 'Proceed to Payment'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Your payment information is secure and encrypted.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function PaymentTile({
  active,
  onClick,
  icon,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition ${
        active
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border hover:border-foreground/30'
      }`}
    >
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
          active ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-medium">{title}</span>
      <span className="text-[11px] text-muted-foreground">{hint}</span>
    </button>
  );
}
