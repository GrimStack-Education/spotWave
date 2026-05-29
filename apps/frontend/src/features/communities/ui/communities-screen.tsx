'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, MessageCircle, Plus, Search, Users } from 'lucide-react';
import {
  createCommunity,
  fetchCommunities,
  type Community,
} from '@/features/communities/api/communities.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { toErrorMessage } from '@/shared/lib/api/error';
import { UiBadge } from '@/shared/ui/badge/badge';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';

export function CommunitiesScreen() {
  const [city, setCity] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const queryKey = city.trim() ? `city:${city.trim()}` : 'all';
  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities(queryKey),
    queryFn: () => fetchCommunities({ city: city.trim() || undefined, limit: 60 }),
  });
  const createMutation = useMutation({
    mutationFn: () =>
      createCommunity({
        name,
        description,
        city: city.trim() || 'Алматы',
      }),
    onSuccess: async () => {
      setName('');
      setDescription('');
      setCreateError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.communities() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.communities(queryKey) });
    },
    onError: (error) => setCreateError(toErrorMessage(error)),
  });

  if (communitiesQuery.isLoading) return <LoadingState />;
  if (communitiesQuery.isError) return <ErrorState message="Не удалось загрузить сообщества" />;

  const communities = communitiesQuery.data?.items ?? [];
  const canCreate = name.trim().length >= 3 && description.trim().length >= 12 && !createMutation.isPending;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="rounded-[34px] border border-white/10 bg-[var(--sw-neutral-800)] p-6 md:p-8">
            <UiBadge className="border-[rgba(var(--sw-accent-2-rgb),0.28)] bg-[rgba(var(--sw-accent-4-rgb),0.14)] text-[var(--sw-accent-3)]">
              <Users size={13} /> Группы рядом
            </UiBadge>
            <h1 className="mt-5 text-[52px] leading-[0.96] tracking-[-0.06em] text-white md:text-[78px] xl:text-[96px]">
              Сообщества для <span className="text-[var(--sw-accent-3)]">локальных</span> встреч
            </h1>
            <p className="mt-5 max-w-2xl text-white/58">
              Каталоги групп, быстрый вход и общий чат для участников: от пробежек до камерных ужинов.
            </p>
            <div className="mt-7 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4">
              <Search size={17} className="text-white/42" />
              <input
                aria-label="Город"
                className="h-12 flex-1 bg-transparent text-white outline-none placeholder:text-white/32"
                onChange={(event) => setCity(event.target.value)}
                placeholder="Алматы"
                value={city}
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
            <EmptyState title="Сообществ пока нет" description="Создайте первую группу для встреч в этом городе." />
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
          {createError ? <div className="mt-5"><ErrorState message={createError} /></div> : null}
          <div className="mt-6 space-y-3">
            <UiInput aria-label="Название" placeholder="Almaty Rooftop Circle" value={name} onChange={(event) => setName(event.target.value)} />
            <textarea
              aria-label="Описание"
              className="min-h-32 w-full resize-none rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/32 focus:border-[var(--sw-accent-3)]"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Для кого группа, какой формат встреч и чем полезен чат..."
              value={description}
            />
            <UiInput aria-label="Город сообщества" placeholder="Алматы" value={city} onChange={(event) => setCity(event.target.value)} />
            <UiButton fullWidth isDisabled={!canCreate} onPress={() => createMutation.mutate()}>
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
      className="group overflow-hidden rounded-[30px] border border-white/10 bg-[#101010] transition hover:-translate-y-1 hover:border-[rgba(var(--sw-accent-2-rgb),0.38)]"
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
          <UiBadge className="border-white/12 bg-black/45 text-white/70">{community.city}</UiBadge>
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
