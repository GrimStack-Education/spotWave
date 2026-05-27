import { ShieldCheck, Star, UserCheck } from 'lucide-react';
import { trust } from '@/shared/mocks/spotwave';

const levels = ['12+', '18+', '25+'];

export function VerificationScreen() {
 return (
 <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
 <div className="rounded-[30px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 md:p-8">
 <h1 className="text-[58px] leading-[0.96] tracking-[-0.07em] text-white md:text-[84px] xl:text-[96px]">
 Уровень
 <br />
 доверия
 </h1>
 <p className="mt-6 max-w-[620px] text-lg leading-8 text-white/72 md:text-xl">
 Подтвердите профиль и получайте доступ к событиям с более высоким порогом доверия.
 </p>

 <div className="mt-8 grid gap-3 sm:grid-cols-3">
 {levels.map((level) => (
 <div
 key={level}
 className={[
 'rounded-2xl border p-4 text-center',
 level === trust.verificationLevel
 ? 'border-[rgba(var(--sw-accent-2-rgb),0.35)] bg-[rgba(var(--sw-accent-4-rgb),0.10)] text-[var(--sw-accent-3)]'
 : 'border-white/10 bg-[#101010] text-white/78',
 ].join(' ')}
 >
 <p className="text-3xl">{level}</p>
 <p className="mt-1 text-sm text-white/52">Уровень</p>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-4">
 <Metric icon={<ShieldCheck size={18} />} value={trust.verificationLevel} label="Проверка" />
 <Metric icon={<Star size={18} />} value={String(trust.rating)} label="Рейтинг" />
 <Metric icon={<UserCheck size={18} />} value={String(trust.reviewsCount)} label="Отзывы" />
 </div>
 </div>
 );
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
 return (
 <div className="rounded-[24px] border border-white/10 bg-[var(--sw-neutral-800)] p-5">
 <div className="flex items-center gap-3 text-[var(--sw-accent-3)]">{icon}<span className="text-sm uppercase tracking-[0.12em]">{label}</span></div>
 <p className="mt-3 text-4xl text-white">{value}</p>
 </div>
 );
}
