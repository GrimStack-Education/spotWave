'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Bell, Lock, MapPin, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { fetchOnboarding, saveOnboarding } from '@/features/onboarding/api/onboarding.api';
import { toErrorMessage } from '@/shared/lib/api/error';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { ErrorState, LoadingState, SuccessState } from '@/shared/ui/states/states';

export function SettingsScreen() {
  const onboardingQuery = useQuery({ queryKey: queryKeys.onboarding, queryFn: fetchOnboarding });
  const [radius, setRadius] = useState('5');
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: (nextRadius: number) =>
      saveOnboarding({
        radiusKm: nextRadius,
        interestIds: onboardingQuery.data?.interestIds ?? [],
      }),
    onSuccess: async () => {
      setStatus({ tone: 'success', message: 'Настройки ленты сохранены.' });
      await queryClient.invalidateQueries({ queryKey: queryKeys.onboarding });
    },
    onError: (error) => setStatus({ tone: 'error', message: toErrorMessage(error) }),
  });

  if (onboardingQuery.isLoading) return <LoadingState />;

  const savedRadius = onboardingQuery.data?.radiusKm ?? 5;
  const radiusValue = radius || String(savedRadius);
  const radiusNumber = Math.min(Math.max(Number(radiusValue) || savedRadius, 1), 50);

  return (
    <div className="min-w-0 space-y-6">
      <div className="max-w-3xl">
        <h1 className="text-[44px] leading-[0.98] tracking-[-0.04em] md:text-7xl md:tracking-[-0.06em]">
          Настройки
        </h1>
        <p className="mt-4 max-w-2xl text-white/58">
          Управляйте радиусом поиска, уведомлениями и базовой безопасностью аккаунта.
        </p>
      </div>

      {status ? (
        status.tone === 'success' ? (
          <SuccessState message={status.message} />
        ) : (
          <ErrorState message={status.message} />
        )
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <UiCard className="p-5 md:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-brand">
              <MapPin size={22} />
            </span>
            <div>
              <h2 className="text-2xl tracking-[-0.04em]">Радиус ленты</h2>
              <p className="mt-1 text-sm text-white/46">События и сообщества рядом с вами.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <UiInput
                aria-label="Радиус поиска"
                className="sm:max-w-35"
                inputMode="numeric"
                max="50"
                min="1"
                value={radiusValue}
                onChange={(e) => setRadius(e.target.value)}
              />
              <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/3.5 px-4">
                <SlidersHorizontal size={16} className="text-brand" />
                <input
                  aria-label="Слайдер радиуса"
                  className="h-2 w-full accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.55)]"
                  max={50}
                  min={1}
                  type="range"
                  value={radiusNumber}
                  onChange={(event) => setRadius(event.target.value)}
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/3.5 p-4">
              <span className="text-white/58">Текущий радиус</span>
              <span className="text-3xl tracking-tighter text-brand">{radiusNumber} км</span>
            </div>
            <UiButton isDisabled={mutation.isPending} onClick={() => mutation.mutate(radiusNumber)}>
              {mutation.isPending ? 'Сохраняем...' : 'Сохранить радиус'}
            </UiButton>
          </div>
        </UiCard>

        <div className="grid gap-5">
          <UiCard className="p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-brand">
                <Bell size={22} />
              </span>
              <h2 className="text-2xl tracking-[-0.04em]">Уведомления</h2>
            </div>
            <p className="mt-4 text-white/60">
              Заявки, статусы встреч и новые сообщения собираются в центре обновлений.
            </p>
          </UiCard>
          <UiCard className="p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-brand">
                <Lock size={22} />
              </span>
              <h2 className="text-2xl tracking-[-0.04em]">Безопасность</h2>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-white/60">
              <p className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand" /> Сессия проверяется перед входом в
                app-раздел.
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand" /> JWT хранится локально и
                сбрасывается при выходе.
              </p>
            </div>
          </UiCard>
        </div>
      </div>
    </div>
  );
}
