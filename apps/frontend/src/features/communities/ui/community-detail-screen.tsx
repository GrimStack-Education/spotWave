'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { LogOut, MessageCircle, Send, ShieldCheck, Users } from 'lucide-react';
import {
  fetchCommunity,
  fetchCommunityMessages,
  joinCommunity,
  leaveCommunity,
  sendCommunityMessage,
  type CommunityMessage,
} from '@/features/communities/api/communities.api';
import { toErrorMessage } from '@/shared/lib/api/error';
import { getAccessToken } from '@/shared/lib/auth/session';
import { queryKeys } from '@/shared/lib/query/keys';
import { queryClient } from '@/shared/lib/query/query-client';
import { UiBadge } from '@/shared/ui/badge/badge';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export function CommunityDetailScreen({ id }: { id: string }) {
  const [message, setMessage] = useState('');
  const [accessError, setAccessError] = useState<string | null>(null);
  const communityQuery = useQuery({ queryKey: queryKeys.community(id), queryFn: () => fetchCommunity(id) });
  const messagesQuery = useQuery({
    queryKey: queryKeys.communityMessages(id),
    queryFn: () => fetchCommunityMessages(id),
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

  const messages = useMemo(() => messagesQuery.data?.items ?? [], [messagesQuery.data?.items]);
  const hasChatAccess = !messagesQuery.isError;

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

  if (communityQuery.isLoading) return <LoadingState />;
  if (communityQuery.isError || !communityQuery.data) return <ErrorState message="Не удалось загрузить сообщество" />;

  const community = communityQuery.data;
  const busy = joinMutation.isPending || leaveMutation.isPending || sendMutation.isPending;

  return (
    <div className="space-y-6">
      {accessError ? <ErrorState message={accessError} /> : null}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#21130a,#101010_58%,#191919)] p-6 md:p-8">
            <div className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.18)] blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <UiBadge className="border-white/12 bg-black/35 text-white/70">{community.city}</UiBadge>
                <h1 className="mt-5 max-w-4xl text-[52px] leading-[0.96] tracking-[-0.06em] text-white md:text-[78px] xl:text-[94px]">
                  {community.name}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-7 text-white/62">{community.description}</p>
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
                <h2 className="flex items-center gap-2 text-3xl tracking-[-0.05em]">
                  <MessageCircle className="text-[var(--sw-accent-3)]" size={24} /> Групповой чат
                </h2>
                <p className="mt-2 text-sm text-white/50">Сообщения доступны только активным участникам.</p>
              </div>
              {!hasChatAccess ? (
                <UiButton onPress={() => joinMutation.mutate()} isDisabled={busy}>
                  {joinMutation.isPending ? 'Вступаем...' : 'Вступить'}
                </UiButton>
              ) : null}
            </div>

            {!hasChatAccess ? (
              <div className="mt-6">
                <EmptyState title="Чат закрыт" description="Вступите в сообщество, чтобы читать и отправлять сообщения." />
              </div>
            ) : (
              <>
                <div className="mt-6 max-h-[480px] space-y-3 overflow-y-auto pr-1">
                  {messages.length ? messages.map((item) => <MessageBubble item={item} key={item.id} />) : (
                    <EmptyState title="Сообщений пока нет" description="Начните разговор для участников сообщества." />
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
                    className="h-12 sm:w-36"
                    isDisabled={!message.trim() || busy}
                    onPress={() => sendMutation.mutate(message)}
                  >
                    <Send size={16} /> {sendMutation.isPending ? '...' : 'Send'}
                  </UiButton>
                </div>
              </>
            )}
          </UiCard>
        </div>

        <aside className="space-y-5">
          <UiCard className="p-6">
            <h2 className="flex items-center gap-2 text-2xl tracking-[-0.04em]">
              <Users className="text-[var(--sw-accent-3)]" size={22} /> Участники
            </h2>
            <p className="mt-2 text-sm text-white/50">{community.members.activeCount} активных участников</p>
            <div className="mt-5 space-y-2">
              {community.members.items.filter((item) => item.status === 'ACTIVE').slice(0, 8).map((member) => (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3" key={member.id}>
                  <div className="min-w-0">
                    <p className="truncate text-white/82">{member.user.displayName ?? member.user.email}</p>
                    <p className="text-xs text-white/42">{member.role}</p>
                  </div>
                  {member.role === 'OWNER' ? <ShieldCheck size={16} className="text-[var(--sw-accent-3)]" /> : null}
                </div>
              ))}
            </div>
          </UiCard>

          <UiCard className="p-6">
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

function MessageBubble({ item }: { item: CommunityMessage }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.045] p-4">
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
