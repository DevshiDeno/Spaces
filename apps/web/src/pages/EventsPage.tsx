import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventCard, EventCardSkeleton } from '@/features/events/EventCard';
import { useEvents } from '@/hooks/useEvents';
import { EVENT_CATEGORIES } from '@/constants';

export default function EventsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const { data, isLoading } = useEvents();

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((e) => {
      if (category && e.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!`${e.title} ${e.venueName ?? ''} ${e.city}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data, query, category]);

  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-3xl">
        <h1 className="heading-display text-4xl font-bold tracking-tight sm:text-5xl">
          Events Calendar
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Join our inclusive community events, workshops, and creative gatherings across Nairobi and Kenya.
        </p>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          placeholder="All Categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={EVENT_CATEGORIES.map((c) => ({ label: c, value: c }))}
        />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        {!isLoading && filtered.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState title="No events found." description="Try a different search or category." />
          </div>
        )}
        {filtered.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
      </div>
    </Container>
  );
}
