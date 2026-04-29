import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(0,120,212,0.24)] hover:bg-[#106ebe]",
  secondary: "border border-border/60 bg-card text-foreground hover:bg-muted",
  ghost: "bg-transparent text-muted-foreground hover:bg-muted",
  danger: "bg-destructive text-primary-foreground hover:bg-[#b91c1c]",
};

const sizeVariants = {
  md: "h-11 px-4 py-2 text-sm",
  sm: "h-9 px-3 py-2 text-xs",
  lg: "h-12 px-5 py-3 text-sm",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof sizeVariants;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
          buttonVariants[variant],
          sizeVariants[size],
          className,
        )}
        {...props}
      />
    );
  },
);
