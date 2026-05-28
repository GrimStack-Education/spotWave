import { apiRequest } from '@/shared/lib/api/client';

export type EventReview = {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  author: { id: string; displayName?: string | null; email: string };
};

export function fetchEventReviews(eventId: string) {
  return apiRequest<{ items: EventReview[] }>(`/events/${eventId}/reviews`);
}

export function submitEventReview(eventId: string, payload: { rating: number; text: string }) {
  return apiRequest(`/events/${eventId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
