import { useQuery } from '@tanstack/react-query';
import { Banknote, Clock, CheckCircle2, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/features/dashboard/StatCard';
import { payoutsService } from '@/services/payouts.service';
import { formatCurrency, formatDate } from '@/utils/format';

export default function DashboardEarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['payouts', 'owner'],
    queryFn: () => payoutsService.ownerSummary(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track what you've earned, what's owed, and when it lands in your M-Pesa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Pending settlement"
              value={formatCurrency(data.summary.pendingSettlement)}
              icon={Clock}
              hint="Awaiting next payout"
            />
            <StatCard
              label="Settled this month"
              value={formatCurrency(data.summary.settledThisMonth)}
              icon={Banknote}
              hint="Already in your M-Pesa"
            />
            <StatCard
              label="Lifetime settled"
              value={formatCurrency(data.summary.settledLifetime)}
              icon={CheckCircle2}
              hint={`${data.summary.bookingCount} paid bookings`}
            />
            <StatCard
              label="Total earned (gross)"
              value={formatCurrency(data.summary.totalEarned)}
              icon={Wallet}
              hint="Before platform fee"
            />
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold tracking-tight">Bookings</h2>
          <p className="text-xs text-muted-foreground">
            Every paid booking on your venues. Refresh to see new ones.
          </p>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-md" />
            ))}
          </div>
        ) : !data || data.bookings.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Banknote className="h-6 w-6" />}
              title="No earnings yet"
              description="Once customers start booking your venues, you'll see them here."
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-4 text-left">Venue</th>
                <th className="p-4 text-left">When</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-right">Gross</th>
                <th className="p-4 text-right">Fee</th>
                <th className="p-4 text-right">You earn</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.bookings.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium">{b.venue?.name ?? '—'}</td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(b.date, { month: 'short', day: 'numeric' })} · {b.startTime}–{b.endTime}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {b.user?.name?.split(' ')[0] ?? '—'}
                  </td>
                  <td className="p-4 text-right">{formatCurrency(b.totalAmount)}</td>
                  <td className="p-4 text-right text-muted-foreground">
                    −{formatCurrency(b.commissionAmount ?? 0)}
                  </td>
                  <td className="p-4 text-right font-semibold">
                    {formatCurrency(b.payoutAmount ?? 0)}
                  </td>
                  <td className="p-4">
                    <PayoutBadge
                      status={b.payoutStatus ?? null}
                      payoutAt={b.payoutAt ?? null}
                      payoutRef={b.payoutRef ?? null}
                    />
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

function PayoutBadge({
  status,
  payoutAt,
  payoutRef,
}: {
  status: 'PENDING' | 'SETTLED' | 'FAILED' | null;
  payoutAt: string | null;
  payoutRef: string | null;
}) {
  if (status === 'SETTLED') {
    return (
      <div>
        <Badge variant="success">Settled</Badge>
        {payoutAt && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatDate(payoutAt, { month: 'short', day: 'numeric' })}
            {payoutRef ? ` · ${payoutRef}` : ''}
          </p>
        )}
      </div>
    );
  }
  if (status === 'FAILED') return <Badge variant="warning">Failed</Badge>;
  if (status === 'PENDING') return <Badge variant="warning">Pending payout</Badge>;
  return <Badge variant="outline">—</Badge>;
}
