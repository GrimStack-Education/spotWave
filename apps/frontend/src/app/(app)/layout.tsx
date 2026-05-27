'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { me } from '@/features/auth/api/auth.api';
import { clearAccessToken, getAccessToken } from '@/shared/lib/auth/session';
import { LoadingState } from '@/shared/ui/states/states';
import { AppShell } from '@/widgets/app-shell';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
 const router = useRouter();
 const [checking, setChecking] = useState(true);

 useEffect(() => {
 const token = getAccessToken();
 if (!token) {
 setChecking(false);
 router.replace('/sign-in');
 return;
 }

 me()
 .catch(() => {
 clearAccessToken();
 router.replace('/sign-in');
 })
 .finally(() => setChecking(false));
 }, [router]);

 if (checking) return <div className="p-6"><LoadingState /></div>;

 return <AppShell>{children}</AppShell>;
}
