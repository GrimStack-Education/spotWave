import Image from 'next/image';
import type { ReactNode } from 'react';
import { UiCard } from '@/shared/ui/card/card';

export function PublicShell({
  title,
  subtitle,
  children,
  topBadge = 'EARLY ACCESS',
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  topBadge?: string;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)] px-4 py-5 text-white md:px-8 md:py-8">
      <section className="relative mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1460px] items-center gap-10 overflow-hidden rounded-[34px] border border-white/10 bg-[var(--background)] px-6 py-7 md:px-10 md:py-10 xl:grid-cols-[minmax(0,1fr)_560px] xl:px-14 xl:py-12">
        <div className="relative hidden max-w-[860px] lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[var(--sw-brand-capsule)] px-5 py-3">
            <Image
              src="/brand/spotwave-logo.png"
              alt="SpotWave"
              width={46}
              height={46}
              priority
              unoptimized
            />
            <span className="text-[30px]">
              Spot<span className="text-[var(--sw-accent-3)]">Wave</span>
            </span>
          </div>
          <h1 className="mt-12 text-[58px] leading-[0.98] tracking-[-0.07em] text-white md:text-[84px] xl:text-[96px]">
            События
            <br />
            рядом
            <br />и <span className="text-[var(--sw-accent-3)]">твои люди</span>
          </h1>
          <p className="mt-6 max-w-[620px] text-lg leading-8 text-white/72 md:text-xl">
            Локальные события, живые сообщества и встречи рядом в одном аккуратном продукте без
            лишнего интерфейсного шума.
          </p>
        </div>

        <UiCard className="relative mx-auto w-full max-w-[560px] rounded-[30px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 shadow-none md:p-8">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/spotwave-logo.png"
                alt="SpotWave"
                width={46}
                height={46}
                priority
                unoptimized
              />
              <span className="text-[32px] tracking-[-0.04em]">
                Spot<span className="text-[var(--sw-accent-3)]">Wave</span>
              </span>
            </div>
            <span className="text-sm uppercase tracking-[0.12em] text-white/54">{topBadge}</span>
          </div>

          <div className="mt-10">
            <h2 className="max-w-[520px] text-[42px] leading-[0.96] tracking-[-0.06em] text-white md:text-[56px]">
              {title}
            </h2>
            <p className="mt-4 max-w-[510px] text-lg leading-8 text-white/62">{subtitle}</p>
            <div className="mt-10 flex flex-col gap-5">{children}</div>
          </div>
        </UiCard>
      </section>
    </main>
  );
}
