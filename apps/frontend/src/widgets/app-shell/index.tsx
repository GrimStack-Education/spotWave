'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Compass, Home, LogOut, PlusSquare, ShieldCheck, User, Users } from 'lucide-react';
import { fetchNotifications } from '@/features/notifications/api/notifications.api';
import { clearAccessToken } from '@/shared/lib/auth/session';
import { queryKeys } from '@/shared/lib/query/keys';

const nav = [
  { href: '/home', label: 'Лента', icon: Home },
  { href: '/map', label: 'Карта', icon: Compass },
  { href: '/communities', label: 'Сообщества', icon: Users },
  { href: '/create-event', label: 'Создать', icon: PlusSquare },
  { href: '/verification', label: 'Доверие', icon: ShieldCheck },
  { href: '/profile', label: 'Профиль', icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotifications,
    staleTime: 30_000,
  });
  const unreadCount =
    notificationsQuery.data?.items.filter((item) => item.readAt === null).length ?? 0;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(var(--sw-accent-2-rgb),0.13),transparent_28%),linear-gradient(180deg,#161616_0%,#0e0e0e_100%)] px-3 py-3 text-white md:px-8 md:py-8">
      <section className="relative mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1460px] overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(18,18,18,0.92)] px-4 py-5 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur md:min-h-[calc(100vh-4rem)] md:rounded-[34px] md:px-10 md:py-10 xl:px-14 xl:py-12">
        <div className="pointer-events-none absolute -left-28 top-24 hidden size-72 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.08)] blur-3xl md:block" />
        <div className="pointer-events-none absolute -right-32 top-1/3 hidden size-96 rounded-full bg-white/[0.035] blur-3xl md:block" />

        <header className="relative grid gap-3 border-b border-white/10 pb-4 md:flex md:flex-wrap md:items-center md:justify-between md:gap-4 md:pb-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/home"
              className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-[var(--sw-brand-capsule)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:gap-3 md:px-5 md:py-3"
            >
              <Image
                src="/brand/spotwave-logo.png"
                alt="SpotWave"
                width={38}
                height={38}
                priority
                unoptimized
                className="md:h-[42px] md:w-[42px]"
              />
              <span className="text-[24px] tracking-[-0.04em] md:text-[30px]">
                Spot<span className="text-[var(--sw-accent-3)]">Wave</span>
              </span>
            </Link>

            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/notifications"
                className="relative rounded-full border border-white/12 p-3 text-white/74 transition hover:border-white/24 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.45)]"
                aria-label="Уведомления"
              >
                <Bell size={18} />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sw-accent-3)] px-1 text-[10px] text-white shadow-[0_0_18px_rgba(var(--sw-accent-2-rgb),0.45)]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </Link>
              <button
                className="rounded-full border border-white/12 p-3 text-white/74 transition hover:border-white/24 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.45)]"
                onClick={() => {
                  clearAccessToken();
                  router.push('/sign-in');
                }}
                type="button"
                aria-label="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <nav
            aria-label="Основная навигация"
            className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:items-center md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.45)] md:px-4',
                    active
                      ? 'border-[rgba(var(--sw-accent-2-rgb),0.42)] bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-1)] shadow-[0_0_0_1px_rgba(var(--sw-accent-2-rgb),0.16)]'
                      : 'border-white/12 text-white/70 hover:border-white/24 hover:bg-white/[0.04] hover:text-white',
                  ].join(' ')}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/notifications"
              className="relative rounded-full border border-white/12 px-4 py-2 text-white/74 transition hover:border-white/24 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.45)]"
              aria-label="Уведомления"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sw-accent-3)] px-1 text-[10px] text-white shadow-[0_0_18px_rgba(var(--sw-accent-2-rgb),0.45)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm text-white/74 transition hover:border-white/24 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.45)]"
              onClick={() => {
                clearAccessToken();
                router.push('/sign-in');
              }}
              type="button"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </header>

        <div className="relative min-w-0 pt-6 md:pt-8">{children}</div>
      </section>
    </main>
  );
}
