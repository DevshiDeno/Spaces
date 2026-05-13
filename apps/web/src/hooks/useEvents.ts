import { useQuery } from '@tanstack/react-query';
import { eventsService } from '@/services/events.service';

export const eventKeys = {
  all: ['events'] as const,
  list: () => ['events', 'list'] as const,
  featured: () => ['events', 'featured'] as const,
  detail: (slug: string) => ['events', 'detail', slug] as const,
};

export function useEvents() {
  return useQuery({ queryKey: eventKeys.list(), queryFn: () => eventsService.list() });
}

export function useFeaturedEvents() {
  return useQuery({ queryKey: eventKeys.featured(), queryFn: () => eventsService.featured() });
}

export function useEvent(slug: string | undefined) {
  return useQuery({
    queryKey: eventKeys.detail(slug ?? ''),
    queryFn: () => eventsService.getBySlug(slug!),
    enabled: !!slug,
  });
}
