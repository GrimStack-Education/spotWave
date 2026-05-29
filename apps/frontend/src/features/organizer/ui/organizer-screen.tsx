import { CalendarCheck2, MessageCircle, Star, UserPlus } from 'lucide-react';
import { UiCard } from '@/shared/ui/card/card';

const stats = [
 { label: 'Активные события', value: '12', icon: CalendarCheck2 },
 { label: 'Новые участники', value: '47', icon: UserPlus },
 { label: 'Средний рейтинг', value: '4.8', icon: Star },
];

export function OrganizerScreen() {
 return (
 <div className="min-w-0 space-y-6">
 <div className="max-w-[860px]">
 <h1 className="text-[44px] leading-[0.98] tracking-[-0.04em] text-white md:text-[84px] md:tracking-[-0.07em] xl:text-[96px]">
 Кабинет
 <br />
 организатора
 </h1>
 <p className="mt-5 max-w-[620px] text-lg leading-8 text-white/62 md:text-xl">
 Быстрая сводка для ведущего: активность, заявки, качество встреч и ближайшие действия.
 </p>
 </div>

 <div className="grid gap-3 md:grid-cols-3">
 {stats.map((stat) => (
 <UiCard key={stat.label} className="p-5">
 <div className="flex items-center justify-between gap-3">
  <p className="text-xs uppercase tracking-[0.12em] text-white/52">{stat.label}</p>
  <stat.icon size={18} className="text-[var(--sw-accent-3)]" />
 </div>
 <p className="mt-3 text-5xl leading-none tracking-[-0.05em] text-[var(--sw-accent-3)]">{stat.value}</p>
 </UiCard>
 ))}
 </div>

 <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
  <UiCard className="p-5 md:p-6">
   <h2 className="text-3xl tracking-[-0.05em]">Ближайшие действия</h2>
   <div className="mt-5 grid gap-3">
    {[
     'Проверьте заявки перед подтверждением места.',
     'Напишите участникам точку сбора в чате события.',
     'После встречи соберите отзывы и отметки check-in.',
    ].map((item) => (
     <p key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-white/64">{item}</p>
    ))}
   </div>
  </UiCard>
  <UiCard className="p-5 md:p-6">
   <h2 className="flex items-center gap-2 text-3xl tracking-[-0.05em]">
    <MessageCircle size={24} className="text-[var(--sw-accent-3)]" /> Коммуникация
   </h2>
   <p className="mt-4 leading-7 text-white/58">
    Для демо этот раздел показывает, какие сигналы должен видеть организатор: заявки, сообщения, рейтинг и реальные посещения.
   </p>
  </UiCard>
 </div>
 </div>
 );
}
