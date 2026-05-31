'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MapPin, Radar, Wand2 } from 'lucide-react';
import {
  fetchOnboarding,
  fetchOnboardingInterests,
  saveOnboarding,
} from '@/features/onboarding/api/onboarding.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { toErrorMessage } from '@/shared/lib/api/error';
import { toRussianInterestLabel } from '@/shared/lib/i18n/interests';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { ErrorState, LoadingState } from '@/shared/ui/states/states';
import { CoverImage } from '@/shared/ui/media/cover-image';

const radii = [2, 5, 10];

export function OnboardingScreen() {
  const router = useRouter();
  const meQuery = useQuery({ queryKey: queryKeys.onboarding, queryFn: fetchOnboarding });
  const interestsQuery = useQuery({
    queryKey: ['onboarding', 'interests'],
    queryFn: fetchOnboardingInterests,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [radiusKm, setRadiusKm] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: saveOnboarding,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.onboarding });
      router.push('/home');
    },
    onError: (e) => setError(toErrorMessage(e)),
  });

  if (meQuery.isLoading || interestsQuery.isLoading) return <LoadingState />;

  const currentIds = selectedIds.length ? selectedIds : (meQuery.data?.interestIds ?? []);
  const currentRadius = radiusKm || meQuery.data?.radiusKm || 5;
  const availableInterests = interestsQuery.data?.items ?? [];
  const requiresInterestSelection = availableInterests.length > 0;
  const canContinue = !mutation.isPending && (!requiresInterestSelection || currentIds.length > 0);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <UiCard className="relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.12)] blur-3xl" />
        <div className="relative">
          <h1 className="max-w-3xl text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">
            Настройте локальный ритм
          </h1>
          <p className="mt-4 max-w-2xl text-white/60">
            Выберите интересы и радиус поиска перед входом в основную ленту SpotWave.
          </p>
        </div>
        {error ? (
          <div className="mt-6">
            <ErrorState message={error} />
          </div>
        ) : null}

        <div className="relative mt-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm uppercase tracking-widest text-white/54">Интересы</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/56">
              Выбрано: {currentIds.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((item) => {
              const active = currentIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  className={[
                    'rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.55)]',
                    active
                      ? 'border-[rgba(var(--sw-accent-2-rgb),0.48)] bg-[rgba(var(--sw-accent-4-rgb),0.24)] text-(--sw-accent-1) shadow-[0_0_0_1px_rgba(255,145,0,0.28)]'
                      : 'border-white/12 text-white/74 hover:border-white/25 hover:bg-white/4',
                  ].join(' ')}
                  onClick={() =>
                    setSelectedIds((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id],
                    )
                  }
                >
                  {toRussianInterestLabel(item.name, item.slug)}
                </button>
              );
            })}
          </div>
          {!availableInterests.length ? (
            <p className="text-sm text-white/50">
              Интересы пока не заполнены в системе, можно продолжить без выбора.
            </p>
          ) : null}
        </div>

        <div className="relative mt-8 space-y-3">
          <h2 className="text-sm uppercase tracking-widest text-white/54">Радиус</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {radii.map((radius) => {
              const active = currentRadius === radius;
              return (
                <button
                  key={radius}
                  type="button"
                  aria-pressed={active}
                  className={[
                    'rounded-[24px] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.55)]',
                    active
                      ? 'border-[rgba(var(--sw-accent-2-rgb),0.55)] bg-[rgba(var(--sw-accent-4-rgb),0.26)] text-(--sw-accent-1) shadow-[0_0_0_1px_rgba(255,145,0,0.3)]'
                      : 'border-white/10 bg-white/4 text-white/72 hover:border-white/24 hover:bg-white/[0.07]',
                  ].join(' ')}
                  onClick={() => setRadiusKm(radius)}
                >
                  <span className="text-3xl tracking-tighter">{radius} км</span>
                  <span className="mt-2 block text-sm text-white/48">
                    {radius === 2
                      ? 'Ближайшие места'
                      : radius === 5
                        ? 'Оптимальный город'
                        : 'Шире круг'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <UiButton
          className="relative mt-8 h-14 w-full md:w-auto"
          isDisabled={!canContinue}
          onClick={() => mutation.mutate({ radiusKm: currentRadius, interestIds: currentIds })}
        >
          <MapPin size={18} /> {mutation.isPending ? 'Сохраняем...' : 'Сохранить и продолжить'}
        </UiButton>
      </UiCard>

      <UiCard className="p-6">
        <CoverImage
          className="h-64 rounded-[26px]"
          seed="onboarding"
          priority
          alt="SpotWave onboarding"
        />
        <h2 className="mt-5 text-2xl tracking-[-0.04em]">Лента станет точнее</h2>
        <p className="mt-2 text-white/56">
          SpotWave поднимает реальные события рядом выше бесконечного скролла.
        </p>
        <div className="mt-5 grid gap-3">
          <SideNote
            icon={<Radar size={16} />}
            title="Радиус влияет на карту"
            text="2/5/10 км явно меняют локальный контекст."
          />
          <SideNote
            icon={<Wand2 size={16} />}
            title="Интересы формируют фид"
            text="Выбранные темы дают алгоритму первый сигнал."
          />
        </div>
      </UiCard>
    </div>
  );
}

function SideNote({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
      <p className="flex items-center gap-2 text-sm text-white/80">
        {icon}
        {title}
      </p>
      <p className="mt-2 text-sm text-white/48">{text}</p>
    </div>
  );
}
