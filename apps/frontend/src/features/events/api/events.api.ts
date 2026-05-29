import { apiRequest } from '@/shared/lib/api/client';

export type BackendEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'NEIGHBORHOOD';
  capacity: number | null;
  imageUrl?: string | null;
  lat: number;
  lng: number;
  locationName?: string | null;
  address?: string | null;
  addressText?: string | null;
  distanceKm?: number | null;
  tags?: Array<{ id: string; slug: string; name: string }>;
  creator?: {
    id: string;
    email: string;
    role: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  community?: { id: string; name: string; avatarUrl: string; city: string } | null;
  participants?: {
    joinedCount: number;
    memberJoinedCount?: number;
    hostCount?: number;
    waitlistCount: number;
    seatsLeft?: number | null;
    items?: Array<{
      userId: string;
      role: 'HOST' | 'MEMBER';
      status: 'JOINED' | 'WAITLIST' | 'LEFT';
      joinedAt: string;
      user: {
        id: string;
        email: string;
        displayName?: string | null;
        avatarUrl?: string | null;
      };
    }>;
  };
};

export type EventsListResponse = {
  items?: BackendEvent[];
  events?: BackendEvent[];
  total?: number;
  count?: number;
  limit?: number;
  offset?: number;
};

export async function fetchEvents(params?: {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.lat != null) qs.set('lat', String(params.lat));
  if (params?.lng != null) qs.set('lng', String(params.lng));
  if (params?.radiusKm != null) qs.set('radiusKm', String(params.radiusKm));
  if (params?.limit != null) qs.set('limit', String(params.limit));
  const q = qs.toString();
  const response = await apiRequest<EventsListResponse>(
    `/events${q ? `?${q}` : ''}`,
  );

  const items = response.items ?? response.events ?? [];

  return {
    items,
    events: response.events ?? items,
    total: response.total ?? response.count ?? items.length,
    count: response.count ?? items.length,
    limit: response.limit ?? items.length,
    offset: response.offset ?? 0,
  };
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
  communityId?: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  capacity?: number;
  imageUrl?: string;
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
