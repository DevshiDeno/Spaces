import { useQuery } from '@tanstack/react-query';
import { venuesService } from '@/services/venues.service';
import type { VenueFilters } from '@/types';

export const venueKeys = {
  all: ['venues'] as const,
  list: (filters: VenueFilters) => ['venues', 'list', filters] as const,
  featured: () => ['venues', 'featured'] as const,
  detail: (slug: string) => ['venues', 'detail', slug] as const,
};

export function useVenues(filters: VenueFilters = {}) {
  return useQuery({
    queryKey: venueKeys.list(filters),
    queryFn: () => venuesService.list(filters),
  });
}

export function useFeaturedVenues() {
  return useQuery({
    queryKey: venueKeys.featured(),
    queryFn: () => venuesService.featured(),
  });
}

export function useVenue(slug: string | undefined) {
  return useQuery({
    queryKey: venueKeys.detail(slug ?? ''),
    queryFn: () => venuesService.getBySlug(slug!),
    enabled: !!slug,
  });
}
