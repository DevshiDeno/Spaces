import { http } from './http';
import type { User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface InviteInfo {
  email: string;
  name: string;
  expiresAt: string | null;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await http.get<User>('/auth/me');
    return data;
  },

  async getInvite(token: string): Promise<InviteInfo> {
    const { data } = await http.get<InviteInfo>(`/auth/invite/${encodeURIComponent(token)}`);
    return data;
  },

  async acceptInvite(token: string, password: string): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>(
      `/auth/invite/${encodeURIComponent(token)}/accept`,
      { password }
    );
    return data;
  },

  async requestPasswordReset(email: string): Promise<{ ok: true }> {
    const { data } = await http.post<{ ok: true }>('/auth/password-reset/request', {
      email,
    });
    return data;
  },

  async confirmPasswordReset(token: string, password: string): Promise<{ ok: true }> {
    const { data } = await http.post<{ ok: true }>(
      `/auth/password-reset/${encodeURIComponent(token)}/confirm`,
      { password }
    );
    return data;
  },
};
