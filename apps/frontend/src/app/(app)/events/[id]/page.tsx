import { EventDetailScreen } from '@/features/event-detail/ui/event-detail-screen';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 return <EventDetailScreen id={id} />;
}
