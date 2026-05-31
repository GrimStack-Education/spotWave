import { Input } from '@/components/ui/input';
import type { ComponentProps } from 'react';

export function UiInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      className={[
        'min-h-12 rounded-2xl border-white/12 bg-white/[0.04] px-4 text-white placeholder:text-white/32 focus-visible:border-[var(--sw-accent-3)] focus-visible:ring-0',
        className ?? '',
      ].join(' ')}
      {...props}
    />
  );
}
