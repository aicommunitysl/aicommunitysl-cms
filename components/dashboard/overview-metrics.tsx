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
    <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <div className="section-shell animate-fade-up p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Overview
            </div>
            <h3 className="mt-2 text-2xl font-semibold">Release foundation</h3>
          </div>
          <Badge tone="info">v1.0.0 scope</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.resource}
                className="rounded-3xl border border-border bg-card/80 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge tone={card.tone}>{card.label}</Badge>
                </div>
                <div className="mt-6 text-4xl font-semibold">
                  {counts[card.resource] ?? "--"}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {card.resource === "contact"
                    ? "Tracked submissions and message handling."
                    : `Records available in the ${card.label.toLowerCase()} module.`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-shell animate-fade-up p-6 [animation-delay:120ms]">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Operational notes
        </div>
        <h3 className="mt-2 text-xl font-semibold">What this CMS covers</h3>
        <div className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Authenticated admin workspace with editor and admin roles, secure
            cookie-backed sessions, and protected routes.
          </p>
          <p>
            API-backed CRUD for events, partners, team, milestones, social
            links, contact submissions, speaker applications, and static pages.
          </p>
          <p>
            Proxy routes keep the FastAPI JWT out of the browser while still
            using the backend as the single source of truth.
          </p>
        </div>
        {error ? (
          <div className="mt-6 rounded-2xl border border-[rgba(220,38,38,0.18)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
