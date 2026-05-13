import { env } from '@/utils/env';
import { http } from './http';
import { delay } from './mock/delay';
import { mockEvents } from './mock/fixtures';
import type { AppEvent } from '@/types';

export const eventsService = {
  async list(): Promise<AppEvent[]> {
    if (env.useMockApi) return delay(mockEvents);
    const { data } = await http.get<AppEvent[]>('/events');
    return data;
  },

  async featured(): Promise<AppEvent[]> {
    if (env.useMockApi) return delay(mockEvents.filter((e) => e.isFeatured));
    const { data } = await http.get<AppEvent[]>('/events/featured');
    return data;
  },

  async getBySlug(slug: string): Promise<AppEvent | null> {
    if (env.useMockApi) {
      return delay(mockEvents.find((e) => e.slug === slug) ?? null);
    }
    const { data } = await http.get<AppEvent>(`/events/slug/${slug}`);
    return data;
  },

  async rsvp(eventId: string, attendees: number): Promise<{ ok: true; reference: string }> {
    if (env.useMockApi) {
      return delay({ ok: true, reference: `RSVP-${eventId}-${attendees}-${Date.now()}` }, 600);
    }
    const { data } = await http.post<{ ok: true; reference: string }>(
      `/events/${eventId}/rsvp`,
      { attendees }
    );
    return data;
  },
};
