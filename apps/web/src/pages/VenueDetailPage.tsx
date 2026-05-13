import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Star,
  Users,
  Volume2,
  Clock,
  Verified,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { VenueGallery } from '@/features/venues/VenueGallery';
import { BookingForm } from '@/features/bookings/BookingForm';
import { useVenue } from '@/hooks/useVenues';

export default function VenueDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: venue, isLoading, isError, refetch } = useVenue(slug);

  if (isLoading) return <FullPageSpinner />;
  if (isError || !venue) {
    return (
      <Container className="py-20">
        <ErrorState
          title="Venue not found"
          description="The space you're looking for doesn't exist or was removed."
          onRetry={() => refetch()}
        />
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => history.back()}>
            <ArrowLeft className="h-4 w-4" /> Back to Pages
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <Link
        to="/venues"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All Venues
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              {venue.isVerified && (
                <Badge variant="primary">
                  <Verified className="h-3 w-3" /> Verified Ally
                </Badge>
              )}
              <Badge variant="default">{venue.type}</Badge>
            </div>
            <h1 className="heading-display mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {venue.name}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">{venue.tagline}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {venue.address}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {venue.rating.toFixed(1)} ({venue.reviewCount} reviews)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Up to {venue.capacity}
              </span>
            </div>
          </motion.div>

          <div className="mt-8">
            <VenueGallery images={venue.images} alt={venue.name} />
          </div>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="text-xl font-semibold tracking-tight">About this space</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
                {venue.description}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">Best for</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {venue.bestFor.map((item) => (
                  <Badge key={item} variant="outline">{item}</Badge>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">Amenities</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {venue.amenities.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {a}
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <DetailStat icon={<Volume2 className="h-4 w-4" />} label="Noise Level" value={venue.noiseLevel} />
              <DetailStat icon={<Clock className="h-4 w-4" />} label="Time of Day" value={venue.timeOfDay.join(', ')} />
              <DetailStat icon={<Users className="h-4 w-4" />} label="Capacity" value={`Up to ${venue.capacity}`} />
            </section>
          </div>
        </div>

        <div className="lg:col-span-5">
          <BookingForm venue={venue} />
        </div>
      </div>
    </Container>
  );
}

function DetailStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-base font-medium">{value}</p>
    </div>
  );
}
