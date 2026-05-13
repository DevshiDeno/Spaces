import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VenueGalleryProps {
  images: string[];
  alt: string;
}

export function VenueGallery({ images, alt }: VenueGalleryProps) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : ['/images/venue-1.jpg'];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
        <AnimatePresence mode="wait">
          <motion.img
            key={safeImages[active]}
            src={safeImages[active]}
            alt={alt}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
      {safeImages.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {safeImages.slice(0, 4).map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(idx)}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg ring-offset-2 transition ${
                active === idx ? 'ring-2 ring-primary' : 'ring-0 hover:opacity-90'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
