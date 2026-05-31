import Link from 'next/link';
import { EmptyState } from '@/shared/ui/states/states';

export default function NotFound() {
  return (
    <main className="sw-bg min-h-screen p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <EmptyState title="Page not found" description="The page does not exist." />
        <div className="mt-4">
          <Link href="/start" className="text-brand">
            Back to start
          </Link>
        </div>
      </div>
    </main>
  );
}
