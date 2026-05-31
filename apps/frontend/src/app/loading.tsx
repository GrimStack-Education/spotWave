import { LoadingState } from '@/shared/ui/states/states';

export default function Loading() {
  return (
    <main className="sw-bg min-h-screen p-6 text-white">
      <LoadingState />
    </main>
  );
}
