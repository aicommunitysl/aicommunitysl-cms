"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  required,
  disabled,
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const idx = options.findIndex((o) => o.value === value);
      const next = Math.min(idx + 1, options.length - 1);
      if (options[next]) onValueChange(options[next].value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      const prev = Math.max(idx - 1, 0);
      if (options[prev]) onValueChange(options[prev].value);
    }
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-border bg-card/80 px-4 text-sm outline-none transition",
          selected ? "text-foreground" : "text-muted-foreground",
          open
            ? "border-primary ring-2 ring-[rgba(0,120,212,0.18)]"
            : "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[rgba(0,120,212,0.18)]",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className="truncate text-left">
          {selected?.label ?? placeholder ?? "Select…"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
        >
          <div className="max-h-60 overflow-y-auto py-1">
            {!required && placeholder && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => {
                  onValueChange("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-muted"
              >
                <span className="w-4 shrink-0" />
                {placeholder}
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onValueChange(opt.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition hover:bg-muted"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {opt.value === value && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
