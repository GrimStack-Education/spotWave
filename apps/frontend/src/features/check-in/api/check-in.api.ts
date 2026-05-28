import { apiRequest } from '@/shared/lib/api/client';

export function createCheckIn(eventId: string, payload: { method: 'GEO' | 'QR' | 'CODE'; code?: string }) {
  return apiRequest(`/events/${eventId}/check-in`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
