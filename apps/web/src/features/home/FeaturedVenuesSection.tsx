import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ErrorState } from '@/components/ui/ErrorState';
import { VenueCard, VenueCardSkeleton } from '@/features/venues/VenueCard';
import { useFeaturedVenues } from '@/hooks/useVenues';

export function FeaturedVenuesSection() {
  const { data, isLoading, isError, refetch } = useFeaturedVenues();

  return (
    <Section spacing="normal" className="bg-gradient-to-b from-background to-cream/40 dark:to-background">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Featured Venues"
            title="Discover spaces built around taste and atmosphere"
            description="Discover some of our most popular verified ally spaces — curated for vibe, safety, and storytelling."
          />
          <Link
            to="/venues"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            View All Venues <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <VenueCardSkeleton key={i} />)}
          {isError && (
            <div className="sm:col-span-2 lg:col-span-3">
              <ErrorState onRetry={() => refetch()} />
            </div>
          )}
          {data?.map((venue, i) => <VenueCard key={venue.id} venue={venue} index={i} />)}
        </div>
      </Container>
    </Section>
  );
}
