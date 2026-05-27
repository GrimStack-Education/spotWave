import { EventChatScreen } from '@/features/event-chat/ui/event-chat-screen';
export default async function EventChatPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <EventChatScreen eventId={id} />; }
