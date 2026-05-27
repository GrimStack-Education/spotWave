import { Button, type ButtonProps } from '@heroui/react';

type UiButtonVariant = ButtonProps['variant'] | 'danger';

type UiButtonProps = Omit<ButtonProps, 'variant'> & {
 variant?: UiButtonVariant;
};

const variantMap: Record<string, ButtonProps['variant']> = {
 primary: 'primary',
 secondary: 'secondary',
 outline: 'outline',
 danger: 'danger',
};

export function UiButton({ className, variant = 'primary', ...props }: UiButtonProps) {
 const heroVariant = variantMap[variant] ?? variant;

 return (
 <Button
 variant={heroVariant}
 className={[
 'min-h-11 rounded-2xl px-5 tracking-[-0.01em] text-white transition-transform data-[hover=true]:-translate-y-0.5',
 variant === 'primary' ? 'bg-[#0f0f0f] ' : '',
 variant === 'secondary' ? 'border border-white/10 bg-white/[0.075] text-white/88' : '',
 variant === 'outline' ? 'border border-white/16 bg-transparent text-white/88' : '',
 variant === 'danger' ? 'bg-[#0f0f0f] ' : '',
 className ?? '',
 ].join(' ')}
 {...props}
 />
 );
}
