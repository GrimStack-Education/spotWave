'use client';

import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, CheckCircle2, MapPin, Radio, Star, Users } from 'lucide-react';
import { me } from '@/features/auth/api/auth.api';
import { fetchOnboarding } from '@/features/onboarding/api/onboarding.api';
import { toRussianInterestLabel } from '@/shared/lib/i18n/interests';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiAvatar } from '@/shared/ui/avatar/avatar';
import { UiCard } from '@/shared/ui/card/card';
import { LoadingState } from '@/shared/ui/states/states';

export function ProfileScreen() {
  const meQuery = useQuery({ queryKey: queryKeys.me, queryFn: me });
  const onboardingQuery = useQuery({ queryKey: queryKeys.onboarding, queryFn: fetchOnboarding });

  if (meQuery.isLoading || onboardingQuery.isLoading) return <LoadingState />;

  const meData = meQuery.data;
  const displayName = meData?.profile?.displayName || meData?.displayName || meData?.email || 'SpotWave User';
  const bio = meData?.profile?.bio || meData?.bio || 'Заполните настройки профиля и onboarding для точной персонализации.';
  const trust = meData?.trust;
  const activity = meData?.activity;
  const interests = meData?.interests ?? [];
  const radius = onboardingQuery.data?.radiusKm ?? meData?.profile?.radiusKm ?? 5;
  const rating = trust?.averageRating ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <UiCard className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.12)] blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 flex-wrap items-start gap-5">
              <UiAvatar label={displayName} className="h-24 w-24 rounded-[30px] text-2xl shadow-[0_20px_60px_rgba(0,0,0,0.24)]" />
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.12em] text-[var(--sw-accent-3)]">Trust {trust?.level ?? '18+'}</p>
                <h1 className="mt-3 max-w-4xl text-[50px] leading-[0.95] tracking-[-0.065em] text-white md:text-[76px]">{displayName}</h1>
                <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-white/58">
                  <span className="inline-flex items-center gap-2"><MapPin size={16} /> Радиус {radius} км</span>
                  <span className="inline-flex items-center gap-2"><CalendarClock size={16} /> На SpotWave с {formatDate(meData?.createdAt)}</span>
                </p>
              </div>
            </div>
          </div>

          <p className="relative mt-8 max-w-3xl text-lg leading-8 text-white/64">{bio}</p>

          <div className="relative mt-8 flex flex-wrap gap-2">
            {interests.length ? interests.map((interest) => (
              <span key={interest.id} className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm text-white/72">{toRussianInterestLabel(interest.name, interest.slug)}</span>
            )) : <span className="text-sm text-white/46">Интересы пока не выбраны.</span>}
          </div>
        </UiCard>

        <UiCard className="p-6">
          <h2 className="text-3xl tracking-[-0.05em]">Активность</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric icon={<Users size={17} />} label="Участий" value={String(activity?.joinedEventsCount ?? 0)} />
            <Metric icon={<Radio size={17} />} label="Хостинг" value={String(activity?.hostedEventsCount ?? 0)} />
            <Metric icon={<CheckCircle2 size={17} />} label="Check-ins" value={String(activity?.checkInsCount ?? 0)} />
            <Metric icon={<Star size={17} />} label="Рейтинг" value={rating ? rating.toFixed(1) : '—'} />
          </div>
        </UiCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <UiCard className="p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl tracking-[-0.05em]">Ближайшие события</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {(activity?.upcomingEvents ?? []).length ? activity?.upcomingEvents.map((event) => (
              <div key={event.id} className="rounded-[24px] border border-white/10 bg-[#101010] p-4">
                <p className="text-xl leading-tight tracking-[-0.035em] text-white">{event.title}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-white/52"><CalendarClock size={14} /> {formatDateTime(event.startsAt)}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/52"><MapPin size={14} /> {event.addressText ?? 'Location TBD'}</p>
              </div>
            )) : <p className="text-white/52">События появятся после присоединения или создания.</p>}
          </div>
        </UiCard>

        <UiCard className="p-6 md:p-7">
          <h2 className="text-3xl tracking-[-0.05em]">Trust summary</h2>
          <div className="mt-5 space-y-3">
            <TrustRow label="Отзывы" value={String(trust?.reviewsCount ?? 0)} tone="accent" />
            <TrustRow label="Открытые жалобы" value={String(trust?.openReports ?? 0)} tone={(trust?.openReports ?? 0) > 0 ? 'danger' : 'muted'} />
            <TrustRow label="Закрытые проверки" value={String(trust?.resolvedReports ?? 0)} tone="muted" />
          </div>
        </UiCard>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-2 text-[var(--sw-accent-3)]">{icon}<span className="text-xs uppercase tracking-[0.12em] text-white/42">{label}</span></div>
      <p className="mt-3 text-3xl tracking-[-0.05em] text-white">{value}</p>
    </div>
  );
}

function TrustRow({ label, value, tone }: { label: string; value: string; tone: 'accent' | 'danger' | 'muted' }) {
  const toneClass = tone === 'accent' ? 'text-[var(--sw-accent-3)]' : tone === 'danger' ? 'text-red-300' : 'text-white/68';
  return <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"><span className="text-sm text-white/52">{label}</span><span className={['text-lg tracking-[-0.03em]', toneClass].join(' ')}>{value}</span></div>;
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}
