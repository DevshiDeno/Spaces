import { http } from './http';
import type { AppEvent, Rsvp } from '@/types';

export interface CreateEventPayload {
  title: string;
  category: string;
  description: string;
  /** ISO 8601 date-time string. */
  startDate: string;
  /** ISO 8601 date-time string. */
  endDate: string;
  city: string;
  venueId?: string;
  pricePerTicket: number;
  ticketsAvailable: number;
  coverImage: string;
  isFeatured?: boolean;
  organizer: string;
}

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

  async listMine(): Promise<AppEvent[]> {
    const { data } = await http.get<AppEvent[]>('/events/owner');
    return data;
  },

  async create(payload: CreateEventPayload): Promise<AppEvent> {
    const { data } = await http.post<AppEvent>('/events', payload);
    return data;
  },

  async update(id: string, payload: Partial<CreateEventPayload>): Promise<AppEvent> {
    const { data } = await http.patch<AppEvent>(`/events/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ ok: true }> {
    const { data } = await http.delete<{ ok: true }>(`/events/${id}`);
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
