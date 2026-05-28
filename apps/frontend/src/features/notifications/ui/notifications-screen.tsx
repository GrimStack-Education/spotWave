'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '@/features/notifications/api/notifications.api';
import { queryClient } from '@/shared/lib/query/query-client';
import { queryKeys } from '@/shared/lib/query/keys';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states/states';

export function NotificationsScreen() {
  const notificationsQuery = useQuery({ queryKey: queryKeys.notifications, queryFn: fetchNotifications });
  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });

  if (notificationsQuery.isLoading) return <LoadingState />;
  if (notificationsQuery.isError) return <ErrorState message="Не удалось загрузить уведомления" />;

  const items = notificationsQuery.data?.items ?? [];
  if (!items.length) return <EmptyState title="Уведомлений пока нет" description="Здесь появятся отклики, апдейты и статусы." />;

  return (
    <div className="space-y-6"><div className="max-w-[860px]"><h1 className="text-[58px] leading-[0.96] tracking-[-0.07em] text-white md:text-[84px] xl:text-[96px]">Центр<br />обновлений</h1></div>
      <div className="grid gap-3">{items.map((item) => <button key={item.id} type="button" onClick={() => item.readAt ? undefined : readMutation.mutate(item.id)} className="rounded-[24px] border border-white/10 bg-[var(--sw-neutral-800)] p-5 text-left"><div className="flex items-start gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[rgba(var(--sw-accent-4-rgb),0.14)] text-[var(--sw-accent-3)]"><Bell size={20} /></span><div><p className="text-2xl leading-tight text-white">{item.title}</p><p className="mt-2 text-white/58">{item.body}</p><p className="mt-2 text-xs text-white/42">{new Date(item.createdAt).toLocaleString()} {item.readAt ? '· Прочитано' : '· Новое'}</p></div></div></button>)}</div>
    </div>
  );
}
