import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Users, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { bookingsService } from '@/services/bookings.service';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Booking } from '@/types';

// Bookings that occupy a slot. CANCELLED ones are released, so they're hidden.
const VISIBLE_STATUSES: Booking['status'][] = ['CONFIRMED', 'PENDING', 'COMPLETED'];

const STATUS_STYLES: Record<string, { dot: string; pill: string; label: string }> = {
  CONFIRMED: {
    dot: 'bg-emerald-500',
    pill: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    label: 'Confirmed',
  },
  PENDING: {
    dot: 'bg-amber-500',
    pill: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    label: 'Pending (held)',
  },
  COMPLETED: {
    dot: 'bg-sky-500',
    pill: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    label: 'Completed',
  },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Local YYYY-MM-DD for a Date built via the (year, month, day) constructor (no TZ drift). */
function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Booking.date is stored at UTC midnight; the calendar day is its date prefix. */
function bookingDayKey(iso: string): string {
  return iso.slice(0, 10);
}

export default function DashboardCalendarPage() {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [venueFilter, setVenueFilter] = useState<string>('all');
  const [selectedKey, setSelectedKey] = useState<string>(dayKey(today));

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'owner'],
    queryFn: () => bookingsService.listForOwner(),
  });

  const venues = useMemo(() => {
    const names = new Set<string>();
    (data ?? []).forEach((b) => {
      const name = b.venue?.name ?? b.venueName;
      if (name) names.add(name);
    });
    return Array.from(names).sort();
  }, [data]);

  // Group visible bookings by calendar day, honoring the venue filter.
  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    (data ?? []).forEach((b) => {
      if (!VISIBLE_STATUSES.includes(b.status)) return;
      const name = b.venue?.name ?? b.venueName;
      if (venueFilter !== 'all' && name !== venueFilter) return;
      const key = bookingDayKey(b.date);
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    });
    // Sort each day's bookings by start time for a stable, readable order.
    map.forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [data, venueFilter]);

  // 42-cell grid (6 weeks) starting on the Sunday on/before the 1st.
  const cells = useMemo(() => {
    const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
    return Array.from({ length: 42 }, (_, i) =>
      new Date(cursor.year, cursor.month, 1 - firstWeekday + i)
    );
  }, [cursor]);

  const selectedBookings = byDay.get(selectedKey) ?? [];
  const todayKey = dayKey(today);

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bookings across your venues at a glance. Cancelled bookings are hidden.
          </p>
        </div>
        {venues.length > 0 && (
          <select
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All venues</option>
            {venues.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">
              {MONTHS[cursor.month]} {cursor.year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}
                className="mr-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Today
              </button>
              <button
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="rounded-md border border-border p-1.5 hover:bg-muted/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="rounded-md border border-border p-1.5 hover:bg-muted/50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-[480px] rounded-md" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((cell, i) => {
                  const key = dayKey(cell);
                  const inMonth = cell.getMonth() === cursor.month;
                  const dayBookings = byDay.get(key) ?? [];
                  const isToday = key === todayKey;
                  const isSelected = key === selectedKey;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedKey(key)}
                      className={cn(
                        'flex min-h-[92px] flex-col gap-1 border-b border-r border-border p-1.5 text-left transition-colors',
                        i % 7 === 0 && 'border-l',
                        !inMonth && 'bg-muted/20 text-muted-foreground',
                        isSelected ? 'bg-primary/5 ring-1 ring-inset ring-primary/40' : 'hover:bg-muted/30'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center self-start rounded-full text-xs',
                          isToday && 'bg-primary font-semibold text-primary-foreground'
                        )}
                      >
                        {cell.getDate()}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        {dayBookings.slice(0, 2).map((b) => {
                          const s = STATUS_STYLES[b.status];
                          return (
                            <span
                              key={b.id}
                              className={cn(
                                'truncate rounded border px-1 py-0.5 text-[10px] leading-tight',
                                s?.pill
                              )}
                              title={`${b.startTime}–${b.endTime} · ${b.venue?.name ?? b.venueName ?? ''}`}
                            >
                              {b.startTime} {b.venue?.name ?? b.venueName ?? 'Booking'}
                            </span>
                          );
                        })}
                        {dayBookings.length > 2 && (
                          <span className="px-1 text-[10px] text-muted-foreground">
                            +{dayBookings.length - 2} more
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Day detail */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {new Date(`${selectedKey}T00:00:00`).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </h3>

          <div className="mt-4 space-y-3">
            {selectedBookings.length === 0 ? (
              <EmptyState
                icon={<CalendarDays className="h-6 w-6" />}
                title="No bookings"
                description="Nothing scheduled for this day."
              />
            ) : (
              selectedBookings.map((b) => {
                const s = STATUS_STYLES[b.status];
                return (
                  <div key={b.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{b.startTime}–{b.endTime}</span>
                      <Badge variant="outline" className="gap-1">
                        <span className={cn('h-2 w-2 rounded-full', s?.dot)} />
                        {s?.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {b.venue?.name ?? b.venueName ?? '—'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {b.guestCount} · {b.user?.name ?? 'Guest'}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(b.totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
