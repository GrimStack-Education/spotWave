import { AlertTriangle, CheckCircle2, Loader2, SearchX } from 'lucide-react';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0f0f0f] p-8 text-center text-white">
      <div className="pointer-events-none absolute inset-x-12 -top-20 h-40 rounded-full bg-[rgba(var(--sw-accent-2-rgb),0.12)] blur-3xl" />
      <SearchX className="relative mx-auto mb-3 text-[var(--sw-accent-3)]" />
      <h3 className="relative text-3xl tracking-[-0.05em]">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-md text-white/55">{description}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-[#0f0f0f] p-8 text-white">
      <Loader2 className="animate-spin text-[var(--sw-accent-3)]" />
      Loading...
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(var(--sw-accent-2-rgb),0.30)] bg-[rgba(var(--sw-accent-4-rgb),0.10)] p-5 text-sm text-white/80">
      <AlertTriangle className="mb-2 text-[var(--sw-accent-3)]" />
      {message}
    </div>
  );
}

export function SuccessState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-5 text-sm text-emerald-50">
      <CheckCircle2 className="mb-2 text-emerald-300" />
      {message}
    </div>
  );
}
