import { useEffect } from 'react';
import { X } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Button } from '@/components/ui/Button';
import { useAddVenueImages } from '@/hooks/useVenues';
import type { Venue } from '@/types';

interface VenueImagesDialogProps {
  venue: Venue;
  onClose: () => void;
}

export function VenueImagesDialog({ venue, onClose }: VenueImagesDialogProps) {
  const addImages = useAddVenueImages();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleUploaded = async (urls: string[]) => {
    await addImages.mutateAsync({ venueId: venue.id, urls });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="heading-display text-xl font-semibold tracking-tight">
              Manage images
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{venue.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ImageUploader folder={`venues/${venue.id}`} onUploaded={handleUploaded} />

        {venue.images.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium">Current images ({venue.images.length})</h3>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {venue.images.map((src) => (
                <div
                  key={src}
                  className="aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
