import { apiRequest } from '@/shared/lib/api/client';

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export function fetchNotifications() {
  return apiRequest<{ items: NotificationItem[] }>('/notifications');
}

export function markNotificationRead(id: string) {
  return apiRequest(`/notifications/${id}/read`, { method: 'POST' });
}
