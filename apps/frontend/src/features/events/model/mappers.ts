import type { BackendEvent } from '@/features/events/api/events.api';
import type { Event } from '@/shared/types/domain';

export function mapBackendEventToDomain(item: BackendEvent): Event {
  const joinedCount = item.participants?.joinedCount ?? 0;
  const capacity = item.capacity ?? 8;
  const category = item.tags?.[0]?.name ?? 'General';
  const radius = item.distanceKm != null ? Math.max(1, Math.round(item.distanceKm)) : 5;

  return {
    id: item.id,
    title: item.title,
    category,
    datetime: new Date(item.startsAt).toLocaleString(),
    location: item.addressText ?? 'Location TBD',
    radius,
    privacy: item.visibility === 'PUBLIC' ? 'public' : item.visibility === 'PRIVATE' ? 'closed' : 'hidden',
    capacity,
    rsvpCount: joinedCount,
    quorumStatus: joinedCount >= capacity ? 'full' : joinedCount >= 5 ? 'quorum_reached' : 'forming',
    organizerId: item.creator?.id ?? 'unknown',
    lat: item.lat,
    lng: item.lng,
    distanceKm: item.distanceKm ?? null,
  };
}
