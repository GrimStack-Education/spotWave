'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MessageCircle, Pin } from 'lucide-react';
import { fetchEventChat, sendEventChatMessage } from '@/features/event-chat/api/event-chat.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { ErrorState, LoadingState } from '@/shared/ui/states/states';

export function EventChatScreen({ eventId }: { eventId: string }) {
  const [message, setMessage] = useState('');
  const chatQuery = useQuery({ queryKey: queryKeys.eventChat(eventId), queryFn: () => fetchEventChat(eventId) });
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
    <UiCard className="space-y-5 p-6 md:p-8"><div><h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Event chat</h1><p className="mt-4 text-white/58">Coordinate details before meeting offline.</p></div>
      <p className="flex items-center gap-2 rounded-2xl border border-[rgba(var(--sw-accent-2-rgb),0.24)] bg-[rgba(var(--sw-accent-4-rgb),0.10)] p-4 text-sm text-white/80"><Pin size={16} /> Общайтесь только после вступления в событие.</p>
      <div className="space-y-2">{items.map((item) => <p key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.045] p-3 text-white/72"><MessageCircle className="mr-2 inline text-[var(--sw-accent-3)]" size={15} />{item.user.displayName ?? item.user.email}: {item.message}</p>)}</div>
      <div className="flex gap-2"><UiInput aria-label="message" placeholder="Type message" value={message} onChange={(e) => setMessage(e.target.value)} /><UiButton isDisabled={!message.trim() || sendMutation.isPending} onClick={() => sendMutation.mutate(message)}>{sendMutation.isPending ? 'Sending...' : 'Send'}</UiButton></div>
    </UiCard>
  );
}
