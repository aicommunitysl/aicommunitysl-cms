"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { Button, buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type ConfiguredResourceKey,
  ensureContentEntries,
  resourceConfigs,
  type ResourceConfig,
} from "@/lib/resource-config";
import type { ResourceItemMap } from "@/lib/cms";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

function getRecordIdentifier(record: Record<string, unknown>, key: string) {
  return String(record[key] ?? "");
}

function getEditHref(
  resourceKey: ConfiguredResourceKey,
  item: Record<string, unknown>,
  config: ResourceConfig<Record<string, unknown>>,
): string {
  const idKey = resourceKey === "content" ? "slug" : config.updateIdKey || "id";
  const id = getRecordIdentifier(item, idKey);
  return `/manage/${resourceKey}/${id}`;
}

export function ResourceManager<
  T extends ResourceItemMap[ConfiguredResourceKey],
>({
  resourceKey,
  initialItems,
  user,
}: {
  resourceKey: ConfiguredResourceKey;
  initialItems: T[];
  user: SessionUser;
}) {
  const config = resourceConfigs[resourceKey] as ResourceConfig<T>;
  const [items, setItems] = useState<T[]>(() =>
    config.resource === "content"
      ? (ensureContentEntries(
          initialItems as ResourceItemMap["content"][],
        ) as T[])
      : initialItems,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const canCreate =
    config.createEnabled !== false &&
    (!config.restrictedTo || config.restrictedTo.includes(user.role));
  const canEdit =
    config.editEnabled !== false &&
    (!config.restrictedTo || config.restrictedTo.includes(user.role));
  const canDelete =
    config.deleteEnabled !== false &&
    (!config.restrictedTo || config.restrictedTo.includes(user.role));

  async function fetchItems() {
    try {
      const response = await fetch(`/api/cms/${config.resource}`);
      const data = (await response.json()) as { items?: T[]; error?: string };
      if (!response.ok) {
        throw new Error(
          data.error || `Failed to load ${config.title.toLowerCase()}.`,
        );
      }
      const nextItems =
        config.resource === "content"
          ? (ensureContentEntries(
              (data.items || []) as ResourceItemMap["content"][],
            ) as T[])
          : data.items || [];
      setItems(nextItems);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : `Failed to load ${config.title.toLowerCase()}.`,
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadItems() {
    setIsLoading(true);
    setError(null);
    await fetchItems();
  }

  const filteredItems = useMemo(() => {
    if (!deferredQuery.trim()) return items;
    const search = deferredQuery.toLowerCase();
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search),
    );
  }, [items, deferredQuery]);

  async function handleDelete(item: T) {
    const confirmed = window.confirm(
      `Delete this ${config.singular}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setError(null);
      const identifier = getRecordIdentifier(
        item as unknown as Record<string, unknown>,
        config.updateIdKey || "id",
      );
      const response = await fetch(
        `/api/cms/${config.resource}/${identifier}`,
        { method: "DELETE" },
      );
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || `Failed to delete ${config.singular}.`);
      }
      await loadItems();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : `Failed to delete ${config.singular}.`,
      );
    }
  }

  return (
    <section className="section-shell animate-fade-up p-5">
      <div className="mb-5 space-y-4">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Module
          </div>
          <h3 className="mt-1.5 text-2xl font-semibold">{config.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {config.description}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-11"
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={() => void loadItems()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          {canCreate ? (
            <Link
              href={`/manage/${resourceKey}/new`}
              className={buttonClasses()}
            >
              <Plus className="h-4 w-4" />
              Add {config.singular}
            </Link>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
        <div className="scrollbar-subtle overflow-x-auto">
          <div className="min-w-190">
            <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] gap-3 border-b border-border bg-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {config.columns.map((column) => (
                <div key={column.key}>{column.label}</div>
              ))}
              <div className="text-right">Actions</div>
            </div>
            <div className="scrollbar-subtle max-h-128 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 px-4 py-12 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Loading{" "}
                  {config.title.toLowerCase()}...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No {config.title.toLowerCase()} found for the current filter.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={getRecordIdentifier(
                      item as unknown as Record<string, unknown>,
                      config.updateIdKey || "id",
                    )}
                    className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] gap-3 border-b border-border px-4 py-3.5 text-sm text-muted-foreground last:border-b-0"
                  >
                    {config.columns.map((column) => (
                      <div
                        key={column.key}
                        className={cn(
                          column.key === "title" ||
                            column.key === "subject" ||
                            column.key === "talk" ||
                            column.key === "name"
                            ? "min-w-0"
                            : "",
                        )}
                      >
                        {column.render(item)}
                      </div>
                    ))}
                    <div className="flex flex-wrap justify-end gap-2">
                      {canEdit ? (
                        <Link
                          href={getEditHref(
                            resourceKey,
                            item as unknown as Record<string, unknown>,
                            config as unknown as ResourceConfig<
                              Record<string, unknown>
                            >,
                          )}
                          className={buttonClasses("secondary", "sm")}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      ) : null}
                      {canDelete ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-[rgba(220,38,38,0.08)] hover:text-destructive"
                          onClick={() => void handleDelete(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
