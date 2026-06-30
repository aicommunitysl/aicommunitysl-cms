import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const tones = {
    default: "bg-card/80 text-muted-foreground",
    success: "bg-[rgba(23,201,100,0.12)] text-green-600 dark:text-green-400",
    warning: "bg-[rgba(245,165,36,0.16)] text-[#b45309]",
    danger: "bg-[rgba(239,68,68,0.12)] text-destructive",
    info: "bg-[rgba(0,120,212,0.12)] text-[#005a9e]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
