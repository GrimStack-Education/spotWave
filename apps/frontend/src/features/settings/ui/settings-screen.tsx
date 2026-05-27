import type { ReactNode } from 'react';
import { Switch } from '@heroui/react';
import { Bell, Lock, Mail } from 'lucide-react';
import { UiCard } from '@/shared/ui/card/card';

const notificationSettings = ['Email-уведомления', 'Напоминания о событиях', 'Еженедельная подборка'];
const privacySettings = ['Приватный профиль', 'Показывать онлайн-статус'];

export function SettingsScreen() {
 return (
 <div className="space-y-5">
 <h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Настройки</h1>
 <div className="grid gap-5 lg:grid-cols-2">
 <SettingsPanel icon={<Bell size={22} />} title="Уведомления" items={notificationSettings} />
 <SettingsPanel icon={<Lock size={22} />} title="Приватность" items={privacySettings} />
 </div>
 </div>
 );
}

function SettingsPanel({ icon, items, title }: { icon: ReactNode; items: string[]; title: string }) {
 return (
 <UiCard className="p-6">
 <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-3-rgb),0.16)] text-[var(--sw-accent-3)]">{icon}</span><h2 className="text-2xl tracking-[-0.04em]">{title}</h2></div>
 <div className="mt-6 space-y-4">
 {items.map((item, index) => <div key={item} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] p-4"><span className="flex items-center gap-2 text-white/78"><Mail size={16} className="text-white/36" />{item}</span><Switch defaultSelected={index !== items.length - 1} size="sm" /></div>)}
 </div>
 </UiCard>
 );
}
