import { Calendar, MapPin, Star } from 'lucide-react';
import { trust } from '@/shared/mocks/spotwave';
import { UiAvatar } from '@/shared/ui/avatar/avatar';

export function ProfileScreen() {
 return (
 <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
 <div className="rounded-[30px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 md:p-8">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div className="flex items-start gap-4">
 <UiAvatar label="Alex Carter" className="h-24 w-24 rounded-[28px] text-2xl" />
 <div>
 <h1 className="text-[52px] leading-[0.95] tracking-[-0.06em] text-white md:text-[64px]">Alex Carter</h1>
 <p className="mt-2 flex items-center gap-2 text-white/58"><MapPin size={16} /> Product Manager, Алматы</p>
 </div>
 </div>
 </div>

 <div className="mt-8 flex flex-wrap gap-2">
 {['Дизайн', 'Бег', 'Стартапы'].map((tag) => (
 <span key={tag} className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/74">{tag}</span>
 ))}
 </div>

 <p className="mt-8 max-w-3xl text-lg leading-8 text-white/64">
 Ищу небольшие качественные события и реальные сообщества, где люди приходят не ради шума, а ради ценного общения.
 </p>
 </div>

 <div className="space-y-4">
 <div className="rounded-[26px] border border-white/10 bg-[var(--sw-neutral-800)] p-6">
 <h2 className="text-3xl leading-tight text-white">Индекс доверия</h2>
 <div className="mt-5 grid grid-cols-3 gap-3 text-center">
 <Metric value={String(trust.rating)} label="Рейтинг" />
 <Metric value={String(trust.reviewsCount)} label="Отзывы" />
 <Metric value={trust.verificationLevel} label="Проверка" />
 </div>
 </div>

 <div className="rounded-[26px] border border-white/10 bg-[var(--sw-neutral-800)] p-6">
 <h2 className="text-3xl leading-tight text-white">Активность</h2>
 <ul className="mt-4 space-y-3 text-white/64">
 <li className="flex gap-3"><Calendar className="text-[var(--sw-accent-3)]" size={18} /> Присоединился к Product Design Meetup</li>
 <li className="flex gap-3"><Star className="text-[var(--sw-accent-3)]" size={18} /> Сохранил 3 события за неделю</li>
 <li className="flex gap-3"><MapPin className="text-[var(--sw-accent-3)]" size={18} /> Подписался на City Nightlife</li>
 </ul>
 </div>
 </div>
 </div>
 );
}

function Metric({ value, label }: { value: string; label: string }) {
 return <div className="rounded-2xl border border-white/10 bg-[#101010] p-4"><p className="text-3xl text-white">{value}</p><p className="text-sm text-white/48">{label}</p></div>;
}
