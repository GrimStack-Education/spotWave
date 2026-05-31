import type { BackendEvent } from '@/features/events/api/events.api';
import { toRussianInterestLabel } from '@/shared/lib/i18n/interests';
import type { Event } from '@/shared/types/domain';

export function mapBackendEventToDomain(item: BackendEvent): Event {
  const capacity = item.capacity ?? 8;
  const joinedCount = item.participants?.memberJoinedCount ?? item.participants?.joinedCount ?? 0;
  const seatsLeft = item.participants?.seatsLeft ?? Math.max(capacity - joinedCount, 0);
  const firstTag = item.tags?.[0];
  const category = firstTag ? toRussianInterestLabel(firstTag.name, firstTag.slug) : 'Общее';
  const radius = item.distanceKm != null ? Math.max(1, Math.round(item.distanceKm)) : 5;

  return {
    id: item.id,
    title: item.title,
    category,
    datetime: new Date(item.startsAt).toLocaleString(),
    location: item.addressText ?? 'Локация уточняется',
    radius,
    privacy:
      item.visibility === 'PUBLIC' ? 'public' : item.visibility === 'PRIVATE' ? 'closed' : 'hidden',
    capacity,
    rsvpCount: joinedCount,
    waitlistCount: item.participants?.waitlistCount ?? 0,
    seatsLeft,
    quorumStatus:
      joinedCount >= capacity ? 'full' : joinedCount >= 5 ? 'quorum_reached' : 'forming',
    organizerId: item.creator?.id ?? 'unknown',
    lat: item.lat,
    lng: item.lng,
    distanceKm: item.distanceKm ?? null,
  };
}
