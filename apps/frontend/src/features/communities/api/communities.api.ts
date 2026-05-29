import { apiRequest } from '@/shared/lib/api/client';
import type { BackendEvent } from '@/features/events/api/events.api';

export type CommunityVisibility = 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
export type CommunityMemberStatus = 'ACTIVE' | 'PENDING' | 'BANNED' | 'LEFT';
export type CommunityMemberRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';

export type Community = {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  city: string;
  visibility: CommunityVisibility;
  owner: {
    id: string;
    email: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  members: {
    activeCount: number;
    items: Array<{
      id: string;
      userId: string;
      role: CommunityMemberRole;
      status: CommunityMemberStatus;
      joinedAt: string;
      user: {
        id: string;
        email: string;
        displayName?: string | null;
        avatarUrl?: string | null;
      };
    }>;
  };
  events?: {
    items: BackendEvent[];
  };
  createdAt: string;
  updatedAt: string;
};

export type CommunityMember = {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityMemberRole;
  status: CommunityMemberStatus;
  joinedAt: string;
};

export type CommunityMessage = {
  id: string;
  communityId: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
};

export function fetchCommunities(params?: { city?: string; limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.city) qs.set('city', params.city);
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.offset != null) qs.set('offset', String(params.offset));
  const q = qs.toString();
  return apiRequest<{ items: Community[]; total: number; limit: number; offset: number }>(
    `/communities${q ? `?${q}` : ''}`,
  );
}

export function fetchCommunity(id: string) {
  return apiRequest<Community>(`/communities/${id}`);
}

export function createCommunity(payload: {
  name: string;
  description: string;
  city: string;
  avatarUrl?: string;
  visibility?: CommunityVisibility;
}) {
  return apiRequest<Community>('/communities', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function joinCommunity(id: string) {
  return apiRequest<CommunityMember>(`/communities/${id}/join`, { method: 'POST' });
}

export function leaveCommunity(id: string) {
  return apiRequest<CommunityMember>(`/communities/${id}/leave`, { method: 'POST' });
}

export function fetchCommunityMessages(id: string) {
  return apiRequest<{ items: CommunityMessage[] }>(`/communities/${id}/messages`);
}

export function sendCommunityMessage(id: string, message: string) {
  return apiRequest<CommunityMessage>(`/communities/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
