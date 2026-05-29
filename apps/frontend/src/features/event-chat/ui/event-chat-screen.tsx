'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MessageCircle, Pin, Send } from 'lucide-react';
import { fetchEventChat, sendEventChatMessage } from '@/features/event-chat/api/event-chat.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';

export function EventChatScreen({
  eventId,
  compact = false,
}: {
  eventId: string;
  compact?: boolean;
}) {
  const [message, setMessage] = useState('');
  const chatQuery = useQuery({
    queryKey: queryKeys.eventChat(eventId),
    queryFn: () => fetchEventChat(eventId),
  });
  const sendMutation = useMutation({
    mutationFn: (value: string) => sendEventChatMessage(eventId, value),
    onSuccess: async () => {
      setMessage('');
      await queryClient.invalidateQueries({ queryKey: queryKeys.eventChat(eventId) });
    },
  });

  if (chatQuery.isLoading) return <LoadingState />;
  if (chatQuery.isError) return <ErrorState message="Чат недоступен" />;

  const items = chatQuery.data?.items ?? [];

  return (
    <UiCard className="space-y-5 p-5 md:p-8">
      {!compact ? (
        <div>
          <h1 className="text-[44px] leading-[0.98] tracking-[-0.04em] md:text-7xl md:tracking-[-0.06em]">
            Чат встречи
          </h1>
          <p className="mt-4 max-w-2xl text-white/58">
            Уточните детали до офлайн-встречи: место сбора, тайминг и что взять с собой.
          </p>
        </div>
      ) : null}
      <p className="flex items-center gap-2 rounded-2xl border border-[rgba(var(--sw-accent-2-rgb),0.24)] bg-[rgba(var(--sw-accent-4-rgb),0.10)] p-4 text-sm text-white/80">
        <Pin size={16} /> Общение доступно только после вступления в событие.
      </p>
      <div
        className={[
          'space-y-3 overflow-y-auto pr-1',
          compact ? 'max-h-[360px]' : 'max-h-[420px]',
        ].join(' ')}
      >
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/8 bg-white/[0.045] p-4 text-white/72"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-white/86">
                  <MessageCircle className="mr-2 inline text-[var(--sw-accent-3)]" size={15} />
                  {item.user.displayName ?? item.user.email}
                </p>
                <span className="text-xs text-white/38">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 leading-6">{item.message}</p>
            </div>
          ))
        ) : (
          <EmptyState
            title="Сообщений пока нет"
            description="Напишите первым, когда присоединитесь к событию."
          />
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <UiInput
          aria-label="Сообщение"
          placeholder="Написать в чат"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <UiButton
          className="h-12 sm:w-40"
          isDisabled={!message.trim() || sendMutation.isPending}
          onClick={() => sendMutation.mutate(message)}
        >
          <Send size={16} /> {sendMutation.isPending ? 'Отправляем...' : 'Отправить'}
        </UiButton>
      </div>
    </UiCard>
  );
}
