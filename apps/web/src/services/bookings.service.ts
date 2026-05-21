import { http } from './http';
import type { Booking } from '@/types';

export interface BookingPayload {
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  paymentMethod: 'mpesa' | 'card';
  specialRequests?: string;
  totalAmount: number;
}

export const bookingsService = {
  async create(payload: BookingPayload): Promise<Booking> {
    const { data } = await http.post<Booking>('/bookings', payload);
    return data;
  },
};
