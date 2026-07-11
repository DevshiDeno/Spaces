import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, Check, Copy, Phone, Send } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { payoutsService } from '@/services/payouts.service';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/utils/format';

export default function DashboardPayoutsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [payoutRef, setPayoutRef] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payouts', 'admin', 'pending'],
    queryFn: () => payoutsService.adminPending(),
  });

  const settle = useMutation({
    mutationFn: ({ id, ref }: { id: string; ref: string }) => payoutsService.settle(id, ref),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast.success('Payout marked as settled', 'Owner has been emailed.');
      setOpenId(null);
      setPayoutRef('');
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Could not record the payout. Please try again.';
      toast.error('Settlement failed', message);
    },
  });

  const totalPending =
    data?.reduce((sum, b) => sum + (b.payoutAmount ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Owners awaiting settlement. Disburse via M-Pesa Business, then record the reference here.
          </p>
        </div>
        {data && data.length > 0 && (
          <div className="rounded-2xl border border-border bg-card px-5 py-3 text-right">
            <p className="text-xs text-muted-foreground">Total pending</p>
            <p className="text-xl font-semibold tracking-tight">{formatCurrency(totalPending)}</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Banknote className="h-6 w-6" />}
          title="All caught up"
          description="No bookings are waiting on a payout right now."
        />
      ) : (
        <div className="space-y-3">
          {data.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold tracking-tight">
                      {b.venue?.name ?? '—'}
                    </h3>
                    <Badge variant="warning">Pending</Badge>
                    <span className="text-xs text-muted-foreground">
                      booked {formatDate(b.createdAt, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-4 text-sm sm:grid-cols-3">
                    <Field
                      label="Pay to"
                      value={
                        b.venue?.payoutPhone ??
                        b.venue?.payoutTill ??
                        (b.venue?.payoutPaybill
                          ? `Paybill ${b.venue.payoutPaybill} · Acc ${b.venue.payoutAccount ?? ''}`
                          : undefined) ??
                        'No payout target set'
                      }
                      missing={
                        !b.venue?.payoutPhone && !b.venue?.payoutTill && !b.venue?.payoutPaybill
                      }
                      copy
                    />
                    <Field
                      label="Owner"
                      value={`${b.venue?.owner?.name ?? '—'} · ${b.venue?.owner?.email ?? '—'}`}
                    />
                    <Field
                      label="Customer"
                      value={`${b.user?.name ?? '—'} · ${formatDate(b.date, { month: 'short', day: 'numeric' })} ${b.startTime}–${b.endTime}`}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <Money label="Gross" value={b.totalAmount} />
                    <Money label="Commission" value={-(b.commissionAmount ?? 0)} muted />
                    <Money label="Net payout" value={b.payoutAmount ?? 0} bold />
                  </div>
                </div>
                <div className="lg:w-72">
                  {openId === b.id ? (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                      <Input
                        label="M-Pesa reference"
                        placeholder="e.g. SLA12B3CDE"
                        value={payoutRef}
                        onChange={(e) => setPayoutRef(e.target.value.toUpperCase())}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          fullWidth
                          isLoading={settle.isPending}
                          disabled={
                            payoutRef.length < 3 ||
                            !(b.venue?.payoutPhone || b.venue?.payoutTill || b.venue?.payoutPaybill)
                          }
                          onClick={() => settle.mutate({ id: b.id, ref: payoutRef.trim() })}
                          leftIcon={<Check className="h-3.5 w-3.5" />}
                        >
                          Mark settled
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOpenId(null);
                            setPayoutRef('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      fullWidth
                      onClick={() => {
                        setOpenId(b.id);
                        setPayoutRef('');
                      }}
                      leftIcon={<Send className="h-4 w-4" />}
                    >
                      Record payout
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  missing = false,
  copy = false,
}: {
  label: string;
  value: string;
  missing?: boolean;
  copy?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-center gap-1.5">
        {copy && !missing ? (
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(value)}
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            title="Copy"
          >
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            {value}
            <Copy className="h-3 w-3 text-muted-foreground" />
          </button>
        ) : (
          <p className={`text-sm ${missing ? 'text-destructive' : 'font-medium'}`}>{value}</p>
        )}
      </div>
    </div>
  );
}

function Money({
  label,
  value,
  muted = false,
  bold = false,
}: {
  label: string;
  value: number;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 ${bold ? 'font-semibold' : ''} ${muted ? 'text-muted-foreground' : ''}`}>
        {value < 0 ? `−${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
      </p>
    </div>
  );
}
