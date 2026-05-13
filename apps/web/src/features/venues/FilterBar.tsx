import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CITIES, MOODS, TIMES_OF_DAY, VENUE_TYPES } from '@/constants';
import type { VenueFilters } from '@/types';

interface FilterBarProps {
  filters: VenueFilters;
  onChange: <K extends keyof VenueFilters>(key: K, value: VenueFilters[K]) => void;
  onClear: () => void;
  resultCount?: number;
}

export function FilterBar({ filters, onChange, onClear, resultCount }: FilterBarProps) {
  const hasActive = Object.values(filters).some((v) => v !== undefined && v !== '' && v !== null);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Input
            placeholder="Search by venue name, location, or event type..."
            value={filters.query ?? ''}
            onChange={(e) => onChange('query', e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="lg:col-span-2">
          <Select
            placeholder="Any City"
            value={filters.city ?? ''}
            onChange={(e) => onChange('city', e.target.value || undefined)}
            options={CITIES.map((c) => ({ label: c, value: c }))}
          />
        </div>
        <div className="lg:col-span-2">
          <Select
            placeholder="Any Type"
            value={filters.type ?? ''}
            onChange={(e) => onChange('type', e.target.value || undefined)}
            options={VENUE_TYPES.map((t) => ({ label: t, value: t }))}
          />
        </div>
        <div className="lg:col-span-2">
          <Select
            placeholder="Any Mood"
            value={filters.mood ?? ''}
            onChange={(e) => onChange('mood', (e.target.value || undefined) as VenueFilters['mood'])}
            options={MOODS.map((m) => ({ label: m, value: m }))}
          />
        </div>
        <div className="lg:col-span-2">
          <Select
            placeholder="Any Time"
            value={filters.timeOfDay ?? ''}
            onChange={(e) =>
              onChange('timeOfDay', (e.target.value || undefined) as VenueFilters['timeOfDay'])
            }
            options={TIMES_OF_DAY.map((t) => ({ label: t, value: t }))}
          />
        </div>
      </div>

      {(hasActive || resultCount !== undefined) && (
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            {resultCount !== undefined ? `${resultCount} venues` : 'Filters applied'}
          </p>
          {hasActive && (
            <Button variant="ghost" size="sm" leftIcon={<X className="h-3.5 w-3.5" />} onClick={onClear}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
