'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import { Calendar, CheckCircle2, LocateFixed, MapPin, Search, Tags, Users } from 'lucide-react';
import { createEvent } from '@/features/events/api/events.api';
import { fetchTags } from '@/features/tags/api/tags.api';
import { toRussianInterestLabel } from '@/shared/lib/i18n/interests';
import { ALMATY_CENTER, OSM_STYLE } from '@/shared/lib/map/osm';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { toErrorMessage } from '@/shared/lib/api/error';
import { ErrorState, SuccessState } from '@/shared/ui/states/states';
import { UiButton } from '@/shared/ui/button/button';
import { UiInput } from '@/shared/ui/input/input';
import { CoverImage } from '@/shared/ui/media/cover-image';

function stripGeneratedTagSuffix(name: string) {
  return name.replace(/\s+\d{10,}$/, '');
}

export function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('8');
  const [lat, setLat] = useState(ALMATY_CENTER.lat.toFixed(6));
  const [lng, setLng] = useState(ALMATY_CENTER.lng.toFixed(6));
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [status, setStatus] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);

  const tagsQuery = useQuery({ queryKey: queryKeys.tags, queryFn: fetchTags });

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: async () => {
      setStatus({ tone: 'success', message: 'Событие создано.' });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (e) => setStatus({ tone: 'error', message: toErrorMessage(e) }),
  });

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus({
        tone: 'error',
        message: 'Геолокация недоступна. Выберите место кликом на карте.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setIsLocating(false);
        setStatus({ tone: 'success', message: 'Геопозиция добавлена к событию.' });
      },
      () => {
        setIsLocating(false);
        setStatus({
          tone: 'error',
          message: 'Не удалось получить геопозицию. Выберите место кликом на карте.',
        });
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  const submit = async () => {
    if (!title || !datetime || !location) {
      setStatus({ tone: 'error', message: 'Заполните название, дату и локацию' });
      return;
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
      setStatus({ tone: 'error', message: 'Проверьте координаты события' });
      return;
    }

    mutation.mutate({
      title,
      startsAt: new Date(datetime).toISOString(),
      description,
      capacity: Number(capacity) || 8,
      lat: parsedLat,
      lng: parsedLng,
      addressText: location,
      tagIds: selectedTagIds,
    });
  };

  const availableTags = tagsQuery.data ?? [];
  const canonicalTagNames = new Set(
    availableTags
      .filter((tag) => stripGeneratedTagSuffix(tag.name) === tag.name)
      .map((tag) => tag.name.toLowerCase()),
  );
  const displayableTags = availableTags
    .filter((tag) => {
      const baseName = stripGeneratedTagSuffix(tag.name).toLowerCase();
      return baseName === tag.name.toLowerCase() || !canonicalTagNames.has(baseName);
    })
    .toSorted(
      (left, right) => left.name.length - right.name.length || left.name.localeCompare(right.name),
    );
  const normalizedTagSearch = tagSearch.trim().toLowerCase();
  const visibleTags = normalizedTagSearch
    ? displayableTags.filter((tag) => {
        const label = toRussianInterestLabel(tag.name, tag.slug).toLowerCase();
        return (
          label.includes(normalizedTagSearch) ||
          tag.name.toLowerCase().includes(normalizedTagSearch)
        );
      })
    : displayableTags;
  const shownTags = visibleTags.slice(0, 18);

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="relative min-w-0 overflow-hidden rounded-[26px] border border-white/10 bg-[var(--sw-neutral-800)] p-5 md:rounded-[34px] md:p-8">
        <div className="pointer-events-none absolute -right-24 top-10 hidden size-64 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.12)] blur-3xl md:block" />
        <h1 className="relative text-[44px] leading-[0.98] tracking-[-0.04em] text-white md:text-[74px] md:tracking-[-0.06em]">
          Создать событие
        </h1>
        <p className="relative mt-4 max-w-2xl text-white/58">
          Соберите встречу по интересам, отметьте место на карте и добавьте темы, чтобы участникам
          было проще найти событие.
        </p>

        {status ? (
          <div className="mt-6">
            {status.tone === 'success' ? (
              <SuccessState message={status.message} />
            ) : (
              <ErrorState message={status.message} />
            )}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Field icon={<Calendar size={16} />} label="Название">
            <UiInput
              aria-label="title"
              placeholder="Sunset rooftop party"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field icon={<Calendar size={16} />} label="Дата и время">
            <UiInput
              aria-label="date"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
            />
          </Field>
          <Field icon={<MapPin size={16} />} label="Локация">
            <UiInput
              aria-label="location"
              placeholder="The Nest Rooftop, Алматы"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>
          <Field icon={<Users size={16} />} label="Лимит">
            <UiInput
              aria-label="limit"
              type="number"
              min="1"
              placeholder="8"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-5 rounded-[26px] border border-white/10 bg-[#101010] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">
                <MapPin size={16} />
                Место на карте
              </h2>
              <p className="mt-1 text-sm text-white/44">Кликните по карте или перетащите маркер.</p>
            </div>
            <UiButton className="h-11" isDisabled={isLocating} onPress={locate} variant="secondary">
              <LocateFixed size={16} />
              {isLocating ? 'Ищем...' : 'Моя геопозиция'}
            </UiButton>
          </div>
          <EventLocationPicker
            lat={lat}
            lng={lng}
            onChange={(nextLat, nextLng) => {
              setLat(nextLat.toFixed(6));
              setLng(nextLng.toFixed(6));
            }}
          />
          <p className="mt-3 text-xs text-white/40">
            Точка события: {lat}, {lng}
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">
              <Tags size={16} />
              Темы события
            </h2>
            <span className="text-xs text-white/40">Выбрано: {selectedTagIds.length}</span>
          </div>
          <label className="relative mt-3 block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/36"
              size={16}
            />
            <UiInput
              aria-label="Поиск темы"
              className="pl-10"
              placeholder="Поиск темы"
              value={tagSearch}
              onChange={(event) => setTagSearch(event.target.value)}
            />
          </label>
          <div className="mt-3 max-h-52 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.025] p-2">
            <div className="flex flex-wrap gap-2">
              {shownTags.map((tag) => {
                const active = selectedTagIds.includes(tag.id);
                const label = toRussianInterestLabel(tag.name, tag.slug);
                return (
                  <button
                    aria-pressed={active}
                    className={[
                      'rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.45)]',
                      active
                        ? 'border-[rgba(var(--sw-accent-2-rgb),0.48)] bg-[rgba(var(--sw-accent-4-rgb),0.22)] text-[var(--sw-accent-1)]'
                        : 'border-white/12 bg-white/[0.035] text-white/64 hover:border-white/24 hover:text-white',
                    ].join(' ')}
                    key={tag.id}
                    onClick={() =>
                      setSelectedTagIds((current) =>
                        active ? current.filter((id) => id !== tag.id) : [...current, tag.id],
                      )
                    }
                    type="button"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {!shownTags.length ? (
              <p className="px-2 py-3 text-sm text-white/46">Темы по запросу не найдены.</p>
            ) : null}
          </div>
          {visibleTags.length !== displayableTags.length ||
          visibleTags.length > shownTags.length ? (
            <p className="mt-2 text-xs text-white/36">
              Показано {shownTags.length} из {visibleTags.length}
            </p>
          ) : null}
          {tagsQuery.isError ? (
            <p className="mt-3 text-sm text-white/46">
              Темы не загрузились, событие можно опубликовать без них.
            </p>
          ) : null}
        </div>

        <label className="mt-4 block">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">
            <Calendar size={16} />
            Описание
          </span>
          <textarea
            aria-label="description"
            className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white placeholder:text-white/34 transition focus-visible:border-[rgba(var(--sw-accent-2-rgb),0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.22)]"
            placeholder="Коротко о формате, тайминге и кому подойдет встреча"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <UiButton
            className="h-14 w-full md:w-auto"
            onPress={submit}
            isDisabled={mutation.isPending}
          >
            {mutation.isPending ? 'Публикуем...' : 'Опубликовать'}
          </UiButton>
          <span className="text-sm text-white/46">Публикация обновит ленту и карту.</span>
        </div>
      </div>

      <div className="min-w-0 space-y-5">
        <div className="rounded-[26px] border border-white/10 bg-[var(--sw-neutral-800)] p-5 md:rounded-[30px] md:p-6">
          <CoverImage
            className="h-48"
            seed={title || location || 'create-event'}
            priority
            alt="Event preview"
          />
          <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[var(--sw-accent-3)]">
            Превью
          </p>
          <p className="mt-2 text-3xl leading-tight tracking-[-0.045em] text-white">
            {title || 'Ваше следующее событие'}
          </p>
          <p className="mt-3 text-white/58">
            {location || 'Алматы'} · {capacity || 8} мест
          </p>
          <p className="mt-2 text-sm text-white/42">
            {lat}, {lng}
          </p>
          <p className="mt-2 text-white/58">
            {description || 'Короткое описание события появится здесь.'}
          </p>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-[#101010] p-5 md:rounded-[30px] md:p-6">
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
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">
        {icon}
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function EventLocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: string;
  lng: string;
  onChange: (lat: number, lng: number) => void;
}) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const initialPointRef = useRef({ lat, lng });
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;

    const parsedLat = Number(initialPointRef.current.lat);
    const parsedLng = Number(initialPointRef.current.lng);
    const initial = {
      lat: Number.isFinite(parsedLat) ? parsedLat : ALMATY_CENTER.lat,
      lng: Number.isFinite(parsedLng) ? parsedLng : ALMATY_CENTER.lng,
    };

    const map = new maplibregl.Map({
      attributionControl: false,
      center: [initial.lng, initial.lat],
      container: mapNodeRef.current,
      style: OSM_STYLE,
      zoom: 13,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const markerNode = document.createElement('button');
    markerNode.type = 'button';
    markerNode.className =
      'grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-[var(--sw-accent-3)] text-white shadow-[0_12px_36px_rgba(255,123,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.65)] focus-visible:ring-offset-2 focus-visible:ring-offset-black';
    markerNode.setAttribute('aria-label', 'Выбранная точка события');
    markerNode.innerHTML = '<span class="h-2.5 w-2.5 rounded-full bg-white"></span>';

    const marker = new maplibregl.Marker({ draggable: true, element: markerNode })
      .setLngLat([initial.lng, initial.lat])
      .addTo(map);

    marker.on('dragend', () => {
      const next = marker.getLngLat();
      onChangeRef.current(next.lat, next.lng);
    });

    map.on('click', (event) => {
      marker.setLngLat(event.lngLat);
      onChangeRef.current(event.lngLat.lat, event.lngLat.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (!map || !marker || !Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return;

    const next: [number, number] = [parsedLng, parsedLat];
    marker.setLngLat(next);
    map.easeTo({ center: next, duration: 420, zoom: Math.max(map.getZoom(), 13) });
  }, [lat, lng]);

  return (
    <div className="relative mt-4 h-[320px] overflow-hidden rounded-[22px] border border-white/10 bg-black md:h-[380px]">
      <div ref={mapNodeRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.24))]" />
    </div>
  );
}

function Tip({ ready, text }: { ready: boolean; text: string }) {
  return (
    <p
      className={[
        'flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition',
        ready
          ? 'border-[rgba(var(--sw-accent-2-rgb),0.34)] bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-1)]'
          : 'border-white/10 bg-white/[0.04] text-white/52',
      ].join(' ')}
    >
      <CheckCircle2 size={16} />
      {text}
    </p>
  );
}
