import { Card, type CardProps } from '@heroui/react';

export function UiCard({ className, ...props }: CardProps) {
 return (
 <Card
 className={[
 'rounded-[28px] border border-white/10 bg-[#0f0f0f] text-white backdrop-blur-xl',
 className ?? '',
 ].join(' ')}
 {...props}
 />
 );
}
