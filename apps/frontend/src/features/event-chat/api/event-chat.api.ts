import { apiRequest } from '@/shared/lib/api/client';

export type EventChatMessage = {
  id: string;
  message: string;
  createdAt: string;
  user: { id: string; displayName?: string | null; email: string };
};

export function fetchEventChat(eventId: string) {
  return apiRequest<{ items: EventChatMessage[] }>(`/events/${eventId}/chat`);
}

export function sendEventChatMessage(eventId: string, message: string) {
  return apiRequest(`/events/${eventId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
