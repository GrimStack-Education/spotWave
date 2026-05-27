import type { ReactNode } from 'react';
import { MapPinned, QrCode, ScanLine } from 'lucide-react';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';

export function CheckInScreen() {
 return (
 <UiCard className="space-y-6 p-6 md:p-8">
 <div><h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Check-in</h1><p className="mt-4 max-w-2xl text-white/58">Confirm real attendance with geo, QR or short code once the event starts.</p></div>
 <div className="grid gap-3 md:grid-cols-3">
 <Action icon={<MapPinned size={22} />} title="Geo check" />
 <Action icon={<QrCode size={22} />} title="Scan QR" />
 <Action icon={<ScanLine size={22} />} title="Enter code" primary />
 </div>
 </UiCard>
 );
}

function Action({ icon, primary, title }: { icon: ReactNode; primary?: boolean; title: string }) {
 return <UiButton className="h-24 flex-col gap-2" variant={primary ? 'primary' : 'secondary'}>{icon}{title}</UiButton>;
}
