import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-border bg-card/80 px-4 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-[rgba(0,120,212,0.18)]",
        className,
      )}
      {...props}
    />
  );
});
