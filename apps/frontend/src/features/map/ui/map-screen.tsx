'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { fetchEvents } from '@/features/events/api/events.api';
import { mapBackendEventToDomain } from '@/features/events/model/mappers';
import { events as mockEvents } from '@/shared/mocks/spotwave';
import type { Event } from '@/shared/types/domain';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';

export function MapScreen() {
 const [data, setData] = useState<Event[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 fetchEvents({ limit: 20 })
 .then((items) => setData(items.map(mapBackendEventToDomain)))
 .catch(() => {
 setData(mockEvents);
 setError('Backend недоступен, показаны локальные MVP-данные.');
 })
 .finally(() => setLoading(false));
 }, []);

 if (loading) return <LoadingState />;
 if (!data.length) return <EmptyState title="Рядом пока тихо" description="Создайте первое событие или расширьте радиус." />;

 return (
 <div className="space-y-6">
 {error ? <ErrorState message={error} /> : null}

 <section className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
 <div className="max-w-[860px]">
 <h1 className="text-[58px] leading-[0.96] tracking-[-0.07em] text-white md:text-[84px] xl:text-[96px]">
 Карта
 <br />
 событий
 <br />
 <span className="text-[var(--sw-accent-3)]">рядом</span>
 </h1>
 <p className="mt-6 max-w-[620px] text-lg leading-8 text-white/72 md:text-xl">
 Живые события в вашем радиусе. Открывайте карточку и подключайтесь без лишних панелей и перегруженного UI.
 </p>

 <div className="mt-8 grid gap-3 sm:grid-cols-2">
 {data.slice(0, 4).map((event) => (
 <Link
 key={event.id}
 href={`/events/${event.id}`}
 className="rounded-[24px] border border-white/10 bg-[var(--sw-neutral-800)] p-4 transition hover:border-[rgba(var(--sw-accent-2-rgb),0.40)]"
 >
 <p className="text-xs uppercase tracking-[0.12em] text-[var(--sw-accent-3)]">{event.category}</p>
 <p className="mt-2 text-2xl leading-tight text-white">{event.title}</p>
 <p className="mt-2 flex items-center gap-2 text-sm text-white/54"><MapPin size={14} /> {event.location}</p>
 <p className="mt-1 text-sm text-white/54">{event.datetime} · {event.rsvpCount}/{event.capacity}</p>
 </Link>
 ))}
 </div>
 </div>

 <div className="rounded-[30px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 md:p-8">
 <h2 className="text-[38px] leading-[0.96] tracking-[-0.06em] text-white md:text-[44px]">
 Все события
 </h2>
 <p className="mt-3 text-white/58">Выберите событие и переходите в детали.</p>

 <div className="mt-6 space-y-3">
 {data.map((event) => (
 <Link
 key={event.id}
 href={`/events/${event.id}`}
 className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101010] px-4 py-3 text-white/84 transition hover:border-[rgba(var(--sw-accent-2-rgb),0.35)]"
 >
 <div className="h-12 w-12 rounded-xl bg-[#0f0f0f]" />
 <div className="min-w-0 flex-1">
 <p className="truncate">{event.title}</p>
 <p className="truncate text-sm text-white/52">{event.datetime} · {event.radius} км</p>
 </div>
 <ArrowRight size={16} className="text-white/45" />
 </Link>
 ))}
 </div>
 </div>
 </section>
 </div>
 );
}
