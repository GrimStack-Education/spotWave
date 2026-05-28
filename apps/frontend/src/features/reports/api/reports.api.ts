import { apiRequest } from '@/shared/lib/api/client';

export function createReport(payload: { targetType: 'EVENT' | 'USER'; targetId: string; reason: string }) {
  return apiRequest('/reports', { method: 'POST', body: JSON.stringify(payload) });
}
