import Link from 'next/link';
import { UiCard } from '@/shared/ui/card/card';

export default function TermsPage() {
  return (
    <main className="sw-bg min-h-screen px-4 py-10 text-white">
      <UiCard className="mx-auto max-w-3xl p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--sw-accent-3)]">SpotWave</p>
        <h1 className="mt-4 text-[44px] leading-[0.98] tracking-[-0.04em] md:text-6xl">
          Правила сервиса
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/62">
          Эти правила описывают базовые ожидания от участников и организаторов офлайн-встреч в
          SpotWave.
        </p>
        <div className="mt-8 grid gap-4">
          {[
            [
              'Участие',
              'Подавайте заявку только на встречи, куда действительно планируете прийти. Если планы изменились, отмените участие заранее.',
            ],
            [
              'Организация',
              'Создавайте события с понятным описанием, временем, местом и лимитом участников.',
            ],
            [
              'Безопасность',
              'Спам, вводящие в заблуждение события и небезопасное поведение могут быть отправлены на модерацию.',
            ],
          ].map(([title, text]) => (
            <section
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
            >
              <h2 className="text-xl tracking-[-0.03em]">{title}</h2>
              <p className="mt-2 leading-7 text-white/58">{text}</p>
            </section>
          ))}
        </div>
        <Link href="/start" className="mt-8 inline-block text-[var(--sw-accent-3)]">
          Вернуться на старт
        </Link>
      </UiCard>
    </main>
  );
}
