import axios, { AxiosError, type AxiosInstance } from 'axios';
import { env } from '@/utils/env';
import { useAuthStore } from '@/store/auth.store';

export const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => {
    const body = res.data as unknown;
    if (
      body &&
      typeof body === 'object' &&
      'success' in body &&
      'data' in (body as Record<string, unknown>)
    ) {
      res.data = (body as unknown as { data: unknown }).data;
    }
    return res;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    const message =
      error.response?.data?.message ??
      error.message ??
      'Something went wrong. Please try again.';
    return Promise.reject(Object.assign(error, { displayMessage: message }));
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (error as AxiosError<{ message?: string }>).response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Unexpected error';
}
