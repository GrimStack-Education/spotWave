import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { events } from '@/shared/mocks/spotwave';

export function HomeFeedScreen() {
 const featured = events[0];

 return (
 <div className="space-y-6">
 <section className="grid items-end gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
 <div className="max-w-[900px]">
 <h1 className="text-[58px] leading-[0.96] tracking-[-0.07em] text-white md:text-[84px] xl:text-[96px]">
 События
 <br />
 рядом
 <br />
 и <span className="text-[var(--sw-accent-3)]">твои люди</span>
 </h1>
 <p className="mt-6 max-w-[640px] text-lg leading-8 text-white/72 md:text-xl">
 Лента живых встреч без информационного шума: понятные карточки, быстрый переход в детали и реальный отклик сообщества.
 </p>
 </div>

 <Link
 href={`/events/${featured.id}`}
 className="rounded-[30px] border border-white/10 bg-[#0b0b0b] p-6 transition hover:border-[rgba(var(--sw-accent-3-rgb),0.35)] md:p-8"
 >
 <p className="text-xs uppercase tracking-[0.14em] text-[var(--sw-accent-3)]">Главное событие</p>
 <h2 className="mt-3 text-[42px] leading-[0.95] tracking-[-0.06em] text-white">{featured.title}</h2>
 <p className="mt-4 flex items-center gap-2 text-white/62"><MapPin size={16} /> {featured.location}</p>
 <p className="mt-2 text-white/62">{featured.datetime} · {featured.rsvpCount}/{featured.capacity}</p>
 <span className="mt-6 inline-flex items-center gap-2 text-[var(--sw-accent-3)]">Открыть <ArrowRight size={16} /></span>
 </Link>
 </section>

 <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
 {events.map((event) => (
 <Link
 key={event.id}
 href={`/events/${event.id}`}
 className="rounded-[24px] border border-white/10 bg-[#0b0b0b] p-4 transition hover:border-[rgba(var(--sw-accent-3-rgb),0.35)]"
 >
 <div className="h-32 rounded-2xl bg-[#0f0f0f]" />
 <p className="mt-4 text-xs uppercase tracking-[0.12em] text-[var(--sw-accent-3)]">{event.category}</p>
 <p className="mt-2 text-2xl leading-tight text-white">{event.title}</p>
 <p className="mt-2 text-sm text-white/52">{event.location}</p>
 <p className="mt-1 text-sm text-white/52">{event.datetime}</p>
 </Link>
 ))}
 </section>
 </div>
 );
}
