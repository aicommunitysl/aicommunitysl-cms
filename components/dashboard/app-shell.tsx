"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, User, X } from "lucide-react";

import { navigationItems, roleLabels } from "@/lib/constants";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const visibleNav = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo & brand */}
      <div className="flex items-center gap-3 border-b border-border/50 px-4 py-4">
        <Image
          src="/logo.svg"
          alt="AICSL"
          width={30}
          height={30}
          className="shrink-0 dark:invert"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold leading-tight">
            AI Community SL
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            CMS
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Profile + Sign out */}
      <div className="border-t border-border/50 px-3 py-3 space-y-0.5">
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-foreground">
              {user.email}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {roleLabels[user.role]}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="dash-grid min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-border/50 transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 p-3 md:gap-5 md:p-4 lg:gap-5 lg:p-5">
        {/* Desktop sidebar */}
        <aside className="glass-panel hidden w-56 shrink-0 flex-col rounded-2xl border border-border/50 lg:flex">
          {sidebarContent}
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Top header */}
          <header className="glass-panel rounded-2xl border border-border/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 lg:hidden">
                <Image
                  src="/logo.svg"
                  alt="AICSL"
                  width={22}
                  height={22}
                  className="dark:invert"
                />
                <span className="text-sm font-semibold">AICSL CMS</span>
              </div>

              <div className="hidden lg:block">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Admin Console
                </div>
                <h2 className="text-base font-semibold leading-tight">
                  Platform operations
                </h2>
              </div>

              <div className="ml-auto flex items-center gap-2.5">
                <Badge
                  tone={user.role === "admin" ? "warning" : "info"}
                  className="hidden sm:inline-flex"
                >
                  {roleLabels[user.role]}
                </Badge>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
