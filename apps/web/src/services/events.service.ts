import { http } from './http';
import type { AppEvent } from '@/types';

export const eventsService = {
  async list(): Promise<AppEvent[]> {
    const { data } = await http.get<AppEvent[]>('/events');
    return data;
  },

  async featured(): Promise<AppEvent[]> {
    const { data } = await http.get<AppEvent[]>('/events/featured');
    return data;
  },

  async getBySlug(slug: string): Promise<AppEvent | null> {
    const { data } = await http.get<AppEvent>(`/events/slug/${slug}`);
    return data;
  },

  async rsvp(eventId: string, attendees: number): Promise<{ ok: true; reference: string }> {
    const { data } = await http.post<{ ok: true; reference: string }>(
      `/events/${eventId}/rsvp`,
      { attendees }
    );
    return data;
  },
};
