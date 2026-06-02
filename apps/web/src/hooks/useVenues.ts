import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { venuesService, type CreateVenuePayload } from '@/services/venues.service';
import type { VenueFilters } from '@/types';

export const venueKeys = {
  all: ['venues'] as const,
  list: (filters: VenueFilters) => ['venues', 'list', filters] as const,
  featured: () => ['venues', 'featured'] as const,
  mine: () => ['venues', 'mine'] as const,
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

export function useMyVenues(enabled = true) {
  return useQuery({
    queryKey: venueKeys.mine(),
    queryFn: () => venuesService.listMine(),
    enabled,
  });
}

export function useAddVenueImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ venueId, urls }: { venueId: string; urls: string[] }) =>
      venuesService.addImages(venueId, urls),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: venueKeys.all });
    },
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVenuePayload) => venuesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: venueKeys.all });
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateVenuePayload> }) =>
      venuesService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: venueKeys.all });
    },
  });
}
