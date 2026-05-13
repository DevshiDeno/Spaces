import { env } from '@/utils/env';
import { http } from './http';
import { delay } from './mock/delay';
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

const mockUser: User = {
  id: 'u-self',
  name: 'Simon Otieno',
  email: 'simon@mzizi.co.ke',
  role: 'user',
  isSpaceOwner: false,
  createdAt: '2025-11-01T10:00:00Z',
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (env.useMockApi) {
      return delay(
        {
          user: { ...mockUser, email: payload.email },
          token: 'mock-jwt-token',
        },
        700
      );
    }
    const { data } = await http.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (env.useMockApi) {
      return delay(
        {
          user: {
            ...mockUser,
            name: payload.name,
            email: payload.email,
            isSpaceOwner: payload.isSpaceOwner,
          },
          token: 'mock-jwt-token',
        },
        700
      );
    }
    const { data } = await http.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async me(): Promise<User> {
    if (env.useMockApi) return delay(mockUser);
    const { data } = await http.get<User>('/auth/me');
    return data;
  },
};
