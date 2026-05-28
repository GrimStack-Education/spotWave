import { JoinRequestsScreen } from '@/features/join-requests/ui/join-requests-screen';

export default async function EventRequestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JoinRequestsScreen initialEventId={id} />;
}
