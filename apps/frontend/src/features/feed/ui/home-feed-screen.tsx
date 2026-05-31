'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarClock, MapPin, Users } from 'lucide-react';
import { fetchEvents } from '@/features/events/api/events.api';
import { mapBackendEventToDomain } from '@/features/events/model/mappers';
import { queryKeys } from '@/shared/lib/query/keys';
import { EmptyState, LoadingState } from '@/shared/ui/states/states';
import { CoverImage } from '@/shared/ui/media/cover-image';

export function HomeFeedScreen() {
  const eventsQuery = useQuery({
    queryKey: queryKeys.events('home'),
    queryFn: () => fetchEvents({ limit: 24 }),
  });

  if (eventsQuery.isLoading) return <LoadingState />;

  const data = (eventsQuery.data?.items ?? []).map(mapBackendEventToDomain);
  if (!data.length)
    return (
      <EmptyState
        title="Пока нет событий"
        description="Создайте первое событие или расширьте радиус."
      />
    );

  const featured = data[0];
  const seatsLeft = featured.seatsLeft ?? Math.max(featured.capacity - featured.rsvpCount, 0);

  return (
    <div className="space-y-7">
      <section className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#171717_0%,#101010_46%,rgba(var(--sw-accent-4-rgb),0.42)_100%)] p-6 md:p-8 xl:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.16)] blur-3xl" />
          <h1 className="relative max-w-4xl text-[54px] leading-[0.94] tracking-[-0.075em] text-white md:text-[82px] xl:text-[104px]">
            События рядом и <span className="text-brand">твои люди</span>
          </h1>
          <p className="relative mt-6 max-w-2xl text-lg leading-7 text-white/62">
            Лента собирает локальные встречи в понятный ритм: что начинается скоро, где есть места и
            куда можно присоединиться без лишнего шума.
          </p>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            <Metric
              icon={<CalendarClock size={16} />}
              label="Событий"
              value={String(data.length)}
            />
            <Metric icon={<Users size={16} />} label="Мест у главного" value={String(seatsLeft)} />
            <Metric icon={<MapPin size={16} />} label="Радиус" value={`${featured.radius} км`} />
          </div>
        </div>

        <Link
          href={`/events/${featured.id}`}
          className="group overflow-hidden rounded-[34px] border border-white/10 bg-(--sw-neutral-800) transition hover:-translate-y-1 hover:border-[rgba(var(--sw-accent-2-rgb),0.38)]"
        >
          <CoverImage
            className="h-56 rounded-none border-0"
            seed={featured.id}
            priority
            alt={featured.title}
          />
          <div className="p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.16em] text-brand">Главное событие</p>
            <h2 className="mt-3 text-[40px] leading-[0.95] tracking-[-0.06em] text-white">
              {featured.title}
            </h2>
            <p className="mt-4 flex items-center gap-2 text-white/64">
              <MapPin size={16} /> {featured.location}
            </p>
            <p className="mt-2 text-white/58">
              {featured.datetime} · {featured.rsvpCount}/{featured.capacity} участников
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-brand"
                style={{
                  width: `${Math.min((featured.rsvpCount / featured.capacity) * 100, 100)}%`,
                }}
              />
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-brand transition group-hover:translate-x-1">
              Открыть событие <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group rounded-[28px] border border-white/10 bg-(--sw-neutral-800) p-4 transition hover:-translate-y-1 hover:border-[rgba(var(--sw-accent-2-rgb),0.36)] hover:bg-[#1d1d1d]"
          >
            <CoverImage className="h-36" seed={event.id} alt={event.title} />
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-white/64">{event.category}</span>
              <span className="text-xs text-white/45">
                {event.rsvpCount}/{event.capacity}
              </span>
            </div>
            <p className="mt-3 text-2xl leading-tight tracking-[-0.04em] text-white">
              {event.title}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-white/56">
              <MapPin size={14} /> {event.location}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4 text-sm text-white/52">
              <span>{event.datetime}</span>
              <ArrowRight
                size={15}
                className="transition group-hover:translate-x-1 group-hover:text-brand"
              />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-white/48">
        {icon}
        <span className="text-xs uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-3 text-3xl tracking-tighter text-white">{value}</p>
    </div>
  );
}
