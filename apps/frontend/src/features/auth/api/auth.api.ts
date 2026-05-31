import { apiRequest } from '@/services/http/client';
import type { AuthResponse } from '@/features/auth/model/types';

export type MeResponse = {
  id: string;
  email: string;
  role: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  profile?: {
    displayName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    homeLat?: number | null;
    homeLng?: number | null;
    radiusKm?: number | null;
  } | null;
  interests?: Array<{ id: string; name: string; slug: string; icon: string }>;
  activity?: {
    hostedEventsCount: number;
    joinedEventsCount: number;
    checkInsCount: number;
    upcomingEvents: Array<{
      id: string;
      title: string;
      startsAt: string;
      addressText?: string | null;
      status: string;
    }>;
  };
  trust?: {
    level: string;
    averageRating: number | null;
    reviewsCount: number;
    checkInsCount: number;
    hostedEventsCount: number;
    joinedEventsCount: number;
    openReports: number;
    resolvedReports: number;
    recentReviews: Array<{
      eventId: string;
      eventTitle: string;
      rating: number;
      text: string;
      createdAt: string;
      authorName: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
};

export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: { email: string; password: string; name?: string }) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function me() {
  return apiRequest<MeResponse>('/auth/me');
}

export function refresh() {
  return apiRequest<AuthResponse>('/auth/refresh', { method: 'POST' });
}
