import { CommunityDetailScreen } from '@/features/communities/ui/community-detail-screen';

export default async function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommunityDetailScreen id={id} />;
}
