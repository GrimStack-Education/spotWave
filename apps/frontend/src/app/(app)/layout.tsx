'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { me } from '@/features/auth/api/auth.api';
import { fetchOnboarding } from '@/features/onboarding/api/onboarding.api';
import { queryKeys } from '@/shared/lib/query/keys';
import { clearAccessToken, getAccessToken } from '@/shared/lib/auth/session';
import { LoadingState } from '@/shared/ui/states/states';
import { AppShell } from '@/widgets/app-shell';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getAccessToken();

  const meQuery = useQuery({ queryKey: queryKeys.me, queryFn: me, enabled: !!token });
  const onboardingQuery = useQuery({
    queryKey: queryKeys.onboarding,
    queryFn: fetchOnboarding,
    enabled: !!meQuery.data,
  });

  useEffect(() => {
    if (!token) {
      router.replace('/sign-in');
      return;
    }

    if (meQuery.isError) {
      router.replace('/sign-in');
      return;
    }

    const completed = onboardingQuery.data?.completed;

    if (completed && pathname === '/onboarding') {
      router.replace('/home');
    }

    if (completed === false && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [token, meQuery.isError, onboardingQuery.data?.completed, pathname, router]);

  if (!token || meQuery.isLoading || (meQuery.isSuccess && onboardingQuery.isLoading)) {
    return <div className="p-6"><LoadingState /></div>;
  }

  if (pathname === '/onboarding') {
    return (
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(var(--sw-accent-2-rgb),0.13),transparent_28%),linear-gradient(180deg,#161616_0%,#0e0e0e_100%)] px-3 py-3 text-white md:px-8 md:py-8">
        <section className="relative mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1180px] overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(18,18,18,0.92)] px-4 py-5 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur md:min-h-[calc(100vh-4rem)] md:rounded-[34px] md:px-10 md:py-10 xl:px-14 xl:py-12">
          <div className="pointer-events-none absolute -left-28 top-24 hidden size-72 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.08)] blur-3xl md:block" />
          <div className="pointer-events-none absolute -right-32 top-1/3 hidden size-96 rounded-full bg-white/[0.035] blur-3xl md:block" />

          <header className="relative flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between md:pb-6">
            <div className="min-w-0">
              <Link href="/onboarding" className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-[var(--sw-brand-capsule)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:gap-3 md:px-5 md:py-3">
                <Image src="/brand/spotwave-logo.png" alt="SpotWave" width={38} height={38} priority unoptimized className="md:h-[42px] md:w-[42px]" />
                <span className="text-[24px] tracking-[-0.04em] md:text-[30px]">Spot<span className="text-[var(--sw-accent-3)]">Wave</span></span>
              </Link>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/56 md:text-base">
                Завершите этот обязательный шаг один раз. После сохранения интересов и радиуса откроется основная навигация приложения.
              </p>
            </div>

            <button
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/12 px-4 py-2 text-sm text-white/74 transition hover:border-white/24 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.45)]"
              onClick={() => {
                clearAccessToken();
                router.push('/sign-in');
              }}
              type="button"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </header>

          <div className="relative pt-6 md:pt-8">{children}</div>
        </section>
      </main>
    );
  }

  return <AppShell>{children}</AppShell>;
}
