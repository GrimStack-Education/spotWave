'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { approveJoinRequest, fetchJoinRequests, rejectJoinRequest } from '@/features/join-requests/api/join-requests.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { ErrorState, LoadingState } from '@/shared/ui/states/states';

export function JoinRequestsScreen({ initialEventId = '' }: { initialEventId?: string }) {
  const [eventId, setEventId] = useState(initialEventId);
  const requestsQuery = useQuery({
    queryKey: queryKeys.joinRequests(eventId),
    queryFn: () => fetchJoinRequests(eventId),
    enabled: Boolean(eventId),
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => approveJoinRequest(eventId, userId),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(eventId) }),
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => rejectJoinRequest(eventId, userId),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(eventId) }),
  });

  return (
    <div className="space-y-5"><h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Join requests</h1>
      <UiInput placeholder="Event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} />
      {!eventId ? <ErrorState message="Введите event id для управления запросами" /> : null}
      {requestsQuery.isLoading ? <LoadingState /> : null}
      {requestsQuery.isError ? <ErrorState message="Не удалось загрузить запросы" /> : null}
      <div className="grid gap-3">{(requestsQuery.data?.items ?? []).map((request) => <UiCard key={request.userId} className="p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-3)]"><UserPlus size={20} /></span><span>{request.user.displayName ?? request.user.email} wants to join</span></div><div className="flex gap-2"><UiButton size="sm" isDisabled={approveMutation.isPending} onClick={() => approveMutation.mutate(request.userId)}>Approve</UiButton><UiButton size="sm" variant="secondary" isDisabled={rejectMutation.isPending} onClick={() => rejectMutation.mutate(request.userId)}>Reject</UiButton></div></div></UiCard>)}</div>
    </div>
  );
}
