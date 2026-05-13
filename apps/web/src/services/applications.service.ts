import { env } from '@/utils/env';
import { http } from './http';
import { delay } from './mock/delay';
import { mockApplications } from './mock/fixtures';
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
    if (env.useMockApi) {
      return delay({ ok: true, reference: `ALLY-${Date.now()}` }, 800);
    }
    const { data } = await http.post<{ ok: true; reference: string }>('/applications', payload);
    return data;
  },

  async pending(): Promise<AllyApplication[]> {
    if (env.useMockApi) return delay(mockApplications);
    const { data } = await http.get<AllyApplication[]>('/applications?status=pending');
    return data;
  },

  async sendContact(
    payload: Omit<ContactMessage, 'id' | 'submittedAt'>
  ): Promise<{ ok: true }> {
    if (env.useMockApi) return delay({ ok: true } as const, 600);
    await http.post('/contact', payload);
    return { ok: true };
  },
};
