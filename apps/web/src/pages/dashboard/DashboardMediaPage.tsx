import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const mockImages = ['/images/venue-1.jpg', '/images/venue-2.jpg', '/images/venue-3.jpg', '/images/hero-bg.jpg'];

export default function DashboardMediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">All images and videos across your spaces.</p>
        </div>
        <Button leftIcon={<Upload className="h-4 w-4" />}>Upload Media</Button>
      </div>

      {mockImages.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-6 w-6" />}
          title="No media files found"
          description="Upload images or videos to get started."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mockImages.map((src) => (
            <div key={src} className="group relative overflow-hidden rounded-xl border border-border">
              <img src={src} alt="" className="aspect-square w-full object-cover transition group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 truncate bg-black/60 p-2 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                {src.split('/').pop()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
