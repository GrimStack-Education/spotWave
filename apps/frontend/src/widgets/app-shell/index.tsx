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
 <main className="min-h-screen overflow-hidden bg-[#050505] px-4 py-5 text-white md:px-8 md:py-8">
 <section className="relative mx-auto min-h-[calc(100vh-2.5rem)] max-w-[1460px] overflow-hidden rounded-[34px] border border-white/10 bg-[#050505] px-6 py-7 md:px-10 md:py-10 xl:px-14 xl:py-12">
 <header className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
 <Link href="/home" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#090909] px-5 py-3">
 <Image src="/brand/spotwave-logo.png" alt="SpotWave" width={42} height={42} priority />
 <span className="text-[30px] tracking-[-0.04em]">Spot<span className="text-[var(--sw-accent-3)]">Wave</span></span>
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
 'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition',
 active
 ? 'border-[rgba(var(--sw-accent-3-rgb),0.35)] bg-[rgba(var(--sw-accent-3-rgb),0.12)] text-[var(--sw-accent-3)]'
 : 'border-white/12 text-white/70 hover:border-white/24 hover:text-white',
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
 className="relative rounded-full border border-white/12 px-4 py-2 text-white/74 transition hover:text-white"
 >
 <Bell size={18} />
 <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--sw-accent-3)] text-[10px] text-white">3</span>
 </Link>
 <button
 className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm text-white/74 transition hover:text-white"
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
