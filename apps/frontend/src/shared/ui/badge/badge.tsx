import { Chip, type ChipProps } from '@heroui/react';

export function UiBadge({ className, ...props }: ChipProps) {
 return (
 <Chip
 variant="soft"
 className={[
 'border border-white/10 bg-white/[0.075] px-3 uppercase tracking-[0.08em] text-white/78',
 className ?? '',
 ].join(' ')}
 {...props}
 />
 );
}
