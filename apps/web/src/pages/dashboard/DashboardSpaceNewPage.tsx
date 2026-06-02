import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateVenue } from '@/hooks/useVenues';
import { useToast } from '@/hooks/useToast';
import {
  SpaceForm,
  SPACE_FORM_EMPTY_DEFAULTS,
  type SpaceFormValues,
} from '@/features/dashboard/SpaceForm';

export default function DashboardSpaceNewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const create = useCreateVenue();

  async function handleSubmit(values: SpaceFormValues) {
    try {
      const venue = await create.mutateAsync(values);
      toast.success('Space created', `${venue.name} is ${venue.isPublished ? 'live' : 'a draft'}.`);
      navigate('/dashboard/spaces');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Could not create the space.';
      toast.error('Creation failed', message);
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
        <h1 className="heading-display text-3xl font-bold tracking-tight">Add a new space</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your venue. You can update everything later from the Spaces list.
        </p>
      </div>

      <SpaceForm
        defaultValues={SPACE_FORM_EMPTY_DEFAULTS}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/dashboard/spaces')}
        submitLabel="Create space"
      />
    </div>
  );
}
