import { http } from './http';
import type { AppEvent, Rsvp } from '@/types';

export interface RsvpPayload {
  attendees: number;
  paymentMethod?: 'MPESA' | 'CARD';
  phone?: string;
}

export interface RsvpResponse {
  ok: true;
  reference: string;
  rsvp: Rsvp;
}

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

  async rsvp(eventId: string, payload: RsvpPayload): Promise<RsvpResponse> {
    const { data } = await http.post<RsvpResponse>(`/events/${eventId}/rsvp`, payload);
    return data;
  },

  async getRsvp(rsvpId: string): Promise<Rsvp> {
    const { data } = await http.get<Rsvp>(`/events/rsvps/${rsvpId}`);
    return data;
  },
};
