'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, LocateFixed, Navigation, Waves } from 'lucide-react';
import { fetchEvents } from '@/features/events/api/events.api';
import { mapBackendEventToDomain } from '@/features/events/model/mappers';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiBadge } from '@/shared/ui/badge/badge';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';
import { CoverImage } from '@/shared/ui/media/cover-image';

export function MapScreen() {
  const eventsQuery = useQuery({ queryKey: queryKeys.events('map'), queryFn: () => fetchEvents({ limit: 20 }) });

  if (eventsQuery.isLoading) return <LoadingState />;
  if (eventsQuery.isError) return <ErrorState message="Не удалось загрузить карту событий" />;

  const data = (eventsQuery.data?.items ?? []).map(mapBackendEventToDomain);
  if (!data.length) return <EmptyState title="Рядом пока тихо" description="Создайте первое событие или расширьте радиус." />;

  return (
    <div className="space-y-6">
      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="rounded-[34px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 md:p-8">
            <UiBadge className="border-[rgba(var(--sw-accent-2-rgb),0.28)] bg-[rgba(var(--sw-accent-4-rgb),0.14)] text-[var(--sw-accent-3)]">
              <LocateFixed size={13} /> Гео-слой
            </UiBadge>
            <h1 className="mt-5 text-[58px] leading-[0.96] tracking-[-0.07em] text-white md:text-[84px] xl:text-[96px]">
              Карта событий <span className="text-[var(--sw-accent-3)]">рядом</span>
            </h1>
            <p className="mt-5 max-w-2xl text-white/58">Быстрый обзор активных точек вокруг: ближайшие встречи, плотность и события, где еще есть места.</p>
          </div>

          <div className="relative min-h-[430px] overflow-hidden rounded-[34px] border border-white/10 bg-[#101010] p-5">
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(var(--sw-accent-2-rgb),0.24)]" />
            <div className="absolute left-1/2 top-1/2 size-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--sw-accent-3)] shadow-[0_0_34px_rgba(var(--sw-accent-2-rgb),0.75)]" />
            {data.slice(0, 6).map((event, index) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="absolute rounded-2xl border border-white/12 bg-black/55 px-3 py-2 text-sm text-white shadow-2xl backdrop-blur transition hover:-translate-y-1 hover:border-[rgba(var(--sw-accent-2-rgb),0.48)]"
                style={{ left: `${18 + ((index * 23) % 58)}%`, top: `${18 + ((index * 31) % 58)}%` }}
              >
                <span className="mr-2 inline-block size-2 rounded-full bg-[var(--sw-accent-3)]" />
                {event.title}
              </Link>
            ))}
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur">
              <div>
                <p className="text-sm uppercase tracking-[0.12em] text-white/45">Активный радиус</p>
                <p className="mt-1 text-2xl tracking-[-0.04em] text-white">5 км вокруг вас</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-white/64"><Waves size={16} /> {data.length} волн</div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[38px] leading-[0.96] tracking-[-0.06em] text-white md:text-[44px]">Все события</h2>
            <Navigation className="text-[var(--sw-accent-3)]" size={22} />
          </div>
          <div className="mt-6 space-y-3">
            {data.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101010] px-4 py-3 text-white/84 transition hover:border-[rgba(var(--sw-accent-2-rgb),0.35)]">
                <CoverImage className="h-12 w-12 rounded-xl" seed={event.id} alt={event.title} />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{event.title}</p>
                  <p className="truncate text-sm text-white/52">{event.datetime} · {event.radius} км · {event.rsvpCount}/{event.capacity}</p>
                </div>
                <ArrowRight size={16} className="text-white/45 transition group-hover:translate-x-1 group-hover:text-[var(--sw-accent-3)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
