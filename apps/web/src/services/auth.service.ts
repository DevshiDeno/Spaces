import { http } from './http';
import type { User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  isSpaceOwner?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
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
};
