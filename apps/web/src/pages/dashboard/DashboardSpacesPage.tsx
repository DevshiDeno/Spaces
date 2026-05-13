import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useFeaturedVenues } from '@/hooks/useVenues';
import { formatCurrency } from '@/utils/format';

export default function DashboardSpacesPage() {
  const { data, isLoading } = useFeaturedVenues();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl font-bold tracking-tight">Spaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your venues, availability, and pricing.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Add New Space</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <Input placeholder="Search venues..." leftIcon={<Search className="h-4 w-4" />} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-4 text-left">Space</th>
              <th className="p-4 text-left">City</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Capacity</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="p-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              data?.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={v.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium">{v.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{v.city}</td>
                  <td className="p-4 text-muted-foreground">{v.type}</td>
                  <td className="p-4 text-muted-foreground">{v.capacity}</td>
                  <td className="p-4">{formatCurrency(v.pricePerHour)}/hr</td>
                  <td className="p-4">
                    <Badge variant={v.isVerified ? 'success' : 'warning'}>
                      {v.isVerified ? 'Published' : 'Draft - Not Published'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button size="sm" variant="ghost">Edit</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
