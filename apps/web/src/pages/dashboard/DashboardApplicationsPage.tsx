import { useQuery } from '@tanstack/react-query';
import { Mail, Phone } from 'lucide-react';
import { applicationsService } from '@/services/applications.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardApplicationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'pending'],
    queryFn: () => applicationsService.pending(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Ally Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pending venue applications awaiting review.</p>
      </div>

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
                <Button variant="outline" size="sm">Reject</Button>
                <Button size="sm">Approve</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
