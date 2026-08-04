import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsService, type CreateEventPayload } from '@/services/events.service';

export const eventKeys = {
  all: ['events'] as const,
  list: () => ['events', 'list'] as const,
  featured: () => ['events', 'featured'] as const,
  mine: () => ['events', 'mine'] as const,
  detail: (slug: string) => ['events', 'detail', slug] as const,
};

export function useEvents() {
  return useQuery({ queryKey: eventKeys.list(), queryFn: () => eventsService.list() });
}

export function useMyEvents(enabled = true) {
  return useQuery({
    queryKey: eventKeys.mine(),
    queryFn: () => eventsService.listMine(),
    enabled,
  });
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

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateEventPayload> }) =>
      eventsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
