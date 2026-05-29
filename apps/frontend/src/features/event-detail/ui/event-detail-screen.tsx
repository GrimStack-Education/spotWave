'use client';

import type { ReactNode } from 'react';
import { Calendar, CheckCircle2, MapPin, ShieldCheck, Users } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEventById, joinEvent, leaveEvent } from '@/features/events/api/events.api';
import { mapBackendEventToDomain } from '@/features/events/model/mappers';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { toErrorMessage } from '@/shared/lib/api/error';
import { ErrorState, LoadingState } from '@/shared/ui/states/states';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { CoverImage } from '@/shared/ui/media/cover-image';

export function EventDetailScreen({ id }: { id: string }) {
  const eventQuery = useQuery({ queryKey: queryKeys.event(id), queryFn: () => fetchEventById(id) });
  const joinMutation = useMutation({ mutationFn: () => joinEvent(id), onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.event(id) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.events('home') });
    await queryClient.invalidateQueries({ queryKey: queryKeys.events('map') });
  }});
  const leaveMutation = useMutation({ mutationFn: () => leaveEvent(id), onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.event(id) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.events('home') });
    await queryClient.invalidateQueries({ queryKey: queryKeys.events('map') });
  }});

  if (eventQuery.isLoading) return <LoadingState />;
  if (eventQuery.isError || !eventQuery.data) return <ErrorState message="Не удалось загрузить событие" />;

  const event = mapBackendEventToDomain(eventQuery.data);
  const busy = joinMutation.isPending || leaveMutation.isPending;
  const error = joinMutation.error || leaveMutation.error;
  const progress = Math.min((event.rsvpCount / event.capacity) * 100, 100);

  return (
    <div className="space-y-5">
      {error ? <ErrorState message={toErrorMessage(error)} /> : null}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <UiCard className="overflow-hidden p-0">
          <div className="relative">
            <CoverImage className="h-[22rem] rounded-none border-0" seed={event.id} priority alt={event.title} />
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3 rounded-[26px] border border-white/10 bg-black/45 p-4 backdrop-blur">
              <span className="text-sm text-[var(--sw-accent-1)]">{event.category}</span>
              <span className="text-sm text-white/70">{event.rsvpCount}/{event.capacity} мест занято</span>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">{event.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-7 text-white/60">{eventQuery.data.description || 'Организатор пока не добавил подробное описание, но событие уже доступно для участников рядом.'}</p>
            <div className="mt-7 grid gap-3 text-white/72 md:grid-cols-3">
              <Info icon={<Calendar size={17} />} text={event.datetime} />
              <Info icon={<MapPin size={17} />} text={event.location} />
              <Info icon={<Users size={17} />} text={`${event.rsvpCount} участников`} />
            </div>
          </div>
        </UiCard>

        <div className="space-y-5">
          <UiCard className="h-fit p-6">
            <h2 className="text-3xl tracking-[-0.05em]">Забронировать место</h2>
            <p className="mt-3 text-white/56">CTA теперь всегда читается поверх темной поверхности и явно блокируется на время запроса.</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-[var(--sw-accent-3)]" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-6 grid gap-3">
              <UiButton isDisabled={busy} onPress={() => joinMutation.mutate()} className="h-12">
                {joinMutation.isPending ? 'Присоединяем...' : 'Присоединиться'}
              </UiButton>
              <UiButton isDisabled={busy} onPress={() => leaveMutation.mutate()} variant="outline" className="h-12">
                {leaveMutation.isPending ? 'Отменяем...' : 'Покинуть событие'}
              </UiButton>
            </div>
          </UiCard>

          <UiCard className="p-6">
            <h3 className="flex items-center gap-2 text-xl tracking-[-0.04em]"><ShieldCheck size={20} className="text-[var(--sw-accent-3)]" /> Доверие</h3>
            <div className="mt-4 grid gap-3">
              <TrustItem icon={<CheckCircle2 size={16} />} text="Проверка участников перед входом" />
              <TrustItem icon={<MapPin size={16} />} text="Check-in по месту события" />
              <TrustItem icon={<Users size={16} />} text="Лимит мест защищает формат" />
            </div>
          </UiCard>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, text }: { icon: ReactNode; text: string }) {
  return <p className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] p-4">{icon}{text}</p>;
}

function TrustItem({ icon, text }: { icon: ReactNode; text: string }) {
  return <p className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/62">{icon}{text}</p>;
}
