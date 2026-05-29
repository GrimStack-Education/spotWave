import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

type UiButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']> | 'primary' | 'danger';
type ShadcnVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
type UiButtonProps = Omit<ComponentProps<typeof Button>, 'variant'> & {
 variant?: UiButtonVariant;
 fullWidth?: boolean;
 onPress?: ComponentProps<typeof Button>['onClick'];
 isDisabled?: boolean;
};

const variantMap: Record<string, ShadcnVariant> = {
 primary: 'default',
 secondary: 'secondary',
 outline: 'outline',
 danger: 'destructive',
};

export function UiButton({ className, variant = 'primary', fullWidth, onPress, onClick, isDisabled, disabled, type, ...props }: UiButtonProps) {
 const shadcnVariant: ShadcnVariant = variantMap[variant] ?? (variant as ShadcnVariant);

 return (
 <Button
 variant={shadcnVariant}
 className={[
 'min-h-11 rounded-2xl px-5 tracking-[-0.01em] text-white transition-all focus-visible:border-[rgba(var(--sw-accent-2-rgb),0.58)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--sw-accent-2-rgb),0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sw-neutral-900)]',
 fullWidth ? 'w-full' : '',
 variant === 'primary' ? 'bg-[#0f0f0f] text-white hover:bg-[#1a1a1a] enabled:hover:-translate-y-0.5' : '',
 variant === 'secondary' ? 'border border-white/10 bg-white/[0.075] text-white/88 enabled:hover:-translate-y-0.5 hover:bg-white/[0.11]' : '',
 variant === 'outline' ? 'border border-white/16 bg-transparent text-white/88 enabled:hover:-translate-y-0.5 hover:bg-white/[0.06]' : '',
 variant === 'danger' ? 'bg-[#0f0f0f] text-white enabled:hover:-translate-y-0.5 hover:bg-[#1a1a1a]' : '',
 (isDisabled ?? disabled) ? 'opacity-45 cursor-not-allowed saturate-50' : '',
 className ?? '',
 ].join(' ')}
 onClick={onPress ?? onClick}
 disabled={isDisabled ?? disabled}
 type={type ?? 'button'}
 {...props}
 />
 );
}
