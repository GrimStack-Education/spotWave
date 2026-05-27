import type { Event } from '@/shared/types/domain';

type BackendEvent = {
  id: string;
  title: string;
  startsAt: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  capacity: number | null;
  attendeesCount?: number;
  location?: { addressText?: string | null } | null;
};

export function mapBackendEventToDomain(item: BackendEvent): Event {
  return {
    id: item.id,
    title: item.title,
    category: 'General',
    datetime: new Date(item.startsAt).toLocaleString(),
    location: item.location?.addressText ?? 'Location TBD',
    radius: 5,
    privacy: item.visibility === 'PUBLIC' ? 'public' : item.visibility === 'PRIVATE' ? 'closed' : 'hidden',
    capacity: item.capacity ?? 8,
    rsvpCount: item.attendeesCount ?? 0,
    quorumStatus: (item.attendeesCount ?? 0) >= (item.capacity ?? 8) ? 'full' : (item.attendeesCount ?? 0) >= 5 ? 'quorum_reached' : 'forming',
    organizerId: 'unknown',
  };
}
