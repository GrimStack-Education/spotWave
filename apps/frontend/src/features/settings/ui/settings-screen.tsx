'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Bell, Lock } from 'lucide-react';
import { fetchOnboarding, saveOnboarding } from '@/features/onboarding/api/onboarding.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { LoadingState } from '@/shared/ui/states/states';

export function SettingsScreen() {
  const onboardingQuery = useQuery({ queryKey: queryKeys.onboarding, queryFn: fetchOnboarding });
  const [radius, setRadius] = useState('5');

  const mutation = useMutation({
    mutationFn: (nextRadius: number) => saveOnboarding({ radiusKm: nextRadius, interestIds: onboardingQuery.data?.interestIds ?? [] }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: queryKeys.onboarding }),
  });

  if (onboardingQuery.isLoading) return <LoadingState />;

  return (
    <div className="flex flex-col gap-5"><h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Настройки</h1>
      <div className="grid gap-5 lg:grid-cols-2"><UiCard className="p-6"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-3)]"><Bell size={22} /></span><h2 className="text-2xl tracking-[-0.04em]">Радиус ленты</h2></div><div className="mt-4 flex gap-2"><UiInput value={radius} onChange={(e) => setRadius(e.target.value)} placeholder={String(onboardingQuery.data?.radiusKm ?? 5)} /><UiButton isDisabled={mutation.isPending} onClick={() => mutation.mutate(Number(radius) || 5)}>{mutation.isPending ? 'Сохраняем...' : 'Сохранить'}</UiButton></div></UiCard>
      <UiCard className="p-6"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-3)]"><Lock size={22} /></span><h2 className="text-2xl tracking-[-0.04em]">Безопасность</h2></div><p className="mt-4 text-white/60">Сессия управляется через JWT и проверку /auth/me при входе в app-роуты.</p></UiCard></div>
    </div>
  );
}
