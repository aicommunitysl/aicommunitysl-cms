"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

import { navigationItems, roleLabels } from "@/lib/constants";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="dash-grid min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-400 gap-6 px-4 py-4 md:px-6 lg:px-8">
        <aside className="glass-panel hidden w-80 shrink-0 flex-col rounded-[28px] border border-border/50 p-5 lg:flex">
          <div className="mb-8">
            <div className="mb-3 inline-flex rounded-full bg-[rgba(0,120,212,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Official CMS
            </div>
            <h1 className="text-2xl font-semibold text-balance">
              AI Community Sri Lanka
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Manage the platform content, static pages, speaker applications,
              and inbound messages from one place.
            </p>
          </div>

          <nav className="space-y-2">
            {navigationItems
              .filter((item) => !item.roles || item.roles.includes(user.role))
              .map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground shadow-[0_18px_35px_rgba(0,120,212,0.22)]"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>

          <div className="mt-auto rounded-3xl bg-primary p-4 text-primary-foreground shadow-[0_18px_35px_rgba(0,120,212,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground/10">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium">{user.email}</div>
                <div className="mt-1 text-xs text-primary-foreground/70">
                  {roleLabels[user.role]}
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              className="mt-4 w-full justify-center bg-foreground/10 text-primary-foreground hover:bg-foreground/20"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="glass-panel animate-fade-up rounded-[28px] border border-border/50 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Admin Console
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-balance">
                    Platform operations and content publishing
                  </h2>
                  <Badge tone={user.role === "admin" ? "warning" : "info"}>
                    {roleLabels[user.role]}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="hidden lg:block rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
                  Content changes are applied against the live API contracts
                  used by the public website.
                </div>
              </div>
            </div>
          </header>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
