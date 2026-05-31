import Link from 'next/link';
import { UiCard } from '@/shared/ui/card/card';

export default function PrivacyPage() {
  return (
    <main className="sw-bg min-h-screen px-4 py-10 text-white">
      <UiCard className="mx-auto max-w-3xl p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.14em] text-brand">SpotWave</p>
        <h1 className="mt-4 text-[44px] leading-[0.98] tracking-[-0.04em] md:text-6xl">
          Приватность
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/62">
          SpotWave использует профиль, интересы и примерную геопозицию, чтобы показывать релевантные
          события рядом и помогать организаторам управлять встречами.
        </p>
        <div className="mt-8 grid gap-4">
          {[
            [
              'Геолокация',
              'Координаты нужны для поиска событий поблизости. Пользователь может указать их вручную или через браузер.',
            ],
            [
              'Профиль',
              'Имя, интересы и радиус поиска помогают другим участникам понять контекст встречи.',
            ],
            [
              'Доверие',
              'Отзывы, check-in и жалобы используются для модерации и безопасного офлайн-опыта.',
            ],
          ].map(([title, text]) => (
            <section key={title} className="rounded-2xl border border-white/10 bg-white/3.5 p-5">
              <h2 className="text-xl tracking-[-0.03em]">{title}</h2>
              <p className="mt-2 leading-7 text-white/58">{text}</p>
            </section>
          ))}
        </div>
        <Link href="/start" className="mt-8 inline-block text-brand">
          Вернуться на старт
        </Link>
      </UiCard>
    </main>
  );
}
