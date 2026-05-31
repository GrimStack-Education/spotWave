'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { CalendarClock, LogOut, MapPin, MessageCircle, Plus, Send, Users } from 'lucide-react';
import { me } from '@/features/auth/api/auth.api';
import {
  fetchCommunity,
  fetchCommunityMessages,
  joinCommunity,
  leaveCommunity,
  sendCommunityMessage,
  type CommunityMessage,
} from '@/features/communities/api/communities.api';
import { createEvent, type BackendEvent } from '@/features/events/api/events.api';
import { toErrorMessage } from '@/shared/lib/api/error';
import { getAccessToken } from '@/shared/lib/auth/session';
import { queryKeys } from '@/shared/lib/query/keys';
import { queryClient } from '@/shared/lib/query/query-client';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export function CommunityDetailScreen({ id }: { id: string }) {
  const [message, setMessage] = useState('');
  const [accessError, setAccessError] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartsAt, setEventStartsAt] = useState(() =>
    toDateTimeLocal(new Date(Date.now() + 86_400_000)),
  );
  const [eventAddress, setEventAddress] = useState('');
  const [eventCapacity, setEventCapacity] = useState('12');
  const [eventLat, setEventLat] = useState('43.2389');
  const [eventLng, setEventLng] = useState('76.8897');
  const communityQuery = useQuery({
    queryKey: queryKeys.community(id),
    queryFn: () => fetchCommunity(id),
  });
  const meQuery = useQuery({ queryKey: queryKeys.me, queryFn: me });
  const activeMembership = communityQuery.data?.members.items.find(
    (member) => member.userId === meQuery.data?.id && member.status === 'ACTIVE',
  );
  const hasChatAccess = Boolean(activeMembership);
  const messagesQuery = useQuery({
    queryKey: queryKeys.communityMessages(id),
    queryFn: () => fetchCommunityMessages(id),
    enabled: hasChatAccess,
    retry: false,
  });
  const joinMutation = useMutation({
    mutationFn: () => joinCommunity(id),
    onSuccess: async () => {
      setAccessError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.community(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.communityMessages(id) });
    },
    onError: (error) => setAccessError(toErrorMessage(error)),
  });
  const leaveMutation = useMutation({
    mutationFn: () => leaveCommunity(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.community(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.communityMessages(id) });
    },
    onError: (error) => setAccessError(toErrorMessage(error)),
  });
  const sendMutation = useMutation({
    mutationFn: (value: string) => sendCommunityMessage(id, value),
    onSuccess: (sent) => {
      setMessage('');
      appendMessage(id, sent);
    },
    onError: (error) => setAccessError(toErrorMessage(error)),
  });
  const createEventMutation = useMutation({
    mutationFn: () =>
      createEvent({
        communityId: id,
        title: eventTitle,
        description: eventDescription,
        startsAt: new Date(eventStartsAt).toISOString(),
        capacity: Number(eventCapacity) || undefined,
        lat: Number(eventLat),
        lng: Number(eventLng),
        addressText: eventAddress,
      }),
    onSuccess: async () => {
      setEventTitle('');
      setEventDescription('');
      setEventAddress('');
      setAccessError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.community(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.events() });
    },
    onError: (error) => setAccessError(toErrorMessage(error)),
  });

  const messages = useMemo(() => messagesQuery.data?.items ?? [], [messagesQuery.data?.items]);

  useEffect(() => {
    if (!hasChatAccess) return;
    const token = getAccessToken();
    if (!token) return;

    const socket: Socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('community:join', { communityId: id });
    });
    socket.on('community:message', (incoming: CommunityMessage) => {
      appendMessage(id, incoming);
    });
    socket.on('community:error', (payload: { message?: string }) => {
      setAccessError(payload.message ?? 'Чат сообщества недоступен');
    });

    return () => {
      socket.emit('community:leave', { communityId: id });
      socket.disconnect();
    };
  }, [hasChatAccess, id]);

  if (communityQuery.isLoading || meQuery.isLoading) return <LoadingState />;
  if (communityQuery.isError || !communityQuery.data)
    return <ErrorState message="Не удалось загрузить сообщество" />;

  const community = communityQuery.data;
  const busy = joinMutation.isPending || leaveMutation.isPending || sendMutation.isPending;
  const communityEvents = community.events?.items ?? [];
  const canCreateEvent =
    hasChatAccess &&
    eventTitle.trim().length >= 3 &&
    eventDescription.trim().length >= 8 &&
    Boolean(eventStartsAt) &&
    Number.isFinite(Number(eventLat)) &&
    Number.isFinite(Number(eventLng)) &&
    !createEventMutation.isPending;

  return (
    <div className="min-w-0 space-y-6">
      {accessError ? <ErrorState message={accessError} /> : null}
      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-5">
          <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,#21130a,#101010_58%,#191919)] p-5 md:rounded-[34px] md:p-8">
            <div className="pointer-events-none absolute -right-24 -top-20 hidden size-72 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.18)] blur-3xl md:block" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.12em] text-white/54">
                  {community.city}
                </p>
                <h1 className="mt-3 max-w-4xl text-[44px] leading-[0.98] tracking-[-0.04em] text-white md:text-[78px] md:tracking-[-0.06em] xl:text-[94px]">
                  {community.name}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-7 text-white/62">
                  {community.description}
                </p>
              </div>
              <Image
                alt=""
                className="h-28 w-28 rounded-[30px] border border-white/12 bg-black/35 md:h-36 md:w-36"
                height={144}
                src={community.avatarUrl}
                unoptimized
                width={144}
              />
            </div>
          </div>

          <UiCard className="p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-3xl tracking-tighter">
                  <CalendarClock className="text-brand" size={24} /> События сообщества
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Встречи, созданные участниками этого сообщества.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {communityEvents.length ? (
                communityEvents.map((event) => <CommunityEventCard event={event} key={event.id} />)
              ) : (
                <div className="md:col-span-2">
                  <EmptyState
                    title="Событий пока нет"
                    description="Создайте первую встречу для участников сообщества."
                  />
                </div>
              )}
            </div>
          </UiCard>

          <UiCard className="p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-3xl tracking-tighter">
                  <MessageCircle className="text-brand" size={24} /> Групповой чат
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Сообщения доступны только активным участникам.
                </p>
              </div>
              {!hasChatAccess ? (
                <UiButton onPress={() => joinMutation.mutate()} isDisabled={busy}>
                  {joinMutation.isPending ? 'Вступаем...' : 'Вступить'}
                </UiButton>
              ) : null}
            </div>

            {!hasChatAccess ? (
              <div className="mt-6">
                <EmptyState
                  title="Чат закрыт"
                  description="Вступите в сообщество, чтобы читать и отправлять сообщения."
                />
              </div>
            ) : (
              <>
                <div className="mt-6 max-h-[480px] space-y-3 overflow-y-auto pr-1">
                  {messages.length ? (
                    messages.map((item) => <MessageBubble item={item} key={item.id} />)
                  ) : (
                    <EmptyState
                      title="Сообщений пока нет"
                      description="Начните разговор для участников сообщества."
                    />
                  )}
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <UiInput
                    aria-label="Сообщение"
                    placeholder="Напишите в групповой чат"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  <UiButton
                    className="h-12 sm:w-40"
                    isDisabled={!message.trim() || busy}
                    onPress={() => sendMutation.mutate(message)}
                  >
                    <Send size={16} /> {sendMutation.isPending ? '...' : 'Отправить'}
                  </UiButton>
                </div>
              </>
            )}
          </UiCard>
        </div>

        <aside className="min-w-0 space-y-5">
          <UiCard className="p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-2xl tracking-[-0.04em]">
              <Users className="text-brand" size={22} /> Участники
            </h2>
            <p className="mt-2 text-sm text-white/50">
              {community.members.activeCount} активных участников
            </p>
            <div className="mt-5 space-y-2">
              {community.members.items
                .filter((item) => item.status === 'ACTIVE')
                .slice(0, 8)
                .map((member) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3.5 px-4 py-3"
                    key={member.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-white/82">
                        {member.user.displayName ?? member.user.email}
                      </p>
                      <p className="text-xs text-white/42">
                        С {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </UiCard>

          <UiCard className="p-5 md:p-6">
            <h3 className="flex items-center gap-2 text-2xl tracking-[-0.04em]">
              <Plus size={22} className="text-brand" /> Добавить событие
            </h3>
            <p className="mt-2 text-sm text-white/50">Доступно активным участникам сообщества.</p>
            <div className="mt-5 space-y-3">
              <UiInput
                aria-label="Название события"
                placeholder="Название события"
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
              />
              <label className="block">
                <span className="mb-2 flex items-center justify-between gap-3 text-sm text-white/58">
                  <span>Описание события</span>
                  <span className="text-white/38">Минимум 8 символов</span>
                </span>
                <textarea
                  className="min-h-28 w-full resize-none rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/32 focus:border-brand"
                  onChange={(event) => setEventDescription(event.target.value)}
                  placeholder="Формат, кто приходит и что будет происходить..."
                  value={eventDescription}
                />
              </label>
              <UiInput
                aria-label="Дата и время"
                type="datetime-local"
                value={eventStartsAt}
                onChange={(event) => setEventStartsAt(event.target.value)}
              />
              <UiInput
                aria-label="Адрес"
                placeholder="Место встречи"
                value={eventAddress}
                onChange={(event) => setEventAddress(event.target.value)}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <UiInput
                  aria-label="Мест"
                  inputMode="numeric"
                  placeholder="Мест"
                  value={eventCapacity}
                  onChange={(event) => setEventCapacity(event.target.value)}
                />
                <UiInput
                  aria-label="Широта"
                  inputMode="decimal"
                  placeholder="Lat"
                  value={eventLat}
                  onChange={(event) => setEventLat(event.target.value)}
                />
                <UiInput
                  aria-label="Долгота"
                  inputMode="decimal"
                  placeholder="Lng"
                  value={eventLng}
                  onChange={(event) => setEventLng(event.target.value)}
                />
              </div>
              <UiButton
                fullWidth
                isDisabled={!canCreateEvent}
                onPress={() => createEventMutation.mutate()}
              >
                {createEventMutation.isPending ? 'Создаем...' : 'Создать событие'}
              </UiButton>
              {!hasChatAccess ? (
                <p className="text-xs text-white/42">
                  Вступите в сообщество, чтобы добавлять события.
                </p>
              ) : null}
            </div>
          </UiCard>

          <UiCard className="p-5 md:p-6">
            <h3 className="text-2xl tracking-[-0.04em]">Действия</h3>
            <div className="mt-5 grid gap-3">
              <UiButton onPress={() => joinMutation.mutate()} isDisabled={busy}>
                {joinMutation.isPending ? 'Вступаем...' : 'Вступить'}
              </UiButton>
              <UiButton variant="outline" onPress={() => leaveMutation.mutate()} isDisabled={busy}>
                <LogOut size={16} /> {leaveMutation.isPending ? 'Выходим...' : 'Покинуть'}
              </UiButton>
            </div>
          </UiCard>
        </aside>
      </section>
    </div>
  );
}

function CommunityEventCard({ event }: { event: BackendEvent }) {
  const startsAt = new Date(event.startsAt).toLocaleString();
  const count = event.participants?.memberJoinedCount ?? event.participants?.joinedCount ?? 0;

  return (
    <Link
      className="rounded-[24px] border border-white/10 bg-[#101010] p-4 transition hover:-translate-y-0.5 hover:border-[rgba(var(--sw-accent-2-rgb),0.34)]"
      href={`/events/${event.id}`}
    >
      <p className="text-xl leading-tight tracking-[-0.035em] text-white">{event.title}</p>
      <p className="mt-3 flex items-center gap-2 text-sm text-white/52">
        <CalendarClock size={14} /> {startsAt}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm text-white/52">
        <MapPin size={14} /> {event.addressText ?? 'Локация уточняется'}
      </p>
      <p className="mt-3 text-sm text-white/46">{count} участников</p>
    </Link>
  );
}

function MessageBubble({ item }: { item: CommunityMessage }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4.5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-white/86">{item.user.displayName ?? item.user.email}</p>
        <span className="text-xs text-white/38">{new Date(item.createdAt).toLocaleString()}</span>
      </div>
      <p className="mt-2 leading-6 text-white/66">{item.message}</p>
    </div>
  );
}

function appendMessage(communityId: string, incoming: CommunityMessage) {
  queryClient.setQueryData<{ items: CommunityMessage[] }>(
    queryKeys.communityMessages(communityId),
    (current) => {
      const items = current?.items ?? [];
      if (items.some((item) => item.id === incoming.id)) return { items };
      return { items: [...items, incoming] };
    },
  );
}

function toDateTimeLocal(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
