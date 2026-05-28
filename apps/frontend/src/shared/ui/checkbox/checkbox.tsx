import { Checkbox } from '@/components/ui/checkbox';
import type { ComponentProps } from 'react';

type UiCheckboxProps = ComponentProps<typeof Checkbox> & {
 label?: string;
};

export function UiCheckbox({ label, ...props }: UiCheckboxProps) {
 return (
 <label className="flex items-center gap-2 text-white/58">
 <Checkbox {...props} />
 {label ? <span>{label}</span> : null}
 </label>
 );
}
