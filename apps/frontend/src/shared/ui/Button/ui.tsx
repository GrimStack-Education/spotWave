import { Button as HeroUIButton, ButtonProps } from "@heroui/react";

interface ButtonProps extends ButtonProps {
  // Add custom props here if needed
}

export const Button = ({ children, ...props }: ButtonProps) => {
  return <HeroUIButton {...props}>{children}</HeroUIButton>;
};
