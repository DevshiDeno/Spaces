import { http } from './http';
import type { Booking, OwnerEarnings } from '@/types';

export const payoutsService = {
  async ownerSummary(): Promise<OwnerEarnings> {
    const { data } = await http.get<OwnerEarnings>('/payouts/owner');
    return data;
  },

  async adminPending(): Promise<Booking[]> {
    const { data } = await http.get<Booking[]>('/payouts/admin/pending');
    return data;
  },

  async settle(bookingId: string, payoutRef: string): Promise<Booking> {
    const { data } = await http.patch<Booking>(
      `/payouts/admin/bookings/${bookingId}/settle`,
      { payoutRef }
    );
    return data;
  },
};
