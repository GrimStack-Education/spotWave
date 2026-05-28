import { Button as ShadcnButton } from '@/components/ui/button';
import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<typeof ShadcnButton>;

export const Button = ({ children, ...props }: ButtonProps) => {
  return <ShadcnButton {...props}>{children}</ShadcnButton>;
};
