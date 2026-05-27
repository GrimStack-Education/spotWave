'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { createEvent } from '@/features/events/api/events.api';
import { ErrorState } from '@/shared/ui/states/states';
import { UiButton } from '@/shared/ui/button/button';
import { UiInput } from '@/shared/ui/input/input';

export function CreateEventScreen() {
 const [title, setTitle] = useState('');
 const [datetime, setDatetime] = useState('');
 const [location, setLocation] = useState('');
 const [description, setDescription] = useState('');
 const [capacity, setCapacity] = useState('8');
 const [status, setStatus] = useState<string | null>(null);

 const submit = async () => {
 try {
 await createEvent({
 title: title || 'Новое событие SpotWave',
 startsAt: datetime ? new Date(datetime).toISOString() : new Date().toISOString(),
 description,
 capacity: Number(capacity) || 8,
 lat: 43.238949,
 lng: 76.889709,
 addressText: location || 'Алматы',
 });
 setStatus('Событие создано.');
 } catch {
 setStatus('Для публикации нужен токен авторизации и доступный backend.');
 }
 };

 return (
 <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
 <div className="rounded-[30px] border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
 <h1 className="text-[52px] leading-[0.95] tracking-[-0.06em] text-white md:text-[74px]">
 Создать
 <br />
 событие
 </h1>
 <p className="mt-4 max-w-2xl text-white/62">Одна понятная форма без лишних шагов.</p>

 {status ? <div className="mt-6"><ErrorState message={status} /></div> : null}

 <div className="mt-8 grid gap-4 md:grid-cols-2">
 <Field icon={<Calendar size={16} />} label="Название">
 <UiInput aria-label="title" placeholder="Sunset rooftop party" value={title} onChange={(e) => setTitle(e.target.value)} />
 </Field>
 <Field icon={<Calendar size={16} />} label="Дата и время">
 <UiInput aria-label="date" placeholder="2026-05-27T19:00" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
 </Field>
 <Field icon={<MapPin size={16} />} label="Локация">
 <UiInput aria-label="location" placeholder="The Nest Rooftop, Алматы" value={location} onChange={(e) => setLocation(e.target.value)} />
 </Field>
 <Field icon={<Users size={16} />} label="Лимит">
 <UiInput aria-label="limit" placeholder="8" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
 </Field>
 </div>

 <div className="mt-4">
 <Field icon={<Calendar size={16} />} label="Описание">
 <UiInput aria-label="description" placeholder="Коротко о формате и пользе" value={description} onChange={(e) => setDescription(e.target.value)} />
 </Field>
 </div>

 <UiButton className="mt-7 h-14 w-full md:w-auto" onPress={submit}>Опубликовать</UiButton>
 </div>

 <div className="rounded-[30px] border border-white/10 bg-[#0b0b0b] p-6">
 <div className="h-44 rounded-2xl bg-[#0f0f0f]" />
 <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[var(--sw-accent-3)]">Превью</p>
 <p className="mt-2 text-3xl leading-tight text-white">{title || 'Ваше следующее событие'}</p>
 <p className="mt-3 text-white/58">{location || 'Алматы'} · {capacity || 8} мест</p>
 <p className="mt-2 text-white/58">{description || 'Короткое описание события появится здесь.'}</p>
 </div>
 </div>
 );
}

function Field({ children, icon, label }: { children: ReactNode; icon: ReactNode; label: string }) {
 return (
 <label className="block space-y-2">
 <span className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">{icon}{label}</span>
 {children}
 </label>
 );
}
