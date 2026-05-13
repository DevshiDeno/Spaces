import { useState } from 'react';
import { Calendar, Clock, CreditCard, Smartphone, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { bookingsService } from '@/services/bookings.service';
import { formatCurrency } from '@/utils/format';
import type { Venue } from '@/types';

interface BookingFormProps {
  venue: Venue;
}

export function BookingForm({ venue }: BookingFormProps) {
  const toast = useToast();
  const [isSubmitting, setSubmitting] = useState(false);
  const [date, setDate] = useState('');
  const [start, setStart] = useState('17:00');
  const [end, setEnd] = useState('22:00');
  const [guests, setGuests] = useState(20);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [requests, setRequests] = useState('');

  const startHour = Number(start.split(':')[0] ?? 0);
  const endHour = Number(end.split(':')[0] ?? 0);
  const hours = Math.max(1, endHour - startHour);
  const subtotal = venue.pricePerHour * hours;
  const total = subtotal + venue.bookingFee;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    setSubmitting(true);
    try {
      const booking = await bookingsService.create({
        venueId: venue.id,
        date,
        startTime: start,
        endTime: end,
        guestCount: guests,
        paymentMethod,
        specialRequests: requests || undefined,
        totalAmount: total,
      });
      toast.success(
        'Booking confirmed!',
        paymentMethod === 'mpesa'
          ? "You'll receive an STK push on your phone to complete payment."
          : `Reference: ${booking.id}`
      );
    } catch (err) {
      toast.error('Booking failed', 'Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
                active={paymentMethod === 'mpesa'}
                onClick={() => setPaymentMethod('mpesa')}
                icon={<Smartphone className="h-4 w-4" />}
                title="M-Pesa"
                hint="STK push"
              />
              <PaymentTile
                active={paymentMethod === 'card'}
                onClick={() => setPaymentMethod('card')}
                icon={<CreditCard className="h-4 w-4" />}
                title="Card"
                hint="Visa / MC"
              />
            </div>
          </div>

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
            Proceed to Payment
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Your payment information is secure and encrypted.
          </p>
        </form>
      </CardContent>
    </Card>
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
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${active ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        {icon}
      </span>
      <span className="text-sm font-medium">{title}</span>
      <span className="text-[11px] text-muted-foreground">{hint}</span>
    </button>
  );
}
