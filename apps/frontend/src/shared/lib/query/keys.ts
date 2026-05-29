export const queryKeys = {
  me: ['auth', 'me'] as const,
  onboarding: ['onboarding', 'me'] as const,
  events: (params?: string) => ['events', params ?? 'default'] as const,
  event: (id: string) => ['event', id] as const,
  notifications: ['notifications'] as const,
  eventReviews: (eventId: string) => ['event-reviews', eventId] as const,
  eventChat: (eventId: string) => ['event-chat', eventId] as const,
  joinRequests: (eventId: string) => ['join-requests', eventId] as const,
  communities: (params?: string) => ['communities', params ?? 'default'] as const,
  community: (id: string) => ['community', id] as const,
  communityMessages: (id: string) => ['community-messages', id] as const,
};
