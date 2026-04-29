import Link from "next/link";

import { OverviewMetrics } from "@/components/dashboard/overview-metrics";
import { Badge } from "@/components/ui/badge";
import { contentSlugs, navigationItems } from "@/lib/constants";
import { requireUser } from "@/lib/session";

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const visibleNavigation = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );

  return (
    <div className="space-y-6">
      <OverviewMetrics />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="section-shell animate-fade-up p-6 [animation-delay:140ms]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Quick access
              </div>
              <h3 className="mt-2 text-2xl font-semibold">
                Core admin modules
              </h3>
            </div>
            <Badge tone="info">{visibleNavigation.length} modules</Badge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-3xl border border-border bg-card/80 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 text-lg font-semibold">{item.label}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Open the {item.label.toLowerCase()} workspace and manage
                    live content through the FastAPI backend.
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="section-shell animate-fade-up p-6 [animation-delay:220ms]">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Content focus
          </div>
          <h3 className="mt-2 text-2xl font-semibold">Static page targets</h3>
          <div className="mt-6 space-y-4">
            {contentSlugs.map((page) => (
              <div
                key={page.slug}
                className="rounded-3xl border border-border bg-card/75 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{page.label}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      /{page.slug}
                    </div>
                  </div>
                  <Badge tone="warning">CMS-managed</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {page.description}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/content"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-[0_12px_30px_rgba(0,120,212,0.24)] transition hover:bg-[#106ebe]"
          >
            Open content editor
          </Link>
        </div>
      </section>
    </div>
  );
}
