import { Input, type InputProps } from '@heroui/react';

export function UiInput({ className, ...props }: InputProps) {
 return (
 <Input
 variant="secondary"
 className={[
 'min-h-12 rounded-2xl border border-white/12 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/32 focus:border-[var(--sw-accent-3)]',
 className ?? '',
 ].join(' ')}
 {...props}
 />
 );
}
