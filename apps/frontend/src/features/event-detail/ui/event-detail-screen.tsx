'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import maplibregl, { type Map, type Marker } from 'maplibre-gl';
import {
  Calendar,
  CheckCircle2,
  Crown,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { me } from '@/features/auth/api/auth.api';
import { EventChatScreen } from '@/features/event-chat/ui/event-chat-screen';
import { fetchEventById, joinEvent, leaveEvent } from '@/features/events/api/events.api';
import { mapBackendEventToDomain } from '@/features/events/model/mappers';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { toErrorMessage } from '@/shared/lib/api/error';
import { OSM_STYLE } from '@/shared/lib/map/osm';
import { ErrorState, LoadingState } from '@/shared/ui/states/states';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { CoverImage } from '@/shared/ui/media/cover-image';
import { UiAvatar } from '@/shared/ui/avatar/avatar';

export function EventDetailScreen({ id }: { id: string }) {
  const eventQuery = useQuery({ queryKey: queryKeys.event(id), queryFn: () => fetchEventById(id) });
  const meQuery = useQuery({ queryKey: queryKeys.me, queryFn: me });
  const joinMutation = useMutation({
    mutationFn: () => joinEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.event(id) });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
  const leaveMutation = useMutation({
    mutationFn: () => leaveEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.event(id) });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  if (eventQuery.isLoading || meQuery.isLoading) return <LoadingState />;
  if (eventQuery.isError || !eventQuery.data)
    return <ErrorState message="Не удалось загрузить событие" />;

  const event = mapBackendEventToDomain(eventQuery.data);
  const busy = joinMutation.isPending || leaveMutation.isPending;
  const error = joinMutation.error || leaveMutation.error;
  const progress = Math.min((event.rsvpCount / event.capacity) * 100, 100);
  const creator = eventQuery.data.creator;
  const participants = eventQuery.data.participants?.items ?? [];
  const joinedParticipants = participants.filter((item) => item.status === 'JOINED');
  const currentParticipant = participants.find((item) => item.userId === meQuery.data?.id) ?? null;
  const isHost = currentParticipant?.role === 'HOST';
  const isJoined = currentParticipant?.status === 'JOINED';
  const isWaitlisted = currentParticipant?.status === 'WAITLIST';
  const canJoin = !isHost && !isJoined && !isWaitlisted;
  const canLeave = Boolean(currentParticipant && !isHost && currentParticipant.status !== 'LEFT');
  const chatUnlocked = Boolean(isHost || isJoined);
  const actionLabel = isHost
    ? 'Вы организатор этого события'
    : isJoined
      ? 'Вы уже в списке участников'
      : isWaitlisted
        ? 'Вы в листе ожидания'
        : 'Подтвердите участие, чтобы получить доступ к чату и деталям встречи.';

  return (
    <div className="space-y-5">
      {error ? <ErrorState message={toErrorMessage(error)} /> : null}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <UiCard className="overflow-hidden p-0">
          <div className="relative">
            <CoverImage
              className="h-[22rem] rounded-none border-0"
              seed={event.id}
              src={event.imageUrl}
              priority
              alt={event.title}
            />
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3 rounded-[26px] border border-white/10 bg-black/45 p-4 backdrop-blur">
              <span className="text-sm text-[var(--sw-accent-1)]">{event.category}</span>
              <span className="text-sm text-white/70">
                {event.rsvpCount}/{event.capacity} мест занято
              </span>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">{event.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-7 text-white/60">
              {eventQuery.data.description ||
                'Организатор пока не добавил подробное описание, но событие уже доступно для участников рядом.'}
            </p>
            <div className="mt-7 grid gap-3 text-white/72 md:grid-cols-3">
              <Info icon={<Calendar size={17} />} text={event.datetime} />
              <Info icon={<MapPin size={17} />} text={event.location} />
              <Info icon={<Users size={17} />} text={`${event.rsvpCount} участников`} />
            </div>
            {eventQuery.data.community ? (
              <Link
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white/72 transition hover:border-[rgba(var(--sw-accent-2-rgb),0.34)] hover:text-white"
                href={`/communities/${eventQuery.data.community.id}`}
              >
                <Users size={16} /> Событие сообщества {eventQuery.data.community.name}
              </Link>
            ) : null}
            <div className="mt-6">
              <p className="text-sm uppercase tracking-[0.12em] text-white/42">Место встречи</p>
              <EventLocationMap lat={event.lat} lng={event.lng} title={event.title} />
            </div>
          </div>
        </UiCard>

        <div className="space-y-5">
          <UiCard className="h-fit p-6">
            <h2 className="text-3xl tracking-[-0.05em]">Забронировать место</h2>
            <p className="mt-3 text-white/56">{actionLabel}</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[var(--sw-accent-3)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-6 grid gap-3">
              {canJoin ? (
                <UiButton isDisabled={busy} onPress={() => joinMutation.mutate()} className="h-12">
                  {joinMutation.isPending ? 'Присоединяем...' : 'Присоединиться'}
                </UiButton>
              ) : null}
              {canLeave ? (
                <UiButton
                  isDisabled={busy}
                  onPress={() => leaveMutation.mutate()}
                  variant="outline"
                  className="h-12"
                >
                  {leaveMutation.isPending ? 'Отменяем...' : 'Покинуть событие'}
                </UiButton>
              ) : null}
            </div>
          </UiCard>

          <UiCard className="p-6">
            <h3 className="flex items-center gap-2 text-xl tracking-[-0.04em]">
              <Crown size={20} className="text-[var(--sw-accent-3)]" /> Организатор
            </h3>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <UiAvatar
                label={creator?.displayName ?? creator?.email ?? 'Host'}
                className="h-12 w-12"
              />
              <div className="min-w-0">
                <p className="truncate text-white/86">
                  {creator?.displayName ?? creator?.email ?? 'Организатор'}
                </p>
                <p className="text-xs text-white/42">{creator?.email}</p>
              </div>
            </div>
          </UiCard>

          <UiCard className="p-6">
            <h3 className="flex items-center gap-2 text-xl tracking-[-0.04em]">
              <Users size={20} className="text-[var(--sw-accent-3)]" /> Участники
            </h3>
            <p className="mt-2 text-sm text-white/50">{joinedParticipants.length} человек</p>
            <div className="mt-4 space-y-2">
              {joinedParticipants.slice(0, 10).map((participant) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3"
                  key={participant.userId}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <UiAvatar
                      label={participant.user.displayName ?? participant.user.email}
                      className="h-9 w-9"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white/84">
                        {participant.user.displayName ?? participant.user.email}
                      </p>
                      <p className="text-xs text-white/40">
                        С {new Date(participant.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </UiCard>

          <UiCard className="p-6">
            <h3 className="flex items-center gap-2 text-xl tracking-[-0.04em]">
              <ShieldCheck size={20} className="text-[var(--sw-accent-3)]" /> Доверие
            </h3>
            <div className="mt-4 grid gap-3">
              <TrustItem
                icon={<CheckCircle2 size={16} />}
                text="Проверка участников перед входом"
              />
              <TrustItem icon={<MapPin size={16} />} text="Check-in по месту события" />
              <TrustItem icon={<Users size={16} />} text="Лимит мест защищает формат" />
            </div>
          </UiCard>
        </div>
      </div>
      <div id="chat">
        <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-white/42">
          <MessageCircle size={15} /> Чат события
        </div>
        {chatUnlocked ? (
          <EventChatScreen eventId={id} compact />
        ) : (
          <ErrorState message="Чат откроется после вступления в событие. Сейчас доступна только карточка встречи." />
        )}
      </div>
    </div>
  );
}

function Info({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <p className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
      {icon}
      {text}
    </p>
  );
}

function EventLocationMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;

    const container = mapNodeRef.current;
    const map = new maplibregl.Map({
      attributionControl: false,
      center: [lng, lat],
      container,
      dragRotate: false,
      scrollZoom: false,
      style: OSM_STYLE,
      zoom: 14,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => map.resize());

    const markerNode = document.createElement('div');
    markerNode.className = 'grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-[var(--sw-accent-3)] text-white shadow-[0_12px_36px_rgba(255,123,0,0.35)]';
    markerNode.setAttribute('aria-label', `Точка события ${title}`);
    markerNode.innerHTML = '<span class="h-2.5 w-2.5 rounded-full bg-white"></span>';

    const marker = new maplibregl.Marker({ element: markerNode }).setLngLat([lng, lat]).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(container);
    requestAnimationFrame(() => map.resize());

    return () => {
      resizeObserver.disconnect();
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [lat, lng, title]);

  return (
    <div className="relative mt-3 h-[280px] overflow-hidden rounded-[26px] border border-white/10 bg-black">
      <div ref={mapNodeRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.24))]" />
    </div>
  );
}

function TrustItem({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <p className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/62">
      {icon}
      {text}
    </p>
  );
}
