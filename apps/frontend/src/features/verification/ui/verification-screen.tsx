'use client';

import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
  Star,
  UserCheck,
  Waves,
} from 'lucide-react';
import { me } from '@/features/auth/api/auth.api';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiCard } from '@/shared/ui/card/card';
import { LoadingState } from '@/shared/ui/states/states';

const levels = ['12+', '18+', '25+'];

export function VerificationScreen() {
  const meQuery = useQuery({ queryKey: queryKeys.me, queryFn: me });
  if (meQuery.isLoading) return <LoadingState />;

  const trust = meQuery.data?.trust;
  const level = trust?.level ?? '18+';
  const rating = trust?.averageRating;
  const openReports = trust?.openReports ?? 0;
  const checks = [
    {
      label: 'Профиль заполнен',
      done: Boolean(meQuery.data?.profile?.bio && meQuery.data?.interests?.length),
    },
    { label: 'Есть check-in история', done: (trust?.checkInsCount ?? 0) > 0 },
    { label: 'Есть отзывы участников', done: (trust?.reviewsCount ?? 0) > 0 },
    { label: 'Нет открытых жалоб', done: openReports === 0 },
  ];
  const completedChecks = checks.filter((item) => item.done).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <UiCard className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.14)] blur-3xl" />
          <p className="relative text-sm uppercase tracking-[0.12em] text-[var(--sw-accent-3)]">
            Trust dashboard
          </p>
          <h1 className="relative mt-3 text-[58px] leading-[0.96] tracking-[-0.07em] text-white md:text-[84px] xl:text-[96px]">
            Уровень доверия
          </h1>
          <p className="relative mt-5 max-w-2xl text-lg leading-7 text-white/60">
            Доверие теперь считается из backend-активности: профиль, check-ins, отзывы,
            hosted/joined события и moderation-сигналы.
          </p>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {levels.map((item) => {
              const active = item === level;
              return (
                <div
                  key={item}
                  className={[
                    'rounded-[24px] border p-5 text-center transition',
                    active
                      ? 'border-[rgba(var(--sw-accent-2-rgb),0.45)] bg-[rgba(var(--sw-accent-4-rgb),0.18)] text-[var(--sw-accent-1)] shadow-[0_0_0_1px_rgba(var(--sw-accent-2-rgb),0.18)]'
                      : 'border-white/10 bg-[#101010] text-white/58',
                  ].join(' ')}
                >
                  <p className="text-4xl tracking-[-0.05em]">{item}</p>
                  <p className="mt-1 text-sm text-white/48">уровень</p>
                </div>
              );
            })}
          </div>
        </UiCard>

        <UiCard className="p-6">
          <h2 className="text-3xl tracking-[-0.05em]">Сводка</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric icon={<ShieldCheck size={18} />} value={level} label="Проверка" />
            <Metric
              icon={<Star size={18} />}
              value={rating ? rating.toFixed(1) : '—'}
              label="Рейтинг"
            />
            <Metric
              icon={<UserCheck size={18} />}
              value={String(trust?.reviewsCount ?? 0)}
              label="Отзывы"
            />
            <Metric
              icon={<ClipboardCheck size={18} />}
              value={String(trust?.checkInsCount ?? 0)}
              label="Check-ins"
            />
          </div>
        </UiCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <UiCard className="p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl tracking-[-0.05em]">Проверки</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-sm text-white/56">
              {completedChecks}/{checks.length}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {checks.map((item) => (
              <CheckRow key={item.label} done={item.done} label={item.label} />
            ))}
          </div>
        </UiCard>

        <UiCard className="p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl tracking-[-0.05em]">Отзывы и сигналы</h2>
            <span
              className={[
                'inline-flex items-center gap-2 text-sm',
                openReports > 0 ? 'text-red-200' : 'text-[var(--sw-accent-3)]',
              ].join(' ')}
            >
              {openReports > 0 ? <AlertTriangle size={13} /> : <Waves size={13} />}{' '}
              {openReports > 0 ? `${openReports} открыто` : 'чисто'}
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(trust?.recentReviews ?? []).length ? (
              trust?.recentReviews.map((review) => (
                <div
                  key={`${review.eventId}-${review.authorName}`}
                  className="rounded-[24px] border border-white/10 bg-[#101010] p-4"
                >
                  <p className="flex items-center gap-1 text-[var(--sw-accent-3)]">
                    <Star size={15} /> {review.rating}/5
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/64">{review.text}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.1em] text-white/38">
                    {review.eventTitle}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-white/52">Отзывы появятся после первых завершенных встреч.</p>
            )}
          </div>
        </UiCard>
      </section>
    </div>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-2 text-[var(--sw-accent-3)]">
        {icon}
        <span className="text-xs uppercase tracking-[0.12em] text-white/42">{label}</span>
      </div>
      <p className="mt-3 text-3xl tracking-[-0.05em] text-white">{value}</p>
    </div>
  );
}

function CheckRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div
      className={[
        'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition',
        done
          ? 'border-[rgba(var(--sw-accent-2-rgb),0.32)] bg-[rgba(var(--sw-accent-4-rgb),0.14)] text-[var(--sw-accent-1)]'
          : 'border-white/10 bg-white/[0.04] text-white/48',
      ].join(' ')}
    >
      <CheckCircle2 size={17} />
      {label}
    </div>
  );
}
