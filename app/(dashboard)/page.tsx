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
    <div className="space-y-4">
      <OverviewMetrics />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="section-shell animate-fade-up p-5 [animation-delay:140ms]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Quick access
              </div>
              <h3 className="mt-1.5 text-xl font-semibold">
                Admin modules
              </h3>
            </div>
            <Badge tone="info">{visibleNavigation.length} modules</Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-border bg-card/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="mt-3 text-sm font-semibold">{item.label}</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Manage {item.label.toLowerCase()} content via the API.
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="section-shell animate-fade-up p-5 [animation-delay:220ms]">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Content focus
          </div>
          <h3 className="mt-1.5 text-xl font-semibold">Static pages</h3>
          <div className="mt-4 space-y-3">
            {contentSlugs.map((page) => (
              <div
                key={page.slug}
                className="rounded-2xl border border-border bg-card/75 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{page.label}</div>
                    <div className="mt-0.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      /{page.slug}
                    </div>
                  </div>
                  <Badge tone="warning">CMS-managed</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {page.description}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/content"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Open content editor
          </Link>
        </div>
      </section>
    </div>
  );
}
