'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, ImagePlus, MessageCircle, Plus, Search, Users } from 'lucide-react';
import {
  createCommunity,
  fetchCommunities,
  type Community,
} from '@/features/communities/api/communities.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { toErrorMessage } from '@/shared/lib/api/error';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';
import { CoverImage } from '@/shared/ui/media/cover-image';

export function CommunitiesScreen() {
  const [searchCity, setSearchCity] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [communityCity, setCommunityCity] = useState('Алматы');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const appliedCity = cityFilter.trim();
  const queryKey = appliedCity ? `city:${appliedCity}` : 'all';
  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities(queryKey),
    queryFn: () => fetchCommunities({ city: appliedCity || undefined, limit: 60 }),
    placeholderData: keepPreviousData,
  });
  const createMutation = useMutation({
    mutationFn: () =>
      createCommunity({
        name: name.trim(),
        description: description.trim(),
        city: communityCity.trim() || 'Алматы',
        avatarUrl: avatarUrl.trim() || undefined,
      }),
    onSuccess: async (community) => {
      setName('');
      setDescription('');
      setCommunityCity(community.city);
      setAvatarUrl('');
      setSearchCity(community.city);
      setCityFilter(community.city);
      setCreateError(null);
      await queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
    onError: (error) => setCreateError(toErrorMessage(error)),
  });

  const applySearch = () => setCityFilter(searchCity.trim());

  if (communitiesQuery.isPending) return <LoadingState />;
  if (communitiesQuery.isError) return <ErrorState message="Не удалось загрузить сообщества" />;

  const communities = communitiesQuery.data?.items ?? [];
  const canCreate =
    name.trim().length >= 3 &&
    description.trim().length >= 12 &&
    communityCity.trim().length >= 2 &&
    !createMutation.isPending;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-[30px] border border-white/10 bg-[var(--sw-neutral-800)] p-5 md:p-7">
              <h1 className="text-[44px] leading-[0.96] tracking-[-0.06em] text-white md:text-[68px]">
                Сообщества для локальных встреч
              </h1>
              <p className="mt-4 max-w-2xl text-white/58">
                Найдите группу по городу, зайдите в чат и договоритесь о реальной встрече по
                интересам.
              </p>
              <div className="mt-6 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 focus-within:border-[rgba(var(--sw-accent-2-rgb),0.42)] focus-within:ring-2 focus-within:ring-[rgba(var(--sw-accent-2-rgb),0.18)]">
                <Search size={17} className="text-white/42" />
                <input
                  aria-label="Город"
                  className="h-12 flex-1 bg-transparent text-white outline-none placeholder:text-white/32"
                  onChange={(event) => setSearchCity(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') applySearch();
                  }}
                  placeholder="Алматы"
                  value={searchCity}
                />
                <button
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/72 transition hover:border-[rgba(var(--sw-accent-2-rgb),0.42)] hover:text-white"
                  onClick={applySearch}
                  type="button"
                >
                  Найти
                </button>
              </div>
              {communitiesQuery.isFetching ? (
                <p className="mt-3 text-sm text-white/42">Обновляем список...</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
              <CommunityMetric
                icon={<Users size={18} />}
                label="Сообществ"
                value={String(communities.length)}
              />
              <CommunityMetric
                icon={<MessageCircle size={18} />}
                label="Участников"
                value={String(communities.reduce((sum, item) => sum + item.members.activeCount, 0))}
              />
            </div>
          </div>

          {communities.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {communities.map((community) => (
                <CommunityCard community={community} key={community.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Сообществ пока нет"
              description="Создайте первую группу для встреч в этом городе."
            />
          )}
        </div>

        <UiCard className="h-fit p-6 md:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-4-rgb),0.16)] text-[var(--sw-accent-3)]">
              <Plus size={21} />
            </span>
            <div>
              <h2 className="text-2xl tracking-[-0.04em]">Создать сообщество</h2>
              <p className="mt-1 text-sm text-white/50">Owner сразу становится участником чата.</p>
            </div>
          </div>
          {createError ? (
            <div className="mt-5">
              <ErrorState message={createError} />
            </div>
          ) : null}
          <div className="mt-6 space-y-3">
            <UiInput
              aria-label="Название"
              placeholder="Almaty Rooftop Circle"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <label className="block">
              <span className="mb-2 flex items-center justify-between gap-3 text-sm text-white/58">
                <span>Описание</span>
                <span className="text-white/38">Минимум 12 символов</span>
              </span>
              <textarea
                className="min-h-32 w-full resize-none rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--sw-accent-3)]"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Для кого группа, какой формат встреч и чем полезен чат..."
                value={description}
              />
            </label>
            <UiInput
              aria-label="Город сообщества"
              placeholder="Алматы"
              value={communityCity}
              onChange={(event) => setCommunityCity(event.target.value)}
            />
            <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4">
              <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)] md:items-start">
                <CoverImage
                  className="h-32"
                  seed={name || communityCity || 'community'}
                  src={avatarUrl.trim() || null}
                  alt={name || 'Предпросмотр сообщества'}
                />
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-white/58">
                    <ImagePlus size={16} />
                    Фото сообщества
                  </span>
                  <UiInput
                    aria-label="Ссылка на картинку сообщества"
                    placeholder="Вставьте ссылку на изображение"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                  />
                </label>
              </div>
            </div>
            <UiButton
              fullWidth
              isDisabled={!canCreate}
              onPress={() => {
                setCreateError(null);
                createMutation.mutate();
              }}
            >
              {createMutation.isPending ? 'Создаем...' : 'Создать'}
            </UiButton>
          </div>
        </UiCard>
      </section>
    </div>
  );
}

function CommunityCard({ community }: { community: Community }) {
  return (
    <Link
      className="group overflow-hidden rounded-[30px] border border-white/10 bg-[#101010] transition hover:-translate-y-1 hover:border-[rgba(var(--sw-accent-2-rgb),0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sw-neutral-900)]"
      href={`/communities/${community.id}`}
    >
      <div className="relative h-40 bg-[radial-gradient(circle_at_28%_20%,rgba(var(--sw-accent-2-rgb),0.42),transparent_32%),linear-gradient(135deg,#21130a,#101010_58%,#191919)]">
        <Image
          alt=""
          className="absolute right-5 top-5 rounded-[28px] border border-white/12 bg-black/35"
          height={86}
          src={community.avatarUrl}
          unoptimized
          width={86}
        />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
          <span className="text-sm text-white/72">{community.city}</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/45 px-3 py-1.5 text-sm text-white/70">
            <MessageCircle size={14} /> {community.members.activeCount}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-3xl leading-tight tracking-[-0.05em] text-white">{community.name}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/56">{community.description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-[var(--sw-accent-3)] transition group-hover:translate-x-1">
          Открыть чат <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

function CommunityMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[var(--sw-neutral-800)] p-5">
      <div className="flex items-center gap-2 text-[var(--sw-accent-3)]">
        {icon}
        <span className="text-xs uppercase tracking-[0.12em] text-white/42">{label}</span>
      </div>
      <p className="mt-4 text-4xl tracking-[-0.06em] text-white">{value}</p>
    </div>
  );
}
