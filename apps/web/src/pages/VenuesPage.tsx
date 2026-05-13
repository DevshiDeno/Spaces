import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { FilterBar } from '@/features/venues/FilterBar';
import { VenueCard, VenueCardSkeleton } from '@/features/venues/VenueCard';
import { useDebounce } from '@/hooks/useDebounce';
import { useVenues } from '@/hooks/useVenues';
import { useFiltersStore } from '@/store/filters.store';
import type { VenueFilters } from '@/types';

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilter, setFilters, reset } = useFiltersStore();

  // Sync URL params -> store on first render
  useEffect(() => {
    const initial: VenueFilters = {
      query: searchParams.get('query') ?? undefined,
      city: searchParams.get('city') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      mood: (searchParams.get('mood') ?? undefined) as VenueFilters['mood'],
      timeOfDay: (searchParams.get('timeOfDay') ?? undefined) as VenueFilters['timeOfDay'],
    };
    if (Object.values(initial).some((v) => v !== undefined && v !== '')) setFilters(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync store -> URL params
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const debouncedQuery = useDebounce(filters.query ?? '', 300);
  const queryFilters = useMemo<VenueFilters>(
    () => ({ ...filters, query: debouncedQuery || undefined }),
    [filters, debouncedQuery]
  );
  const { data, isLoading } = useVenues(queryFilters);
  const venues = data?.data ?? [];

  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-3xl">
        <h1 className="heading-display text-4xl font-bold tracking-tight sm:text-5xl">
          Venues Directory
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Discover verified inclusive venues across Kenya for every occasion.
        </p>
      </div>

      <div className="mt-8">
        <FilterBar
          filters={filters}
          onChange={setFilter}
          onClear={reset}
          resultCount={venues.length}
        />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <VenueCardSkeleton key={i} />)}
        {!isLoading && venues.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              title="No venues found matching your criteria."
              description="Try adjusting your filters or clearing them to see more results."
              action={<Button onClick={reset}>Clear Filters</Button>}
            />
          </div>
        )}
        {venues.map((v, i) => (
          <VenueCard key={v.id} venue={v} index={i} />
        ))}
      </div>
    </Container>
  );
}
