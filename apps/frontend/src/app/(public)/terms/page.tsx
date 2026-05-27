import Link from 'next/link';
import { UiCard } from '@/shared/ui/card/card';

export default function TermsPage() {
 return <main className="sw-bg min-h-screen px-4 py-10 text-white"><UiCard className="mx-auto max-w-3xl p-8 md:p-10"><h1 className="text-5xl tracking-[-0.06em]">Terms</h1><p className="mt-5 text-lg leading-8 text-white/62">SpotWave usage terms for event participation, trust and safety.</p><Link href="/start" className="mt-8 inline-block text-[var(--sw-accent-3)]">Back to start</Link></UiCard></main>;
}
