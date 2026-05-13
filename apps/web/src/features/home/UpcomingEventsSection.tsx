import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section, SectionHeading } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventCard, EventCardSkeleton } from '@/features/events/EventCard';
import { useFeaturedEvents } from '@/hooks/useEvents';

export function UpcomingEventsSection() {
  const { data, isLoading } = useFeaturedEvents();

  return (
    <Section spacing="normal">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Upcoming Events"
            title="Join our community of inclusive spaces"
            description="Workshops, listening parties, supper clubs, and safer-space socials happening near you."
          />
          <Link
            to="/events"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            Browse All Events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
          {data?.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-4">
              <EmptyState title="No upcoming events at the moment." />
            </div>
          )}
          {data?.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
        </div>
      </Container>
    </Section>
  );
}
