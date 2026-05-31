'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import {
  fetchNotifications,
  markNotificationRead,
} from '@/features/notifications/api/notifications.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';

export function NotificationsScreen() {
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotifications,
  });
  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });

  if (notificationsQuery.isLoading) return <LoadingState />;
  if (notificationsQuery.isError) return <ErrorState message="Не удалось загрузить уведомления" />;

  const items = notificationsQuery.data?.items ?? [];
  if (!items.length)
    return (
      <EmptyState
        title="Уведомлений пока нет"
        description="Здесь появятся отклики, апдейты и статусы."
      />
    );

  return (
    <div className="min-w-0 space-y-6">
      <div className="max-w-215">
        <h1 className="text-[46px] leading-[0.98] tracking-[-0.04em] text-white md:text-[84px] md:tracking-[-0.07em] xl:text-[96px]">
          Центр
          <br />
          обновлений
        </h1>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.readAt ? undefined : readMutation.mutate(item.id))}
            className="rounded-[24px] border border-white/10 bg-(--sw-neutral-800) p-5 text-left transition hover:border-white/18 hover:bg-white/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-(--sw-neutral-900)"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[rgba(var(--sw-accent-4-rgb),0.14)] text-brand">
                <Bell size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-2xl leading-tight text-white">{item.title}</p>
                <p className="mt-2 text-white/58">{item.body}</p>
                <p className="mt-2 text-xs text-white/42">
                  {new Date(item.createdAt).toLocaleString()}{' '}
                  {item.readAt ? '· Прочитано' : '· Новое'}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
