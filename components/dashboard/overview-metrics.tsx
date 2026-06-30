import { CalendarDays, Inbox, KanbanSquare, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ResourceItemMap } from "@/lib/cms";
import { getResourceItems } from "@/lib/server-cms";

type OverviewMetricResource = keyof Pick<
  ResourceItemMap,
  "events" | "team" | "event-tasks" | "contact"
>;

const cards: Array<{
  resource: OverviewMetricResource;
  label: string;
  icon: typeof CalendarDays;
  tone: "info" | "success" | "warning" | "default";
}> = [
  {
    resource: "events",
    label: "Events",
    icon: CalendarDays,
    tone: "info" as const,
  },
  {
    resource: "team",
    label: "Team Members",
    icon: Users,
    tone: "success" as const,
  },
  {
    resource: "event-tasks",
    label: "Event Tasks",
    icon: KanbanSquare,
    tone: "warning" as const,
  },
  {
    resource: "contact",
    label: "Contact Messages",
    icon: Inbox,
    tone: "default" as const,
  },
];

export async function OverviewMetrics() {
  let counts: Record<string, number> = {};
  let error: string | null = null;

  try {
    const results = await Promise.all(
      cards.map(async (card) => {
        const items = await getResourceItems(card.resource);
        return [card.resource, items.length] as const;
      }),
    );

    counts = Object.fromEntries(results);
  } catch (loadError) {
    error =
      loadError instanceof Error
        ? loadError.message
        : "Failed to load dashboard metrics.";
  }

  return (
    <section className="section-shell animate-fade-up p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Overview
          </div>
          <h3 className="mt-1.5 text-xl font-semibold">Platform metrics</h3>
        </div>
        <Badge tone="info">v1.0.0</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.resource}
              className="rounded-2xl border border-border bg-card/80 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <Badge tone={card.tone}>{card.label}</Badge>
              </div>
              <div className="mt-4 text-3xl font-semibold">
                {counts[card.resource] ?? "--"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {card.resource === "contact"
                  ? "Tracked submissions"
                  : card.resource === "event-tasks"
                    ? "Across all events"
                    : `${card.label} records`}
              </p>
            </div>
          );
        })}
      </div>
      {error ? (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
    </section>
  );
}
