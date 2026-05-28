'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MessageSquareWarning, Star } from 'lucide-react';
import { fetchEvents } from '@/features/events/api/events.api';
import { createReport } from '@/features/reports/api/reports.api';
import { fetchEventReviews, submitEventReview } from '@/features/reviews/api/reviews.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { ErrorState, LoadingState } from '@/shared/ui/states/states';

export function ReviewsScreen() {
  const [eventId, setEventId] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [complaint, setComplaint] = useState('');

  const eventsQuery = useQuery({ queryKey: queryKeys.events('reviews'), queryFn: () => fetchEvents({ limit: 20 }) });
  const resolvedEventId = eventId || eventsQuery.data?.items?.[0]?.id || '';

  const reviewsQuery = useQuery({
    queryKey: queryKeys.eventReviews(resolvedEventId),
    queryFn: () => fetchEventReviews(resolvedEventId),
    enabled: Boolean(resolvedEventId),
  });

  const reviewMutation = useMutation({
    mutationFn: () => submitEventReview(resolvedEventId, { rating: Number(rating) || 5, text: reviewText }),
    onSuccess: async () => {
      setReviewText('');
      await queryClient.invalidateQueries({ queryKey: queryKeys.eventReviews(resolvedEventId) });
    },
  });

  const reportMutation = useMutation({
    mutationFn: () => createReport({ targetType: 'EVENT', targetId: resolvedEventId, reason: complaint }),
    onSuccess: () => setComplaint(''),
  });

  if (eventsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-5"><div><h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Reviews</h1><p className="mt-4 text-white/58">Trust signals from people who actually attended.</p></div>
      <UiInput placeholder="Event ID" value={resolvedEventId} onChange={(e) => setEventId(e.target.value)} />
      <div className="grid gap-4 lg:grid-cols-2"><UiCard className="space-y-4 p-6"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-3)]"><Star size={20} /></span><div><h2 className="text-2xl tracking-[-0.04em]">Leave a review</h2></div></div><UiInput aria-label="rating" placeholder="5" value={rating} onChange={(e) => setRating(e.target.value)} /><UiInput aria-label="review" placeholder="Leave your feedback" value={reviewText} onChange={(e) => setReviewText(e.target.value)} /><UiButton isDisabled={!resolvedEventId || !reviewText || reviewMutation.isPending} onClick={() => reviewMutation.mutate()}>{reviewMutation.isPending ? 'Submitting...' : 'Submit review'}</UiButton>{reviewsQuery.isError ? <ErrorState message="Не удалось загрузить отзывы" /> : null}<div className="space-y-2">{(reviewsQuery.data?.items ?? []).map((item) => <p key={item.id} className="text-sm text-white/70">{item.author.displayName ?? item.author.email}: {item.rating}/5 - {item.text}</p>)}</div></UiCard>
      <UiCard className="space-y-4 p-6"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-3)]"><MessageSquareWarning size={20} /></span><h2 className="text-2xl tracking-[-0.04em]">Report an issue</h2></div><UiInput aria-label="complaint" placeholder="Describe issue" value={complaint} onChange={(e) => setComplaint(e.target.value)} /><UiButton variant="danger" isDisabled={!resolvedEventId || !complaint || reportMutation.isPending} onClick={() => reportMutation.mutate()}>{reportMutation.isPending ? 'Sending...' : 'Send complaint'}</UiButton></UiCard></div>
    </div>
  );
}
