'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MapPinned, QrCode, ScanLine } from 'lucide-react';
import { createCheckIn } from '@/features/check-in/api/check-in.api';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';
import { ErrorState } from '@/shared/ui/states/states';

export function CheckInScreen({ initialEventId = '' }: { initialEventId?: string }) {
  const [eventId, setEventId] = useState(initialEventId);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: { method: 'GEO' | 'QR' | 'CODE'; code?: string }) => createCheckIn(eventId, payload),
    onSuccess: () => setStatus('Check-in завершен'),
    onError: () => setStatus('Ошибка check-in'),
  });

  return (
    <UiCard className="space-y-6 p-6 md:p-8"><div><h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Check-in</h1><p className="mt-4 max-w-2xl text-white/58">Confirm real attendance with geo, QR or short code once the event starts.</p></div>
      <UiInput placeholder="Event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} />
      <UiInput placeholder="Code (optional)" value={code} onChange={(e) => setCode(e.target.value)} />
      {status ? <ErrorState message={status} /> : null}
      <div className="grid gap-3 md:grid-cols-3"><Action icon={<MapPinned size={22} />} title="Geo check" onClick={() => mutation.mutate({ method: 'GEO' })} /><Action icon={<QrCode size={22} />} title="Scan QR" onClick={() => mutation.mutate({ method: 'QR', code })} /><Action icon={<ScanLine size={22} />} title="Enter code" primary onClick={() => mutation.mutate({ method: 'CODE', code })} /></div>
    </UiCard>
  );
}

function Action({ icon, primary, title, onClick }: { icon: React.ReactNode; primary?: boolean; title: string; onClick: () => void }) {
  return <UiButton className="h-24 flex-col gap-2" variant={primary ? 'primary' : 'secondary'} onClick={onClick}>{icon}{title}</UiButton>;
}
