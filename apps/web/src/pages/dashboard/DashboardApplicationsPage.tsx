import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Mail, Phone, X } from 'lucide-react';
import { applicationsService } from '@/services/applications.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';

interface IssuedInvite {
  applicationId: string;
  businessName: string;
  email: string;
  inviteUrl: string;
  inviteExpiresAt: string;
}

export default function DashboardApplicationsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [issuedInvite, setIssuedInvite] = useState<IssuedInvite | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'pending'],
    queryFn: () => applicationsService.pending(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => applicationsService.approve(id),
    onSuccess: (result) => {
      setIssuedInvite({
        applicationId: result.application.id,
        businessName: result.application.businessName,
        email: result.application.email,
        inviteUrl: result.inviteUrl,
        inviteExpiresAt: result.inviteExpiresAt,
      });
      queryClient.invalidateQueries({ queryKey: ['applications', 'pending'] });
      toast.success('Application approved', 'Invite link is ready to share.');
    },
    onError: () => toast.error('Could not approve application'),
    onSettled: () => setBusyId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => applicationsService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'pending'] });
      toast.success('Application rejected');
    },
    onError: () => toast.error('Could not reject application'),
    onSettled: () => setBusyId(null),
  });

  function handleApprove(id: string) {
    setBusyId(id);
    approveMutation.mutate(id);
  }

  function handleReject(id: string) {
    setBusyId(id);
    rejectMutation.mutate(id);
  }

  async function copyInvite() {
    if (!issuedInvite) return;
    try {
      await navigator.clipboard.writeText(issuedInvite.inviteUrl);
      toast.success('Invite link copied');
    } catch {
      toast.error('Could not copy — please copy manually');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Spacers Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pending venue applications awaiting review. Approving creates an invited owner account.
        </p>
      </div>

      {issuedInvite && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Invite ready for {issuedInvite.businessName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Share this one-time link with {issuedInvite.email}. Expires{' '}
                {new Date(issuedInvite.inviteExpiresAt).toLocaleDateString()}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIssuedInvite(null)}
              aria-label="Dismiss"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border bg-background px-3 py-2 text-xs">
              {issuedInvite.inviteUrl}
            </code>
            <Button size="sm" variant="outline" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={copyInvite}>
              Copy link
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : data?.length === 0 ? (
        <EmptyState title="No pending applications" />
      ) : (
        <div className="space-y-3">
          {data?.map((app) => (
            <div
              key={app.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold tracking-tight">{app.businessName}</h3>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="outline">{app.venueType}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{app.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{app.ownerName}</span>
                  <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {app.email}</span>
                  <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {app.phone}</span>
                  <span>{app.city}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(app.id)}
                  isLoading={busyId === app.id && rejectMutation.isPending}
                  disabled={busyId !== null}
                  leftIcon={<X className="h-3.5 w-3.5" />}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(app.id)}
                  isLoading={busyId === app.id && approveMutation.isPending}
                  disabled={busyId !== null}
                  leftIcon={<Check className="h-3.5 w-3.5" />}
                >
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
