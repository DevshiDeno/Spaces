import { env } from '@/utils/env';
import { http } from './http';
import { delay } from './mock/delay';
import { mockVenues } from './mock/fixtures';
import type { Venue, VenueFilters, PaginatedResponse } from '@/types';

function applyFilters(venues: Venue[], filters: VenueFilters): Venue[] {
  return venues.filter((v) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const haystack = `${v.name} ${v.city} ${v.type} ${v.bestFor.join(' ')}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.city && v.city !== filters.city) return false;
    if (filters.type && v.type !== filters.type) return false;
    if (filters.mood && !v.moods.includes(filters.mood)) return false;
    if (filters.timeOfDay && !v.timeOfDay.includes(filters.timeOfDay)) return false;
    if (filters.capacityMin && v.capacity < filters.capacityMin) return false;
    if (filters.capacityMax && v.capacity > filters.capacityMax) return false;
    if (filters.priceMin && v.pricePerHour < filters.priceMin) return false;
    if (filters.priceMax && v.pricePerHour > filters.priceMax) return false;
    return true;
  });
}

export const venuesService = {
  async list(filters: VenueFilters = {}): Promise<PaginatedResponse<Venue>> {
    if (env.useMockApi) {
      const data = applyFilters(mockVenues, filters);
      return delay({ data, total: data.length, page: 1, pageSize: data.length });
    }
    const { data } = await http.get<PaginatedResponse<Venue>>('/venues', { params: filters });
    return data;
  },

  async featured(): Promise<Venue[]> {
    if (env.useMockApi) return delay(mockVenues.slice(0, 3));
    const { data } = await http.get<Venue[]>('/venues/featured');
    return data;
  },

  async getBySlug(slug: string): Promise<Venue | null> {
    if (env.useMockApi) {
      const venue = mockVenues.find((v) => v.slug === slug) ?? null;
      return delay(venue);
    }
    const { data } = await http.get<Venue>(`/venues/slug/${slug}`);
    return data;
  },
};
