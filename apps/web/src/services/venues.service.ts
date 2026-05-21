import { http } from './http';
import type { Venue, VenueFilters, PaginatedResponse } from '@/types';

export const venuesService = {
  async list(filters: VenueFilters = {}): Promise<PaginatedResponse<Venue>> {
    const { data } = await http.get<PaginatedResponse<Venue>>('/venues', { params: filters });
    return data;
  },

  async featured(): Promise<Venue[]> {
    const { data } = await http.get<Venue[]>('/venues/featured');
    return data;
  },

  async getBySlug(slug: string): Promise<Venue | null> {
    const { data } = await http.get<Venue>(`/venues/slug/${slug}`);
    return data;
  },
};
