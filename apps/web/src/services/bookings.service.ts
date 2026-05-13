import { env } from '@/utils/env';
import { http } from './http';
import { delay } from './mock/delay';
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
    if (env.useMockApi) {
      const booking: Booking = {
        id: `b-${Date.now()}`,
        venueId: payload.venueId,
        venueName: 'Reserved Venue',
        userId: 'u-self',
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        guestCount: payload.guestCount,
        totalAmount: payload.totalAmount,
        status: 'confirmed',
        paymentMethod: payload.paymentMethod,
        specialRequests: payload.specialRequests,
        createdAt: new Date().toISOString(),
      };
      return delay(booking, 800);
    }
    const { data } = await http.post<Booking>('/bookings', payload);
    return data;
  },
};
