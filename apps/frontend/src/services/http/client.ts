import { getAccessToken } from '@/shared/lib/auth/session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

type ApiEnvelope<T> = {
  status: 'success';
  timestamp: string;
  data: T;
};

type ApiErrorEnvelope = {
  status: 'error';
  timestamp: string;
  path: string;
  error: unknown;
};

function normalizeError(error: unknown): string {
  if (!error) return 'Request failed';
  if (typeof error === 'string') return error;
  if (Array.isArray(error)) return error.join(', ');
  if (typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
    if (Array.isArray(maybeMessage)) return maybeMessage.join(', ');
  }
  return 'Request failed';
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  const rawBody = (await response.json()) as ApiEnvelope<T> | ApiErrorEnvelope;

  if (!response.ok) {
    throw new Error(normalizeError((rawBody as ApiErrorEnvelope).error));
  }

  return (rawBody as ApiEnvelope<T>).data;
}
