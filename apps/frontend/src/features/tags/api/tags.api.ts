import { apiRequest } from '@/shared/lib/api/client';

export type EventTag = {
  id: string;
  slug: string;
  name: string;
};

export function fetchTags() {
  return apiRequest<EventTag[]>('/tags');
}
