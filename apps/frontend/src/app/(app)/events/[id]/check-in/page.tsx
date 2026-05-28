import { CheckInScreen } from '@/features/check-in/ui/check-in-screen';

export default async function EventCheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CheckInScreen initialEventId={id} />;
}
