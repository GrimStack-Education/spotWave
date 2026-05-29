'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import { ArrowRight, LocateFixed, MapPin, Navigation, SlidersHorizontal } from 'lucide-react';
import { fetchEvents } from '@/features/events/api/events.api';
import { mapBackendEventToDomain } from '@/features/events/model/mappers';
import { queryKeys } from '@/shared/lib/query/keys';
import { UiBadge } from '@/shared/ui/badge/badge';
import { UiButton } from '@/shared/ui/button/button';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';
import { CoverImage } from '@/shared/ui/media/cover-image';
import type { Event } from '@/shared/types/domain';

const ALMATY_CENTER = { lat: 43.238949, lng: 76.889709 };
const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      paint: {
        'raster-saturation': -0.65,
        'raster-brightness-min': 0.05,
        'raster-brightness-max': 0.72,
        'raster-contrast': 0.28,
      },
    },
  ],
};

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
  });

  const events = useMemo(
    () => (eventsQuery.data?.items ?? []).map(mapBackendEventToDomain),
    [eventsQuery.data?.items],
  );
  const selectedEvent = events.find((event) => event.id === selectedId) ?? events[0] ?? null;

  useEffect(() => {
    if (eventsQuery.isLoading || eventsQuery.isError || !mapNodeRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapNodeRef.current,
      style: OSM_STYLE,
      center: [ALMATY_CENTER.lng, ALMATY_CENTER.lat],
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right',
    );
    mapRef.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

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
    map.easeTo({ center: [center.lng, center.lat], zoom: radiusKm > 20 ? 10.5 : 12, duration: 650 });
  }, [center, radiusKm]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const centerMarker = document.createElement('button');
    centerMarker.type = 'button';
    centerMarker.className = 'grid h-4 w-4 place-items-center rounded-full bg-white shadow-[0_0_0_6px_rgba(255,123,0,0.24),0_0_36px_rgba(255,123,0,0.65)]';
    centerMarker.setAttribute('aria-label', 'Текущая позиция поиска');
    markersRef.current.push(new maplibregl.Marker({ element: centerMarker }).setLngLat([center.lng, center.lat]).addTo(map));

    for (const event of events) {
      const markerNode = document.createElement('button');
      markerNode.type = 'button';
      markerNode.className = [
        'group min-w-9 rounded-full border px-3 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur transition',
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

  if (eventsQuery.isLoading) return <LoadingState />;
  if (eventsQuery.isError) return <ErrorState message="Не удалось загрузить карту событий" />;

  return (
    <div className="space-y-6">
      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="rounded-[34px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 md:p-8">
            <UiBadge className="border-[rgba(var(--sw-accent-2-rgb),0.28)] bg-[rgba(var(--sw-accent-4-rgb),0.14)] text-[var(--sw-accent-3)]">
              <LocateFixed size={13} /> Live geo
            </UiBadge>
            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-[52px] leading-[0.96] tracking-[-0.06em] text-white md:text-[76px] xl:text-[92px]">
                  Карта событий <span className="text-[var(--sw-accent-3)]">рядом</span>
                </h1>
                <p className="mt-5 max-w-2xl text-white/58">
                  Настоящая карта активных встреч: геоточки, радиус поиска и быстрый переход в событие.
                </p>
              </div>
              <UiButton variant="secondary" className="h-12 w-full sm:w-auto" onPress={locate} isDisabled={isLocating}>
                <Navigation size={16} />
                {isLocating ? 'Ищем...' : 'Моя геопозиция'}
              </UiButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#101010]">
            <div className="relative h-[520px] min-h-[420px]">
              <div ref={mapNodeRef} className="absolute inset-0" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(var(--sw-accent-2-rgb),0.12),transparent_28%),linear-gradient(180deg,rgba(8,10,15,0.08),rgba(8,10,15,0.42))]" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/60 p-4 backdrop-blur">
                <div>
                  <p className="text-sm uppercase tracking-[0.12em] text-white/45">Радиус поиска</p>
                  <p className="mt-1 text-2xl tracking-[-0.04em] text-white">{radiusKm} км</p>
                </div>
                <label className="flex min-w-[220px] flex-1 items-center gap-3 text-white/70 sm:max-w-[360px]">
                  <SlidersHorizontal size={16} className="text-[var(--sw-accent-3)]" />
                  <input
                    aria-label="Радиус поиска"
                    className="h-2 w-full accent-[var(--sw-accent-3)]"
                    max={30}
                    min={1}
                    onChange={(event) => setRadiusKm(Number(event.target.value))}
                    type="range"
                    value={radiusKm}
                  />
                </label>
                <div className="rounded-full border border-white/10 px-4 py-2 text-white/64">{events.length} событий</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[30px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[36px] leading-[0.96] tracking-[-0.06em] text-white md:text-[42px]">События</h2>
            <MapPin className="text-[var(--sw-accent-3)]" size={22} />
          </div>
          {events.length ? (
            <div className="mt-6 space-y-3">
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
              <EmptyState title="Рядом пока тихо" description="Расширьте радиус или создайте первое событие в этой зоне." />
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
        'group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-white/84 transition',
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
          {event.distanceKm != null ? `${event.distanceKm.toFixed(1)} км` : event.radius + ' км'} · {event.rsvpCount}/{event.capacity}
        </p>
      </div>
      <Link
        aria-label={`Открыть ${event.title}`}
        className="rounded-full border border-white/10 p-2 text-white/45 transition hover:border-[rgba(var(--sw-accent-2-rgb),0.38)] hover:text-[var(--sw-accent-3)]"
        href={`/events/${event.id}`}
      >
        <ArrowRight size={16} />
      </Link>
    </button>
  );
}
