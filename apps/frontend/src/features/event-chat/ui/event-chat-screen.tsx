import { MessageCircle, Pin } from 'lucide-react';
import { chats } from '@/shared/mocks/spotwave';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';

export function EventChatScreen({ eventId }: { eventId: string }) {
 const chat = chats.find((c) => c.eventId === eventId);
 return (
 <UiCard className="space-y-5 p-6 md:p-8">
 <div><h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Event chat</h1><p className="mt-4 text-white/58">Coordinate details before meeting offline.</p></div>
 <p className="flex items-center gap-2 rounded-2xl border border-[rgba(var(--sw-accent-3-rgb),0.24)] bg-[rgba(var(--sw-accent-3-rgb),0.10)] p-4 text-sm text-white/80"><Pin size={16} /> Pinned: meet 10 minutes before start.</p>
 <div className="space-y-2">{(chat?.messages ?? ['No messages yet']).map((message, index) => <p key={index} className="rounded-2xl border border-white/8 bg-white/[0.045] p-3 text-white/72"><MessageCircle className="mr-2 inline text-[var(--sw-accent-3)]" size={15} />{message}</p>)}</div>
 <UiInput aria-label="message" placeholder="Type message" />
 </UiCard>
 );
}
