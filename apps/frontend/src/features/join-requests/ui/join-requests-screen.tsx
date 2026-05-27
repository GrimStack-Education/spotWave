import { UserPlus } from 'lucide-react';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';

const requests = ['Mira wants to join Board Games Night', 'Daniyar wants to join Morning Run Circle'];

export function JoinRequestsScreen() {
 return (
 <div className="space-y-5">
 <h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Join requests</h1>
 <div className="grid gap-3">
 {requests.map((request) => <UiCard key={request} className="p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-3-rgb),0.16)] text-[var(--sw-accent-3)]"><UserPlus size={20} /></span><span className="">{request}</span></div><div className="flex gap-2"><UiButton size="sm">Approve</UiButton><UiButton size="sm" variant="secondary">Reject</UiButton></div></div></UiCard>)}
 </div>
 </div>
 );
}
