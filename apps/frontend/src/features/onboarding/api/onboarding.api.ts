import { apiRequest } from '@/shared/lib/api/client';

export type OnboardingPayload = {
  radiusKm: number;
  interestIds: string[];
  homeLat?: number;
  homeLng?: number;
};

export function fetchOnboarding() {
  return apiRequest<{
    radiusKm: number;
    interestIds: string[];
    homeLat: number | null;
    homeLng: number | null;
    completed: boolean;
  }>('/onboarding/me');
}

export function fetchOnboardingInterests() {
  return apiRequest<{ items: Array<{ id: string; name: string; slug: string; icon: string }> }>(
    '/onboarding/interests',
  );
}

export function saveOnboarding(payload: OnboardingPayload) {
  return apiRequest('/onboarding/me', { method: 'PUT', body: JSON.stringify(payload) });
}
