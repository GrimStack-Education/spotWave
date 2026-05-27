'use client';

import type { ReactNode } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchEventById, joinEvent, leaveEvent } from '@/features/events/api/events.api';
import { mapBackendEventToDomain } from '@/features/events/model/mappers';
import { events as mockEvents } from '@/shared/mocks/spotwave';
import type { Event } from '@/shared/types/domain';
import { ErrorState, LoadingState } from '@/shared/ui/states/states';
import { UiBadge } from '@/shared/ui/badge/badge';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';

export function EventDetailScreen({ id }: { id: string }) {
 const [event, setEvent] = useState<Event | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [busy, setBusy] = useState(false);

 useEffect(() => {
 fetchEventById(id)
 .then((item) => setEvent(mapBackendEventToDomain(item)))
 .catch(() => {
 setEvent(mockEvents.find((e) => e.id === id) ?? mockEvents[0]);
 setError('Backend unavailable, showing local MVP data.');
 });
 }, [id]);

 if (!event) return <LoadingState />;

 const onJoin = async () => { setBusy(true); try { await joinEvent(id); } catch { setError('Join requires auth token.'); } finally { setBusy(false); } };
 const onLeave = async () => { setBusy(true); try { await leaveEvent(id); } catch { setError('Leave requires auth token.'); } finally { setBusy(false); } };

 return (
 <div className="space-y-5">
 {error ? <ErrorState message={error} /> : null}
 <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
 <UiCard className="overflow-hidden p-0">
 <div className="h-80 bg-[#0f0f0f]" />
 <div className="p-6 md:p-8">
 <UiBadge className="border-[rgba(var(--sw-accent-3-rgb),0.30)] bg-[rgba(var(--sw-accent-3-rgb),0.15)] text-[var(--sw-accent-3)]">{event.category}</UiBadge>
 <h1 className="mt-4 text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">{event.title}</h1>
 <p className="mt-4 max-w-2xl text-lg text-white/60">RSVP-first event with clear logistics and trust controls.</p>
 <div className="mt-7 grid gap-3 text-white/72 md:grid-cols-3"><Info icon={<Calendar size={17} />} text={event.datetime} /><Info icon={<MapPin size={17} />} text={event.location} /><Info icon={<Users size={17} />} text={`${event.rsvpCount} attending`} /></div>
 </div>
 </UiCard>
 <UiCard className="h-fit p-6"><h2 className="text-2xl tracking-[-0.04em]">Reserve your spot</h2><p className="mt-3 text-white/58">Join now or leave if your plans changed. The group sees RSVP movement immediately.</p><div className="mt-6 grid gap-3"><UiButton isDisabled={busy} onPress={onJoin}>Join event</UiButton><UiButton isDisabled={busy} onPress={onLeave} variant="outline">Leave event</UiButton></div></UiCard>
 </div>
 </div>
 );
}

function Info({ icon, text }: { icon: ReactNode; text: string }) {
 return <p className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] p-4">{icon}{text}</p>;
}
