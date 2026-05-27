import { Bookmark, MapPin, X } from 'lucide-react';
import { events } from '@/shared/mocks/spotwave';
import { UiBadge } from '@/shared/ui/badge/badge';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';

export function QuickMatchScreen() {
 const event = events[0];
 return (
 <div className="mx-auto max-w-3xl space-y-5">
 <div><h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Quick <span className="text-[var(--sw-accent-3)]">match</span></h1><p className="mt-4 text-white/58">Swipe-like mode for deciding fast without turning events into noise.</p></div>
 <UiCard className="overflow-hidden p-0">
 <div className="h-80 bg-[#0f0f0f]" />
 <div className="p-6">
 <UiBadge className="border-[rgba(var(--sw-accent-2-rgb),0.30)] bg-[rgba(var(--sw-accent-4-rgb),0.15)] text-[var(--sw-accent-3)]">{event.category}</UiBadge>
 <h2 className="mt-3 text-3xl tracking-[-0.045em]">{event.title}</h2>
 <p className="mt-2 flex items-center gap-2 text-white/58"><MapPin size={17} /> {event.datetime} · {event.location}</p>
 <div className="mt-6 grid grid-cols-3 gap-3"><UiButton variant="secondary"><X size={18} /> Skip</UiButton><UiButton>I am in</UiButton><UiButton variant="secondary"><Bookmark size={18} /> Save</UiButton></div>
 </div>
 </UiCard>
 </div>
 );
}
