'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Bell, Compass, Home, LogOut, PlusSquare, ShieldCheck, User } from 'lucide-react';
import { clearAccessToken } from '@/shared/lib/auth/session';

const nav = [
  { href: '/home', label: 'Лента', icon: Home },
  { href: '/map', label: 'Карта', icon: Compass },
  { href: '/create-event', label: 'Создать', icon: PlusSquare },
  { href: '/verification', label: 'Доверие', icon: ShieldCheck },
  { href: '/profile', label: 'Профиль', icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(var(--sw-accent-2-rgb),0.13),transparent_28%),linear-gradient(180deg,#161616_0%,#0e0e0e_100%)] px-4 py-5 text-white md:px-8 md:py-8">
      <section className="relative mx-auto min-h-[calc(100vh-2.5rem)] max-w-[1460px] overflow-hidden rounded-[34px] border border-white/10 bg-[rgba(18,18,18,0.92)] px-5 py-6 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur md:px-10 md:py-10 xl:px-14 xl:py-12">
        <div className="pointer-events-none absolute -left-28 top-24 size-72 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.08)] blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-1/3 size-96 rounded-full bg-white/[0.035] blur-3xl" />

        <header className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link href="/home" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[var(--sw-brand-capsule)] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:px-5 md:py-3">
            <Image src="/brand/spotwave-logo.png" alt="SpotWave" width={42} height={42} priority unoptimized />
            <span className="text-[28px] tracking-[-0.04em] md:text-[30px]">Spot<span className="text-[var(--sw-accent-3)]">Wave</span></span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.45)]',
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

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative rounded-full border border-white/12 px-4 py-2 text-white/74 transition hover:border-white/24 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.45)]"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--sw-accent-3)] text-[10px] text-white shadow-[0_0_18px_rgba(var(--sw-accent-2-rgb),0.45)]">3</span>
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

        <div className="relative pt-8">{children}</div>
      </section>
    </main>
  );
}
