const stats = [
 { label: 'Активные события', value: '12' },
 { label: 'Новые участники', value: '47' },
 { label: 'Средний рейтинг', value: '4.8' },
];

export function OrganizerScreen() {
 return (
 <div className="space-y-6">
 <div className="max-w-[860px]">
 <h1 className="text-[58px] leading-[0.96] tracking-[-0.07em] text-white md:text-[84px] xl:text-[96px]">
 Кабинет
 <br />
 организатора
 </h1>
 <p className="mt-6 max-w-[620px] text-lg leading-8 text-white/72 md:text-xl">
 Сводка по событиям и участникам в компактном формате без лишнего интерфейсного хрома.
 </p>
 </div>

 <div className="grid gap-3 md:grid-cols-3">
 {stats.map((stat) => (
 <div key={stat.label} className="rounded-[24px] border border-white/10 bg-[#0b0b0b] p-5">
 <p className="text-xs uppercase tracking-[0.12em] text-white/52">{stat.label}</p>
 <p className="mt-3 text-5xl leading-none text-[var(--sw-accent-3)]">{stat.value}</p>
 </div>
 ))}
 </div>
 </div>
 );
}
