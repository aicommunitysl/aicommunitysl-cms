"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

// next-themes (≤0.4.6) injects an inline <script> into the React component
// tree for FOUC prevention. React 19 warns about inline scripts in component
// trees because they are never re-executed on the client — this is intentional
// and the script works correctly. Suppress the specific false-positive warning
// until next-themes ships a React 19–compatible release.
if (typeof window !== "undefined") {
  const _consoleError = console.error.bind(console);
  console.error = (...args: Parameters<typeof console.error>) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("script tag while rendering React component")) return;
    _consoleError(...args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
