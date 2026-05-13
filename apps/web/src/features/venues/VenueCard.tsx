import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, Verified } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/format';
import type { Venue } from '@/types';

interface VenueCardProps {
  venue: Venue;
  index?: number;
}

export function VenueCard({ venue, index = 0 }: VenueCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
    >
      <Link to={`/venues/${venue.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={venue.coverImage}
            alt={venue.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {venue.isVerified && (
              <Badge variant="primary" className="bg-white/95 text-coral-600 shadow-sm backdrop-blur">
                <Verified className="h-3 w-3" />
                Verified Ally
              </Badge>
            )}
            <span className="ml-auto rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
              {formatCurrency(venue.pricePerHour)}/hr
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <MapPin className="h-3 w-3" /> {venue.city}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {venue.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{venue.type}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> Up to {venue.capacity}
            </span>
          </div>
          <h3 className="mt-1.5 line-clamp-1 text-base font-semibold tracking-tight">
            {venue.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{venue.tagline}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {venue.moods.slice(0, 2).map((m) => (
              <Badge key={m} variant="default">{m}</Badge>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function VenueCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="skeleton aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-5">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    </div>
  );
}
