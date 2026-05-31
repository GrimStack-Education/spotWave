'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarDays, ShieldAlert, UserPlus } from 'lucide-react';
import { me } from '@/features/auth/api/auth.api';
import { fetchEvents } from '@/features/events/api/events.api';
import {
  approveJoinRequest,
  fetchJoinRequests,
  rejectJoinRequest,
} from '@/features/join-requests/api/join-requests.api';
import { toErrorMessage } from '@/shared/lib/api/error';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';

export function JoinRequestsScreen({ initialEventId = '' }: { initialEventId?: string }) {
  const [eventId, setEventId] = useState(initialEventId);
  const eventsQuery = useQuery({
    queryKey: queryKeys.events('join-requests'),
    queryFn: () => fetchEvents({ limit: 30 }),
  });
  const events = eventsQuery.data?.items ?? [];
  const resolvedEventId = eventId || events[0]?.id || '';
  const selectedEvent = events.find((event) => event.id === resolvedEventId);
  const meQuery = useQuery({ queryKey: queryKeys.me, queryFn: me });
  const isOrganizer = Boolean(
    selectedEvent?.creator?.id && meQuery.data?.id === selectedEvent.creator.id,
  );
  const requestsQuery = useQuery({
    queryKey: queryKeys.joinRequests(resolvedEventId),
    queryFn: () => fetchJoinRequests(resolvedEventId),
    enabled: Boolean(resolvedEventId && isOrganizer),
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => approveJoinRequest(resolvedEventId, userId),
    onSuccess: async () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(resolvedEventId) }),
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => rejectJoinRequest(resolvedEventId, userId),
    onSuccess: async () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(resolvedEventId) }),
  });

  if (eventsQuery.isLoading || meQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-w-0 space-y-6">
      <div className="max-w-3xl">
        <h1 className="text-[44px] leading-[0.98] tracking-[-0.04em] md:text-7xl md:tracking-[-0.06em]">
          Заявки на участие
        </h1>
        <p className="mt-4 max-w-2xl text-white/58">
          Организатор видит, кто хочет попасть на встречу, и быстро подтверждает или отклоняет
          запрос.
        </p>
      </div>

      {events.length ? (
        <label className="block max-w-3xl">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">
            <CalendarDays size={16} /> Событие
          </span>
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border border-white/12 bg-[#151515] px-4 text-white outline-none transition focus:border-brand"
            value={resolvedEventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            {events.map((event) => (
              <option className="bg-[#151515]" key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <EmptyState
          title="Событий пока нет"
          description="Заявки появятся после публикации первой встречи."
        />
      )}

      {!isOrganizer && resolvedEventId ? (
        <UiCard className="flex items-start gap-4 p-5 md:p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-brand">
            <ShieldAlert size={20} />
          </span>
          <div>
            <h2 className="text-2xl tracking-[-0.04em]">Доступно организатору</h2>
            <p className="mt-2 text-white/58">
              Заявки может смотреть только автор события. Для демо войдите как host или выберите
              свое событие.
            </p>
          </div>
        </UiCard>
      ) : null}
      {isOrganizer && requestsQuery.isLoading ? <LoadingState /> : null}
      {isOrganizer && requestsQuery.isError ? (
        <ErrorState message={toErrorMessage(requestsQuery.error)} />
      ) : null}

      {isOrganizer && !requestsQuery.isLoading && !requestsQuery.isError && resolvedEventId ? (
        (requestsQuery.data?.items ?? []).length ? (
          <div className="grid gap-3">
            {(requestsQuery.data?.items ?? []).map((request) => (
              <UiCard key={request.userId} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-brand">
                      <UserPlus size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-white/86">
                        {request.user.displayName ?? request.user.email}
                      </p>
                      <p className="text-sm text-white/46">
                        Хочет присоединиться к {selectedEvent?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <UiButton
                      size="sm"
                      isDisabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(request.userId)}
                    >
                      Принять
                    </UiButton>
                    <UiButton
                      size="sm"
                      variant="secondary"
                      isDisabled={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(request.userId)}
                    >
                      Отклонить
                    </UiButton>
                  </div>
                </div>
              </UiCard>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Новых заявок нет"
            description="Когда участники отправят запрос, он появится здесь."
          />
        )
      ) : null}
    </div>
  );
}
