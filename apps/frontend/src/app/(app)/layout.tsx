'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { me } from '@/features/auth/api/auth.api';
import { fetchOnboarding } from '@/features/onboarding/api/onboarding.api';
import { queryKeys } from '@/shared/lib/query/keys';
import { getAccessToken } from '@/shared/lib/auth/session';
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

  return <AppShell>{children}</AppShell>;
}
