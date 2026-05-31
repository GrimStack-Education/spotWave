import { Badge } from '@/components/ui/badge';
import type { ComponentProps } from 'react';

export function UiBadge({ className, ...props }: ComponentProps<typeof Badge>) {
  return (
    <Badge
      variant="secondary"
      className={[
        'border border-white/10 bg-white/[0.075] px-3 uppercase tracking-[0.08em] text-white/78',
        className ?? '',
      ].join(' ')}
      {...props}
    />
  );
}
