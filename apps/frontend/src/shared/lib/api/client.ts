import { clearAccessToken, getAccessToken } from '@/shared/lib/auth/session';
import { ApiError } from './error';

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

function parseMessage(error: unknown): string {
  if (!error) return 'Request failed';
  if (typeof error === 'string') return error;
  if (Array.isArray(error)) return error.join(', ');
  if (typeof error === 'object' && error !== null) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  return 'Request failed';
}

async function doFetch(path: string, init: RequestInit): Promise<Response> {
  const token = getAccessToken();
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
}

function tryParseJson(value: string): unknown {
  if (!value.trim()) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const retries = method === 'GET' ? 1 : 0;

  let response: Response | null = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    response = await doFetch(path, init);
    if (response.ok || response.status < 500 || attempt === retries) break;
  }

  if (!response) throw new ApiError('No response', 0);

  const rawText = await response.text();
  const parsed = tryParseJson(rawText);
  const rawBody = (parsed ?? { error: rawText || 'Request failed' }) as
    | ApiEnvelope<T>
    | ApiErrorEnvelope;

  if (!response.ok) {
    const message = parseMessage((rawBody as ApiErrorEnvelope).error);
    if (response.status === 401) clearAccessToken();
    throw new ApiError(message, response.status, `HTTP_${response.status}`, rawBody);
  }

  if (!('data' in (rawBody as Record<string, unknown>))) {
    throw new ApiError('Malformed API response', response.status, 'MALFORMED_RESPONSE', rawBody);
  }

  return (rawBody as ApiEnvelope<T>).data;
}
