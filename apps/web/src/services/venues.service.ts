import { http } from './http';
import type { Venue, VenueFilters, PaginatedResponse } from '@/types';

export interface CreateVenuePayload {
  name: string;
  tagline: string;
  description: string;
  type: string;
  city: string;
  address: string;
  capacity: number;
  pricePerHour: number;
  bookingFee?: number;
  coverImage: string;
  images?: string[];
  amenities?: string[];
  moods?: string[];
  bestFor?: string[];
  noiseLevel?: 'QUIET' | 'MODERATE' | 'LOUD';
  timeOfDay?: string[];
  isPublished?: boolean;
  payoutPhone?: string;
  payoutTill?: string;
  payoutPaybill?: string;
  payoutAccount?: string;
}

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

  async listMine(): Promise<Venue[]> {
    const { data } = await http.get<Venue[]>('/venues/owner');
    return data;
  },

  async create(payload: CreateVenuePayload): Promise<Venue> {
    const { data } = await http.post<Venue>('/venues', payload);
    return data;
  },

  async update(id: string, payload: Partial<CreateVenuePayload>): Promise<Venue> {
    const { data } = await http.patch<Venue>(`/venues/${id}`, payload);
    return data;
  },

  async addImages(venueId: string, urls: string[]): Promise<Venue> {
    const { data } = await http.post<Venue>(`/venues/${venueId}/images`, { urls });
    return data;
  },
};
