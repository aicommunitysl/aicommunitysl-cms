"use client";

import {
  ChangeEvent,
  FormEvent,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import {
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ensureContentEntries,
  resourceConfigs,
  type ResourceConfig,
  type ResourceField,
} from "@/lib/resource-config";
import type { ResourceItemMap } from "@/lib/cms";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormValues = Record<string, unknown>;

function defaultPrepareValues<T>(item: T) {
  return { ...(item as Record<string, unknown>) };
}

function normalizeValue(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }
  return value ?? "";
}

function getRecordIdentifier(record: Record<string, unknown>, key: string) {
  return String(record[key] ?? "");
}

function renderField(
  field: ResourceField,
  value: unknown,
  onChange: (name: string, value: unknown) => void,
  onImageUpload: (name: string, file: File) => Promise<void>,
  imageUploadingField: string | null,
) {
  const sharedDescription = field.description ? (
    <p className="mt-2 text-xs leading-5 text-muted-foreground">
      {field.description}
    </p>
  ) : null;

  if (
    field.type === "textarea" ||
    field.type === "json" ||
    field.type === "multiline-list"
  ) {
    return (
      <div>
        <Textarea
          value={String(normalizeValue(value))}
          placeholder={field.placeholder}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
        {sharedDescription}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <Select
          value={String(normalizeValue(value))}
          onChange={(event) => onChange(field.name, event.target.value)}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {sharedDescription}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "image") {
    return (
      <div>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            value={String(normalizeValue(value))}
            placeholder={field.placeholder || "https://..."}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
          <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card px-4 text-sm font-medium text-foreground transition hover:bg-muted">
            {imageUploadingField === field.name ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Upload
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void onImageUpload(field.name, file);
                }
              }}
            />
          </label>
        </div>
        {sharedDescription}
      </div>
    );
  }

  return (
    <div>
      <Input
        type={field.type}
        value={typeof value === "boolean" ? "" : String(normalizeValue(value))}
        placeholder={field.placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(field.name, event.target.value)
        }
      />
      {sharedDescription}
    </div>
  );
}

export function ResourceManager<
  T extends ResourceItemMap[keyof ResourceItemMap],
>({
  resourceKey,
  initialItems,
  user,
}: {
  resourceKey: keyof ResourceItemMap;
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
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>(
    config.defaultValues,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadingField, setImageUploadingField] = useState<string | null>(
    null,
  );
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
    if (!deferredQuery.trim()) {
      return items;
    }

    const search = deferredQuery.toLowerCase();
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search),
    );
  }, [items, deferredQuery]);

  function openCreate() {
    setIsCreating(true);
    setEditingItem(null);
    setFormValues(config.defaultValues);
  }

  function openEdit(item: T) {
    setIsCreating(false);
    setEditingItem(item);
    const prepareValues = config.prepareFormValues || defaultPrepareValues<T>;
    setFormValues(prepareValues(item));
  }

  function closeForm() {
    setEditingItem(null);
    setIsCreating(false);
    setFormValues(config.defaultValues);
  }

  function updateValue(name: string, value: unknown) {
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  async function handleImageUpload(name: string, file: File) {
    try {
      setImageUploadingField(name);
      const payload = new FormData();
      payload.set("file", file);
      payload.set("folder", config.resource);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image.");
      }

      updateValue(name, data.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload image.",
      );
    } finally {
      setImageUploadingField(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payloadBuilder = editingItem
        ? config.getUpdatePayload
        : config.getCreatePayload;
      const payload = payloadBuilder ? payloadBuilder(formValues) : formValues;

      let response: Response;
      if (editingItem || config.resource === "content") {
        const identifier = String(
          config.resource === "content"
            ? formValues.slug
            : getRecordIdentifier(
                editingItem as unknown as Record<string, unknown>,
                config.updateIdKey || "id",
              ),
        );

        response = await fetch(`/api/cms/${config.resource}/${identifier}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(
          config.createEndpoint || `/api/cms/${config.resource}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
      }

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || `Failed to save ${config.singular}.`);
      }

      await loadItems();
      closeForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : `Failed to save ${config.singular}.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(item: T) {
    const confirmed = window.confirm(
      `Delete this ${config.singular}? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      const identifier = getRecordIdentifier(
        item as unknown as Record<string, unknown>,
        config.updateIdKey || "id",
      );
      const response = await fetch(
        `/api/cms/${config.resource}/${identifier}`,
        {
          method: "DELETE",
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || `Failed to delete ${config.singular}.`);
      }
      await loadItems();
      if (
        editingItem &&
        getRecordIdentifier(
          editingItem as unknown as Record<string, unknown>,
          config.updateIdKey || "id",
        ) === identifier
      ) {
        closeForm();
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : `Failed to delete ${config.singular}.`,
      );
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="section-shell animate-fade-up p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Module
            </div>
            <h3 className="mt-2 text-3xl font-semibold">{config.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {config.description}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-72">
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
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add {config.singular}
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-[rgba(220,38,38,0.18)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-border bg-card/80">
          <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] gap-4 border-b border-border bg-muted px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {config.columns.map((column) => (
              <div key={column.key}>{column.label}</div>
            ))}
            <div className="text-right">Actions</div>
          </div>
          <div className="scrollbar-subtle max-h-180 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 px-5 py-14 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Loading{" "}
                {config.title.toLowerCase()}...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-5 py-14 text-center text-sm text-muted-foreground">
                No {config.title.toLowerCase()} found for the current filter.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={getRecordIdentifier(
                    item as unknown as Record<string, unknown>,
                    config.updateIdKey || "id",
                  )}
                  className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] gap-4 border-b border-border px-5 py-4 text-sm text-muted-foreground last:border-b-0"
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
                  <div className="flex justify-end gap-2">
                    {canEdit ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
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

      <div className="section-shell animate-fade-up p-6 [animation-delay:120ms]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Editor
            </div>
            <h3 className="mt-2 text-2xl font-semibold">
              {editingItem
                ? `Edit ${config.singular}`
                : isCreating
                  ? `Create ${config.singular}`
                  : `Select ${config.singular}`}
            </h3>
          </div>
          {(editingItem || isCreating) && (
            <Button variant="ghost" onClick={closeForm}>
              Close
            </Button>
          )}
        </div>

        {editingItem || isCreating ? (
          <form
            className="space-y-4"
            onSubmit={(event) => void handleSubmit(event)}
          >
            {config.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {field.label}
                </label>
                {renderField(
                  field,
                  formValues[field.name],
                  updateValue,
                  handleImageUpload,
                  imageUploadingField,
                )}
              </div>
            ))}

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : null}
              {editingItem
                ? `Save ${config.singular}`
                : `Create ${config.singular}`}
            </Button>
          </form>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/60 bg-card/60 px-5 py-10 text-sm leading-6 text-muted-foreground">
            Select a row to edit it, or create a new {config.singular} if this
            module supports creation.
          </div>
        )}
      </div>
    </section>
  );
}
