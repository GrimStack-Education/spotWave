import { Card } from '@/components/ui/card';
import type { ComponentProps } from 'react';

export function UiCard({ className, ...props }: ComponentProps<typeof Card>) {
 return (
 <Card
 className={[
 'rounded-[28px] border border-white/10 bg-[#0f0f0f] py-0 text-white backdrop-blur-xl',
 className ?? '',
 ].join(' ')}
 {...props}
 />
 );
}
