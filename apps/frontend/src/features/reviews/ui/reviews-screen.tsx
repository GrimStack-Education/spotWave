'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarDays, MessageSquareWarning, Star } from 'lucide-react';
import { fetchEvents } from '@/features/events/api/events.api';
import { createReport } from '@/features/reports/api/reports.api';
import { fetchEventReviews, submitEventReview } from '@/features/reviews/api/reviews.api';
import { toErrorMessage } from '@/shared/lib/api/error';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '@/shared/ui/states/states';

export function ReviewsScreen() {
  const [eventId, setEventId] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [complaint, setComplaint] = useState('');
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const eventsQuery = useQuery({
    queryKey: queryKeys.events('reviews'),
    queryFn: () => fetchEvents({ limit: 20 }),
  });
  const events = eventsQuery.data?.items ?? [];
  const resolvedEventId = eventId || events[0]?.id || '';
  const selectedEvent = events.find((event) => event.id === resolvedEventId);

  const reviewsQuery = useQuery({
    queryKey: queryKeys.eventReviews(resolvedEventId),
    queryFn: () => fetchEventReviews(resolvedEventId),
    enabled: Boolean(resolvedEventId),
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      submitEventReview(resolvedEventId, { rating: Number(rating) || 5, text: reviewText }),
    onSuccess: async () => {
      setReviewText('');
      setStatus({ tone: 'success', message: 'Отзыв опубликован.' });
      await queryClient.invalidateQueries({ queryKey: queryKeys.eventReviews(resolvedEventId) });
    },
    onError: (e) => setStatus({ tone: 'error', message: toErrorMessage(e) }),
  });

  const reportMutation = useMutation({
    mutationFn: () =>
      createReport({ targetType: 'EVENT', targetId: resolvedEventId, reason: complaint }),
    onSuccess: () => {
      setComplaint('');
      setStatus({ tone: 'success', message: 'Жалоба отправлена модератору.' });
    },
    onError: (e) => setStatus({ tone: 'error', message: toErrorMessage(e) }),
  });

  if (eventsQuery.isLoading) return <LoadingState />;

  return (
    <div className="min-w-0 space-y-6">
      <div className="max-w-3xl">
        <h1 className="text-[44px] leading-[0.98] tracking-[-0.04em] md:text-7xl md:tracking-[-0.06em]">
          Отзывы и жалобы
        </h1>
        <p className="mt-4 max-w-2xl text-white/58">
          Социальное доказательство после реальных встреч: участники оставляют оценки, а спорные
          ситуации уходят в модерацию.
        </p>
      </div>

      {status ? (
        status.tone === 'success' ? (
          <SuccessState message={status.message} />
        ) : (
          <ErrorState message={status.message} />
        )
      ) : null}

      <label className="block max-w-3xl">
        <span className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">
          <CalendarDays size={16} /> Событие
        </span>
        <select
          className="mt-2 min-h-12 w-full rounded-2xl border border-white/12 bg-[#151515] px-4 text-white outline-none transition focus:border-[var(--sw-accent-3)]"
          value={resolvedEventId}
          onChange={(e) => {
            setEventId(e.target.value);
            setStatus(null);
          }}
        >
          {events.map((event) => (
            <option className="bg-[#151515]" key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </label>

      {!resolvedEventId ? (
        <EmptyState
          title="Пока нет событий"
          description="Отзывы появятся после создания первой встречи."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          <UiCard className="space-y-5 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-3)]">
                <Star size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="text-2xl tracking-[-0.04em]">Оставить отзыв</h2>
                <p className="truncate text-sm text-white/46">{selectedEvent?.title}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
              <UiInput
                aria-label="Оценка"
                inputMode="numeric"
                max="5"
                min="1"
                placeholder="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
              <UiInput
                aria-label="Отзыв"
                placeholder="Что было полезно или неудобно?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
            <UiButton
              isDisabled={!reviewText || reviewMutation.isPending}
              onClick={() => reviewMutation.mutate()}
            >
              {reviewMutation.isPending ? 'Публикуем...' : 'Опубликовать отзыв'}
            </UiButton>

            {reviewsQuery.isError ? <ErrorState message="Не удалось загрузить отзывы" /> : null}
            <div className="space-y-3">
              {(reviewsQuery.data?.items ?? []).length ? (
                (reviewsQuery.data?.items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white/86">
                        {item.author.displayName ?? item.author.email}
                      </p>
                      <span className="text-sm text-[var(--sw-accent-3)]">{item.rating}/5</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/62">{item.text}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/52">
                  Для этого события отзывов пока нет.
                </p>
              )}
            </div>
          </UiCard>

          <UiCard className="space-y-5 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-3)]">
                <MessageSquareWarning size={20} />
              </span>
              <h2 className="text-2xl tracking-[-0.04em]">Сообщить о проблеме</h2>
            </div>
            <textarea
              aria-label="Жалоба"
              className="min-h-32 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/32 focus:border-[var(--sw-accent-3)] focus:outline-none"
              placeholder="Опишите, что произошло: отмена, небезопасное поведение, спам или другая проблема."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <UiButton
              variant="danger"
              isDisabled={!complaint || reportMutation.isPending}
              onClick={() => reportMutation.mutate()}
            >
              {reportMutation.isPending ? 'Отправляем...' : 'Отправить модератору'}
            </UiButton>
          </UiCard>
        </div>
      )}
    </div>
  );
}
