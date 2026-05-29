import { apiRequest } from '@/shared/lib/api/client';

export type BackendEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'NEIGHBORHOOD';
  capacity: number | null;
  lat: number;
  lng: number;
  addressText?: string | null;
  distanceKm?: number | null;
  tags?: Array<{ id: string; slug: string; name: string }>;
  creator?: { id: string; email: string; role: string; displayName?: string | null; avatarUrl?: string | null };
  participants?: {
    joinedCount: number;
    memberJoinedCount?: number;
    hostCount?: number;
    waitlistCount: number;
    seatsLeft?: number | null;
  };
};

export async function fetchEvents(params?: { lat?: number; lng?: number; radiusKm?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.lat != null) qs.set('lat', String(params.lat));
  if (params?.lng != null) qs.set('lng', String(params.lng));
  if (params?.radiusKm != null) qs.set('radiusKm', String(params.radiusKm));
  if (params?.limit != null) qs.set('limit', String(params.limit));
  const q = qs.toString();
  return apiRequest<{ items: BackendEvent[]; total: number; limit: number; offset: number }>(`/events${q ? `?${q}` : ''}`);
}

export async function fetchEventById(id: string) {
  return apiRequest<BackendEvent>(`/events/${id}`);
}

export async function joinEvent(id: string) {
  return apiRequest(`/events/${id}/join`, { method: 'POST' });
}

export async function leaveEvent(id: string) {
  return apiRequest(`/events/${id}/leave`, { method: 'POST' });
}

export async function createEvent(payload: {
  title: string;
  description?: string;
  startsAt: string;
  capacity?: number;
  lat: number;
  lng: number;
  addressText?: string;
  tagIds?: string[];
}) {
  return apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
