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

export interface ApproveResponse {
  application: AllyApplication;
  inviteUrl: string;
  inviteExpiresAt: string;
}

export interface RejectResponse {
  application: AllyApplication;
}

export const applicationsService = {
  async submit(payload: AllyApplicationPayload): Promise<{ ok: true; reference: string }> {
    const { data } = await http.post<{ ok: true; reference: string }>('/applications', payload);
    return data;
  },

  async list(status?: 'pending' | 'approved' | 'rejected'): Promise<AllyApplication[]> {
    const query = status ? `?status=${status.toUpperCase()}` : '';
    const { data } = await http.get<AllyApplication[]>(`/applications${query}`);
    return data;
  },

  async pending(): Promise<AllyApplication[]> {
    return this.list('pending');
  },

  async approve(id: string, notes?: string): Promise<ApproveResponse> {
    const { data } = await http.patch<ApproveResponse>(`/applications/${id}/review`, {
      status: 'APPROVED',
      notes,
    });
    return data;
  },

  async reject(id: string, notes?: string): Promise<RejectResponse> {
    const { data } = await http.patch<RejectResponse>(`/applications/${id}/review`, {
      status: 'REJECTED',
      notes,
    });
    return data;
  },

  async sendContact(
    payload: Omit<ContactMessage, 'id' | 'submittedAt'>
  ): Promise<{ ok: true }> {
    await http.post('/contact', payload);
    return { ok: true };
  },
};
