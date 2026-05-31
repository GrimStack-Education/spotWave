'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPinned, QrCode, ScanLine } from 'lucide-react';
import { createCheckIn } from '@/features/check-in/api/check-in.api';
import { fetchEvents } from '@/features/events/api/events.api';
import { toErrorMessage } from '@/shared/lib/api/error';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '@/shared/ui/states/states';

export function CheckInScreen({ initialEventId = '' }: { initialEventId?: string }) {
  const [eventId, setEventId] = useState(initialEventId);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const eventsQuery = useQuery({
    queryKey: queryKeys.events('check-in'),
    queryFn: () => fetchEvents({ limit: 30 }),
  });
  const events = eventsQuery.data?.items ?? [];
  const resolvedEventId = eventId || events[0]?.id || '';

  const mutation = useMutation({
    mutationFn: (payload: { method: 'GEO' | 'QR' | 'CODE'; code?: string }) =>
      createCheckIn(resolvedEventId, payload),
    onSuccess: () => setStatus({ tone: 'success', message: 'Участие подтверждено.' }),
    onError: (error) => setStatus({ tone: 'error', message: toErrorMessage(error) }),
  });

  if (eventsQuery.isLoading) return <LoadingState />;

  return (
    <UiCard className="space-y-6 p-5 md:p-8">
      <div>
        <h1 className="text-[44px] leading-[0.98] tracking-[-0.04em] md:text-7xl md:tracking-[-0.06em]">
          Check-in
        </h1>
        <p className="mt-4 max-w-2xl text-white/58">
          Подтвердите реальное присутствие на встрече: по геолокации, QR или короткому коду
          организатора.
        </p>
      </div>

      {events.length ? (
        <label className="block">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">
            <CalendarDays size={16} /> Событие
          </span>
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border border-white/12 bg-[#151515] px-4 text-white outline-none transition focus:border-[var(--sw-accent-3)]"
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
          title="Нет доступных событий"
          description="Check-in появится после создания первой встречи."
        />
      )}

      <UiInput
        placeholder="Код организатора, если нужен"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      {status ? (
        status.tone === 'success' ? (
          <SuccessState message={status.message} />
        ) : (
          <ErrorState message={status.message} />
        )
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        <Action
          disabled={!resolvedEventId || mutation.isPending}
          icon={<MapPinned size={22} />}
          title="По геолокации"
          onClick={() => mutation.mutate({ method: 'GEO' })}
        />
        <Action
          disabled={!resolvedEventId || mutation.isPending}
          icon={<QrCode size={22} />}
          title="Сканировать QR"
          onClick={() => mutation.mutate({ method: 'QR', code })}
        />
        <Action
          disabled={!resolvedEventId || mutation.isPending}
          icon={<ScanLine size={22} />}
          title="Ввести код"
          primary
          onClick={() => mutation.mutate({ method: 'CODE', code })}
        />
      </div>
    </UiCard>
  );
}

function Action({
  disabled,
  icon,
  primary,
  title,
  onClick,
}: {
  disabled?: boolean;
  icon: React.ReactNode;
  primary?: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <UiButton
      className="h-24 flex-col gap-2"
      isDisabled={disabled}
      variant={primary ? 'primary' : 'secondary'}
      onClick={onClick}
    >
      {icon}
      {title}
    </UiButton>
  );
}
