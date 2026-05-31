'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import { ArrowRight, MapPin, Navigation, SlidersHorizontal } from 'lucide-react';
import { fetchEvents } from '@/features/events/api/events.api';
import { mapBackendEventToDomain } from '@/features/events/model/mappers';
import { ALMATY_CENTER, OSM_STYLE } from '@/shared/lib/map/osm';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiButton } from '@/shared/ui/button/button';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';
import { CoverImage } from '@/shared/ui/media/cover-image';
import type { Event } from '@/shared/types/domain';

type MapCenter = typeof ALMATY_CENTER;

export function MapScreen() {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [center, setCenter] = useState<MapCenter>(ALMATY_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  const [radiusKm, setRadiusKm] = useState(8);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryKey = `map:${center.lat.toFixed(4)}:${center.lng.toFixed(4)}:${radiusKm}`;
  const eventsQuery = useQuery({
    queryKey: queryKeys.events(queryKey),
    queryFn: () => fetchEvents({ lat: center.lat, lng: center.lng, radiusKm, limit: 80 }),
    placeholderData: keepPreviousData,
  });

  const events = useMemo(
    () => (eventsQuery.data?.items ?? []).map(mapBackendEventToDomain),
    [eventsQuery.data?.items],
  );
  const selectedEvent = events.find((event) => event.id === selectedId) ?? events[0] ?? null;

  useEffect(() => {
    if (eventsQuery.isLoading || eventsQuery.isError || !mapNodeRef.current || mapRef.current)
      return;

    mapRef.current = new maplibregl.Map({
      container: mapNodeRef.current,
      style: OSM_STYLE,
      center: [ALMATY_CENTER.lng, ALMATY_CENTER.lat],
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    mapRef.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right',
    );

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [eventsQuery.isError, eventsQuery.isLoading]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      center: [center.lng, center.lat],
      zoom: radiusKm > 20 ? 10.5 : 12,
      duration: 650,
    });
  }, [center, radiusKm]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const centerMarker = document.createElement('button');
    centerMarker.type = 'button';
    centerMarker.className =
      'grid h-4 w-4 place-items-center rounded-full bg-white shadow-[0_0_0_6px_rgba(255,123,0,0.24),0_0_36px_rgba(255,123,0,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.65)] focus-visible:ring-offset-2 focus-visible:ring-offset-black';
    centerMarker.setAttribute('aria-label', 'Текущая позиция поиска');
    markersRef.current.push(
      new maplibregl.Marker({ element: centerMarker })
        .setLngLat([center.lng, center.lat])
        .addTo(map),
    );

    for (const event of events) {
      const markerNode = document.createElement('button');
      markerNode.type = 'button';
      markerNode.className = [
        'group min-w-9 rounded-full border px-3 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.65)] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        selectedEvent?.id === event.id
          ? 'border-[rgba(var(--sw-accent-2-rgb),0.72)] bg-[var(--sw-accent-3)]'
          : 'border-white/16 bg-black/70 hover:border-[rgba(var(--sw-accent-2-rgb),0.5)] hover:bg-[#1b1510]',
      ].join(' ');
      markerNode.textContent = event.rsvpCount ? `${event.rsvpCount}` : '•';
      markerNode.setAttribute('aria-label', event.title);
      markerNode.addEventListener('click', () => setSelectedId(event.id));

      markersRef.current.push(
        new maplibregl.Marker({ element: markerNode, anchor: 'bottom' })
          .setLngLat([event.lng, event.lat])
          .addTo(map),
      );
    }
  }, [center, events, selectedEvent?.id]);

  const locate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setCenter(ALMATY_CENTER);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  if (eventsQuery.isPending) return <LoadingState />;
  if (eventsQuery.isError) return <ErrorState message="Не удалось загрузить карту событий" />;

  return (
    <div className="min-w-0 space-y-5">
      <section className="grid min-w-0 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 space-y-4">
          <div className="flex min-w-0 flex-col gap-4 rounded-[26px] border border-white/10 bg-[var(--sw-neutral-800)] p-4 md:flex-row md:items-center md:justify-between md:rounded-[30px] md:p-5">
            <div className="min-w-0">
              <h1 className="text-[38px] leading-[0.96] tracking-[-0.055em] text-white md:text-[58px]">
                Карта событий
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56 md:text-base">
                Геоточки из OpenStreetMap, радиус поиска и список встреч в одной рабочей зоне.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-white/42">Найдено</p>
                <p className="mt-1 text-2xl tracking-[-0.05em] text-white">{events.length}</p>
              </div>
              <UiButton
                variant="secondary"
                className="h-12"
                onPress={locate}
                isDisabled={isLocating}
              >
                <Navigation size={16} />
                {isLocating ? 'Ищем...' : 'Моя геопозиция'}
              </UiButton>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[26px] border border-white/10 bg-[#101010] md:rounded-[30px]">
            <div className="relative h-[68vh] min-h-[500px] w-full max-h-[760px]">
              <div ref={mapNodeRef} className="absolute inset-0 min-w-0" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.04),rgba(10,10,10,0.32))]" />
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/68 p-3 backdrop-blur md:bottom-5 md:left-5 md:right-5 md:p-4">
                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-[0.12em] text-white/45">Радиус поиска</p>
                  <p className="mt-1 text-2xl tracking-[-0.04em] text-white">{radiusKm} км</p>
                </div>
                <label className="flex min-w-0 flex-[1_1_180px] items-center gap-3 text-white/70 sm:max-w-[360px]">
                  <SlidersHorizontal size={16} className="text-[var(--sw-accent-3)]" />
                  <input
                    aria-label="Радиус поиска"
                    className="h-2 w-full accent-[var(--sw-accent-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.55)]"
                    max={30}
                    min={1}
                    onChange={(event) => setRadiusKm(Number(event.target.value))}
                    type="range"
                    value={radiusKm}
                  />
                </label>
                <div className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-sm text-white/64 md:px-4 md:text-base">
                  {eventsQuery.isFetching ? 'Обновляем...' : `${events.length} событий`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="min-w-0 rounded-[26px] border border-white/10 bg-[var(--sw-neutral-800)] p-5 md:rounded-[30px] md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[34px] leading-[0.96] tracking-[-0.06em] text-white md:text-[40px]">
                События рядом
              </h2>
              <p className="mt-2 text-sm text-white/48">Выберите пин или карточку для перехода.</p>
            </div>
            <MapPin className="text-[var(--sw-accent-3)]" size={22} />
          </div>
          {events.length ? (
            <div className="mt-5 max-h-[680px] space-y-3 overflow-y-auto pr-1">
              {events.map((event) => (
                <EventRow
                  event={event}
                  isSelected={selectedEvent?.id === event.id}
                  key={event.id}
                  onSelect={() => setSelectedId(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Рядом пока тихо"
                description="Расширьте радиус или создайте первое событие в этой зоне."
              />
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

function EventRow({
  event,
  isSelected,
  onSelect,
}: {
  event: Event;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={[
        'group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-white/84 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sw-neutral-800)]',
        isSelected
          ? 'border-[rgba(var(--sw-accent-2-rgb),0.52)] bg-[rgba(var(--sw-accent-4-rgb),0.22)]'
          : 'border-white/10 bg-[#101010] hover:border-[rgba(var(--sw-accent-2-rgb),0.35)]',
      ].join(' ')}
      onClick={onSelect}
      type="button"
    >
      <CoverImage className="h-12 w-12 rounded-xl" seed={event.id} alt={event.title} />
      <div className="min-w-0 flex-1">
        <p className="truncate">{event.title}</p>
        <p className="truncate text-sm text-white/52">
          {event.distanceKm != null ? `${event.distanceKm.toFixed(1)} км` : event.radius + ' км'} ·{' '}
          {event.rsvpCount}/{event.capacity}
        </p>
      </div>
      <Link
        aria-label={`Открыть ${event.title}`}
        className="rounded-full border border-white/10 p-2 text-white/45 transition hover:border-[rgba(var(--sw-accent-2-rgb),0.38)] hover:text-[var(--sw-accent-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.55)]"
        href={`/events/${event.id}`}
      >
        <ArrowRight size={16} />
      </Link>
    </button>
  );
}
