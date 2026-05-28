import { apiRequest } from '@/shared/lib/api/client';

export type JoinRequestItem = {
  eventId: string;
  userId: string;
  joinedAt: string;
  user: { id: string; displayName?: string | null; email: string };
};

export function fetchJoinRequests(eventId: string) {
  return apiRequest<{ items: JoinRequestItem[] }>(`/events/${eventId}/requests`);
}

export function approveJoinRequest(eventId: string, userId: string) {
  return apiRequest(`/events/${eventId}/requests/${userId}/approve`, { method: 'POST' });
}

export function rejectJoinRequest(eventId: string, userId: string) {
  return apiRequest(`/events/${eventId}/requests/${userId}/reject`, { method: 'POST' });
}
