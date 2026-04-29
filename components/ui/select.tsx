import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-border bg-card/80 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-[rgba(0,120,212,0.18)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
