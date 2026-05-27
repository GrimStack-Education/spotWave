import { apiRequest } from '@/services/http/client';
import type { AuthResponse } from '@/features/auth/model/types';

export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: { email: string; password: string; name?: string }) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function me() {
  return apiRequest('/auth/me');
}
