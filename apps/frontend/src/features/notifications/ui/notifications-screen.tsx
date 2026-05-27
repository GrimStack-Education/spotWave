import { Bell, CalendarCheck, MessageCircle } from 'lucide-react';

const items = [
 { title: 'Новый отклик на событие', body: '3 человека присоединились к Board Games Night.', icon: Bell },
 { title: 'Напоминание о встрече', body: 'Sunset Rooftop Party начинается сегодня в 19:00.', icon: CalendarCheck },
 { title: 'Новое сообщение в чате', body: 'В чате Morning Run Circle появилось 5 новых сообщений.', icon: MessageCircle },
];

export function NotificationsScreen() {
 return (
 <div className="space-y-6">
 <div className="max-w-[860px]">
 <h1 className="text-[58px] leading-[0.96] tracking-[-0.07em] text-white md:text-[84px] xl:text-[96px]">
 Центр
 <br />
 обновлений
 </h1>
 <p className="mt-6 max-w-[620px] text-lg leading-8 text-white/72 md:text-xl">
 Только важные сигналы: отклики, напоминания и сообщения без шумных панелей.
 </p>
 </div>

 <div className="grid gap-3">
 {items.map((item) => {
 const Icon = item.icon;
 return (
 <div key={item.title} className="rounded-[24px] border border-white/10 bg-[#0b0b0b] p-5">
 <div className="flex items-start gap-4">
 <span className="grid h-12 w-12 place-items-center rounded-xl bg-[rgba(var(--sw-accent-3-rgb),0.14)] text-[var(--sw-accent-3)]">
 <Icon size={20} />
 </span>
 <div>
 <p className="text-2xl leading-tight text-white">{item.title}</p>
 <p className="mt-2 text-white/58">{item.body}</p>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
