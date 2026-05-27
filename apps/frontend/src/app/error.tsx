'use client';

import { ErrorState } from '@/shared/ui/states/states';

export default function Error({ error }: { error: Error }) {
 return <main className="sw-bg min-h-screen p-6 text-white"><ErrorState message={error.message} /></main>;
}
