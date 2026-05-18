import { Avatar, Button, Card, CardFooter, Chip, Input, Link } from '@heroui/react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_35%),linear-gradient(180deg,#0b1020_0%,#050816_100%)] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-14 sm:px-10 lg:px-12">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Chip color="accent" variant="secondary" className="tracking-wide">
              HeroUI v3 on Next.js 16
            </Chip>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Маршрут в интерфейс без костылей: HeroUI уже подключён и работает.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Тут уже не starter-страница, а реальный экран с компонентами HeroUI, Tailwind v4 и
                аккуратной визуальной иерархией. Ниже видно, что кнопки, инпуты, карточки и бейджи
                рендерятся из библиотеки.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="primary">
                Открыть каталог
              </Button>
              <Button size="lg" variant="outline" className="text-white">
                Посмотреть документацию
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border border-white/10 bg-white/5 p-4 text-white shadow-2xl shadow-black/20 backdrop-blur">
                <p className="text-sm text-slate-400">Статус</p>
                <p className="mt-2 text-xl font-semibold">HeroUI active</p>
              </Card>
              <Card className="border border-white/10 bg-white/5 p-4 text-white shadow-2xl shadow-black/20 backdrop-blur">
                <p className="text-sm text-slate-400">UI kit</p>
                <p className="mt-2 text-xl font-semibold">Button, Card, Input</p>
              </Card>
              <Card className="border border-white/10 bg-white/5 p-4 text-white shadow-2xl shadow-black/20 backdrop-blur">
                <p className="text-sm text-slate-400">Styling</p>
                <p className="mt-2 text-xl font-semibold">Tailwind v4 + CSS</p>
              </Card>
            </div>
          </div>

          <Card className="border border-white/10 bg-slate-950/70 p-6 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Live preview</p>
                <h2 className="mt-1 text-2xl font-semibold">HeroUI demo card</h2>
              </div>
              <Avatar className="bg-primary-500 text-white">SW</Avatar>
            </div>

            <div className="mt-6 space-y-4">
              <div className="mt-2">
                <label className="block text-sm text-slate-300 mb-2">Поиск трека</label>
                <Input
                  placeholder="Например: lo-fi night drive"
                  variant="primary"
                  className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="border border-white/10 bg-white/5 p-4 text-white">
                  <p className="text-sm text-slate-400">Top chart</p>
                  <p className="mt-2 text-lg font-semibold">Indie Hackers</p>
                  <p className="mt-1 text-sm text-slate-300">148 members · updated 2h ago</p>
                </Card>
                <Card className="border border-white/10 bg-white/5 p-4 text-white">
                  <p className="text-sm text-slate-400">Trending</p>
                  <p className="mt-2 text-lg font-semibold">AI Builders</p>
                  <p className="mt-1 text-sm text-slate-300">362 members · updated 5m ago</p>
                </Card>
              </div>
            </div>

            <CardFooter className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 px-0 pt-5">
              <p className="text-sm text-slate-400">
                Проверка стилей и компонентов проходит прямо на этой странице.
              </p>
              <Link
                href="https://heroui.com/docs/react/components"
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-primary-300"
              >
                Открыть компоненты
              </Link>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
}
