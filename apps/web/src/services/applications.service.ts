import { http } from './http';
import type { AllyApplication, ContactMessage } from '@/types';

export interface AllyApplicationPayload {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  venueType: string;
  description: string;
  motivation: string;
  inclusivityPlan: string;
  experience?: string;
  agreesToTerms: boolean;
}

export const applicationsService = {
  async submit(payload: AllyApplicationPayload): Promise<{ ok: true; reference: string }> {
    const { data } = await http.post<{ ok: true; reference: string }>('/applications', payload);
    return data;
  },

  async pending(): Promise<AllyApplication[]> {
    const { data } = await http.get<AllyApplication[]>('/applications?status=pending');
    return data;
  },

  async sendContact(
    payload: Omit<ContactMessage, 'id' | 'submittedAt'>
  ): Promise<{ ok: true }> {
    await http.post('/contact', payload);
    return { ok: true };
  },
};
