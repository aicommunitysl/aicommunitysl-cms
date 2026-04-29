"use client";

import { useEffect, useState } from "react";
import { CalendarDays, FileText, Inbox, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ListEnvelope } from "@/lib/types";

const cards = [
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
    resource: "content",
    label: "Managed Pages",
    icon: FileText,
    tone: "warning" as const,
  },
  {
    resource: "contact",
    label: "Contact Messages",
    icon: Inbox,
    tone: "default" as const,
  },
];

export function OverviewMetrics() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const results = await Promise.all(
          cards.map(async (card) => {
            const response = await fetch(`/api/cms/${card.resource}`);
            const data = (await response.json()) as ListEnvelope<unknown> & {
              error?: string;
            };
            if (!response.ok) {
              throw new Error(data.error || `Failed to load ${card.label}`);
            }
            return [card.resource, data.total] as const;
          }),
        );

        if (!active) {
          return;
        }

        setCounts(Object.fromEntries(results));
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load dashboard metrics.",
        );
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

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
