'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Bookmark, MapPin, RotateCcw, Users, X } from 'lucide-react';
import { fetchEvents, joinEvent } from '@/features/events/api/events.api';
import { mapBackendEventToDomain } from '@/features/events/model/mappers';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { toErrorMessage } from '@/shared/lib/api/error';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';
import { CoverImage } from '@/shared/ui/media/cover-image';

export function QuickMatchScreen() {
  const eventsQuery = useQuery({
    queryKey: queryKeys.events('quick-match'),
    queryFn: () => fetchEvents({ limit: 1 }),
  });
  const joinMutation = useMutation({
    mutationFn: (eventId: string) => joinEvent(eventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.events('quick-match') });
      await queryClient.invalidateQueries({ queryKey: queryKeys.events('home') });
    },
  });

  if (eventsQuery.isLoading) return <LoadingState />;

  const eventData = eventsQuery.data?.items?.[0];
  if (!eventData)
    return (
      <EmptyState
        title="Нет событий для quick match"
        description="Появятся после создания или расширения радиуса."
      />
    );

  const event = mapBackendEventToDomain(eventData);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {joinMutation.error ? <ErrorState message={toErrorMessage(joinMutation.error)} /> : null}
      <div className="grid items-end gap-5 md:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-[44px] leading-[0.98] tracking-[-0.04em] md:text-7xl md:tracking-[-0.06em]">
            Быстрый <span className="text-[var(--sw-accent-3)]">match</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/58">
            Карточка события для быстрого решения: пропустить, сохранить или присоединиться без
            лишних переходов.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="мест" value={`${event.rsvpCount}/${event.capacity}`} />
          <MiniStat label="радиус" value={`${event.radius} км`} />
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="absolute inset-x-8 top-6 h-full rotate-[-3deg] rounded-[34px] border border-white/8 bg-white/[0.035]" />
        <div className="absolute inset-x-12 top-12 h-full rotate-[3deg] rounded-[34px] border border-white/8 bg-white/[0.025]" />
        <UiCard className="relative overflow-hidden p-0 shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
          <CoverImage
            className="h-[300px] rounded-none border-0"
            seed={event.id}
            priority
            alt={event.title}
          />
          <div className="p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-[var(--sw-accent-3)]">{event.category}</span>
              <span className="flex items-center gap-2 text-sm text-white/52">
                <Users size={15} /> {event.rsvpCount}/{event.capacity}
              </span>
            </div>
            <h2 className="mt-4 text-4xl tracking-[-0.055em] md:text-5xl">{event.title}</h2>
            <p className="mt-3 flex items-center gap-2 text-white/58">
              <MapPin size={17} /> {event.datetime} · {event.location}
            </p>
            <div className="mt-7 grid grid-cols-3 gap-3">
              <UiButton variant="secondary" className="h-14">
                <X size={18} /> Пропустить
              </UiButton>
              <UiButton
                isDisabled={joinMutation.isPending}
                onClick={() => joinMutation.mutate(event.id)}
                className="h-14 border border-[rgba(var(--sw-accent-2-rgb),0.38)] bg-[var(--sw-accent-3)] hover:bg-[#ff8c1a]"
              >
                {joinMutation.isPending ? 'Отправляем...' : 'Я иду'}
              </UiButton>
              <UiButton variant="secondary" className="h-14">
                <Bookmark size={18} /> Сохранить
              </UiButton>
            </div>
          </div>
        </UiCard>
      </div>

      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/50">
        <RotateCcw size={15} /> Следующая карточка появится после обновления списка событий.
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-white/42">{label}</p>
      <p className="mt-2 text-2xl tracking-[-0.05em] text-white">{value}</p>
    </div>
  );
}
