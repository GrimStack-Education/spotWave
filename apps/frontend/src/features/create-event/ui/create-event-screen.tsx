'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Calendar, CheckCircle2, MapPin, Sparkles, Users } from 'lucide-react';
import { createEvent } from '@/features/events/api/events.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { toErrorMessage } from '@/shared/lib/api/error';
import { ErrorState } from '@/shared/ui/states/states';
import { UiBadge } from '@/shared/ui/badge/badge';
import { UiButton } from '@/shared/ui/button/button';
import { UiInput } from '@/shared/ui/input/input';
import { CoverImage } from '@/shared/ui/media/cover-image';

export function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('8');
  const [status, setStatus] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: async () => {
      setStatus('Событие создано.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.events('home') });
      await queryClient.invalidateQueries({ queryKey: queryKeys.events('map') });
    },
    onError: (e) => setStatus(toErrorMessage(e)),
  });

  const submit = async () => {
    if (!title || !datetime || !location) {
      setStatus('Заполните название, дату и локацию');
      return;
    }

    mutation.mutate({
      title,
      startsAt: new Date(datetime).toISOString(),
      description,
      capacity: Number(capacity) || 8,
      lat: 43.238949,
      lng: 76.889709,
      addressText: location,
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 md:p-8">
        <div className="pointer-events-none absolute -right-24 top-10 size-64 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.12)] blur-3xl" />
        <UiBadge className="border-[rgba(var(--sw-accent-2-rgb),0.28)] bg-[rgba(var(--sw-accent-4-rgb),0.14)] text-[var(--sw-accent-3)]">
          <Sparkles size={13} /> Конструктор
        </UiBadge>
        <h1 className="relative mt-5 text-[52px] leading-[0.95] tracking-[-0.06em] text-white md:text-[74px]">Создать событие</h1>
        <p className="relative mt-4 max-w-2xl text-white/58">Форма стала плотнее и понятнее: основные поля, подсказки и live preview живут в одном визуальном ритме.</p>

        {status ? <div className="mt-6"><ErrorState message={status} /></div> : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Field icon={<Calendar size={16} />} label="Название">
            <UiInput aria-label="title" placeholder="Sunset rooftop party" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field icon={<Calendar size={16} />} label="Дата и время">
            <UiInput aria-label="date" type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
          </Field>
          <Field icon={<MapPin size={16} />} label="Локация">
            <UiInput aria-label="location" placeholder="The Nest Rooftop, Алматы" value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field icon={<Users size={16} />} label="Лимит">
            <UiInput aria-label="limit" type="number" min="1" placeholder="8" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </Field>
        </div>

        <label className="mt-4 block">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58"><Calendar size={16} />Описание</span>
          <textarea
            aria-label="description"
            className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white placeholder:text-white/34 transition focus-visible:border-[rgba(var(--sw-accent-2-rgb),0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.22)]"
            placeholder="Коротко о формате, тайминге и кому подойдет встреча"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <UiButton className="h-14 w-full md:w-auto" onPress={submit} isDisabled={mutation.isPending}>
            {mutation.isPending ? 'Публикуем...' : 'Опубликовать'}
          </UiButton>
          <span className="text-sm text-white/46">Публикация обновит ленту и карту.</span>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[30px] border border-white/10 bg-[var(--sw-neutral-800)] p-6">
          <CoverImage className="h-48" seed={title || location || 'create-event'} priority alt="Event preview" />
          <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[var(--sw-accent-3)]">Превью</p>
          <p className="mt-2 text-3xl leading-tight tracking-[-0.045em] text-white">{title || 'Ваше следующее событие'}</p>
          <p className="mt-3 text-white/58">{location || 'Алматы'} · {capacity || 8} мест</p>
          <p className="mt-2 text-white/58">{description || 'Короткое описание события появится здесь.'}</p>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#101010] p-6">
          <h2 className="text-2xl tracking-[-0.04em]">Чеклист качества</h2>
          <div className="mt-4 grid gap-3">
            <Tip ready={Boolean(title)} text="Название объясняет формат" />
            <Tip ready={Boolean(datetime)} text="Дата и время указаны" />
            <Tip ready={Boolean(location)} text="Локация понятна участникам" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ children, icon, label }: { children: ReactNode; icon: ReactNode; label: string }) {
  return <label className="block"><span className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">{icon}{label}</span><span className="mt-2 block">{children}</span></label>;
}

function Tip({ ready, text }: { ready: boolean; text: string }) {
  return <p className={['flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition', ready ? 'border-[rgba(var(--sw-accent-2-rgb),0.34)] bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-1)]' : 'border-white/10 bg-white/[0.04] text-white/52'].join(' ')}><CheckCircle2 size={16} />{text}</p>;
}
