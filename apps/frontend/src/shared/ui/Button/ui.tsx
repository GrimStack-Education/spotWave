import { Button as HeroUIButton, ButtonProps as HeroUIButtonProps } from '@heroui/react';

type ButtonProps = HeroUIButtonProps;

export const Button = ({ children, ...props }: ButtonProps) => {
  return <HeroUIButton {...props}>{children}</HeroUIButton>;
};
