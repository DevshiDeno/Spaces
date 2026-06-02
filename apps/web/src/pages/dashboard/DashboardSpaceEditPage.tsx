import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useVenue, useUpdateVenue } from '@/hooks/useVenues';
import { useToast } from '@/hooks/useToast';
import { SpaceForm, type SpaceFormValues } from '@/features/dashboard/SpaceForm';
import type { Venue } from '@/types';

function toFormValues(v: Venue): SpaceFormValues {
  return {
    name: v.name,
    tagline: v.tagline,
    description: v.description,
    type: v.type,
    city: v.city,
    address: v.address,
    capacity: v.capacity,
    pricePerHour: v.pricePerHour,
    bookingFee: v.bookingFee ?? 0,
    coverImage: v.coverImage,
    noiseLevel: (v.noiseLevel.toString().toUpperCase() as 'QUIET' | 'MODERATE' | 'LOUD') ?? 'MODERATE',
    amenities: v.amenities ?? [],
    moods: v.moods ?? [],
    bestFor: v.bestFor ?? [],
    timeOfDay: v.timeOfDay ?? [],
    isPublished: v.isPublished ?? true,
  };
}

export default function DashboardSpaceEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: venue, isLoading, isError } = useVenue(slug);
  const update = useUpdateVenue();

  async function handleSubmit(values: SpaceFormValues) {
    if (!venue) return;
    try {
      const updated = await update.mutateAsync({ id: venue.id, payload: values });
      toast.success('Changes saved', `${updated.name} updated.`);
      navigate('/dashboard/spaces');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Could not save changes.';
      toast.error('Save failed', message);
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/dashboard/spaces')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Spaces
      </button>

      <div>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Edit space</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the details below. Changes go live as soon as you save.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : isError || !venue ? (
        <EmptyState
          title="Space not found"
          description="The venue you were trying to edit no longer exists."
          action={<Button onClick={() => navigate('/dashboard/spaces')}>Back to Spaces</Button>}
        />
      ) : (
        <SpaceForm
          defaultValues={toFormValues(venue)}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/spaces')}
          submitLabel="Save changes"
        />
      )}
    </div>
  );
}
