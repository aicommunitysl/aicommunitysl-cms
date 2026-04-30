"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  resourceConfigs,
  type ResourceConfig,
  type ResourceField,
} from "@/lib/resource-config";
import type { ResourceItemMap } from "@/lib/cms";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormValues = Record<string, unknown>;
type ResourceRecord = Record<string, unknown>;
type EditorMode = "create" | "edit";

interface SpeakerEntry {
  name: string;
  role?: string;
  image_url?: string;
}

interface SessionEntry {
  title: string;
  time: string;
  speaker?: string;
  description?: string;
}

function SpeakerListField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (entries: SpeakerEntry[]) => void;
}) {
  const entries: SpeakerEntry[] = Array.isArray(value)
    ? (value as SpeakerEntry[])
    : [];

  function updateEntry(index: number, field: keyof SpeakerEntry, val: string) {
    const next = entries.map((e, i) =>
      i === index ? { ...e, [field]: val } : e,
    );
    onChange(next);
  }

  function addEntry() {
    onChange([...entries, { name: "", role: "", image_url: "" }]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="relative rounded-2xl border border-border/60 bg-card/60 p-4"
        >
          <button
            type="button"
            onClick={() => removeEntry(index)}
            className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid gap-3 pr-8 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={entry.name}
                placeholder="Speaker name"
                onChange={(e) => updateEntry(index, "name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Role
              </label>
              <Input
                value={entry.role ?? ""}
                placeholder="e.g. Keynote Speaker"
                onChange={(e) => updateEntry(index, "role", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground">
                Image URL
              </label>
              <Input
                value={entry.image_url ?? ""}
                placeholder="https://..."
                onChange={(e) =>
                  updateEntry(index, "image_url", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Add speaker
      </button>
    </div>
  );
}

function SessionListField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (entries: SessionEntry[]) => void;
}) {
  const entries: SessionEntry[] = Array.isArray(value)
    ? (value as SessionEntry[])
    : [];

  function updateEntry(index: number, field: keyof SessionEntry, val: string) {
    const next = entries.map((e, i) =>
      i === index ? { ...e, [field]: val } : e,
    );
    onChange(next);
  }

  function addEntry() {
    onChange([
      ...entries,
      { title: "", time: "", speaker: "", description: "" },
    ]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  function moveEntry(index: number, direction: "up" | "down") {
    const next = [...entries];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="relative rounded-2xl border border-border/60 bg-card/60 p-4"
        >
          <div className="absolute right-3 top-3 flex items-center gap-0.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => moveEntry(index, "up")}
              className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={index === entries.length - 1}
              onClick={() => moveEntry(index, "down")}
              className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => removeEntry(index)}
              className="rounded-lg p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 pr-24 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={entry.title}
                placeholder="Session title"
                onChange={(e) => updateEntry(index, "title", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Time <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={entry.time}
                placeholder="e.g. 09:00"
                onChange={(e) => updateEntry(index, "time", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Speaker
              </label>
              <Input
                value={entry.speaker ?? ""}
                placeholder="Speaker name"
                onChange={(e) => updateEntry(index, "speaker", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Input
                value={entry.description ?? ""}
                placeholder="Short description"
                onChange={(e) =>
                  updateEntry(index, "description", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Add session
      </button>
    </div>
  );
}

function defaultPrepareValues(item: ResourceRecord) {
  return { ...item };
}

function normalizeValue(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  return value ?? "";
}

function fieldSpanClass(field: ResourceField) {
  return field.type === "textarea" ||
    field.type === "json" ||
    field.type === "multiline-list" ||
    field.type === "image" ||
    field.type === "speaker-list" ||
    field.type === "session-list"
    ? "md:col-span-2"
    : "";
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
          required={field.required}
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
          required={field.required}
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
            required={field.required}
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

  if (field.type === "speaker-list") {
    return (
      <SpeakerListField
        value={value}
        onChange={(entries) => onChange(field.name, entries)}
      />
    );
  }

  if (field.type === "session-list") {
    return (
      <SessionListField
        value={value}
        onChange={(entries) => onChange(field.name, entries)}
      />
    );
  }

  return (
    <div>
      <Input
        required={field.required}
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

export function ResourceEditor({
  resourceKey,
  user,
  mode,
  recordId,
  initialItem,
}: {
  resourceKey: keyof ResourceItemMap;
  user: SessionUser;
  mode: EditorMode;
  recordId?: string;
  initialItem?: ResourceItemMap[keyof ResourceItemMap];
}) {
  const router = useRouter();
  const config = resourceConfigs[
    resourceKey
  ] as unknown as ResourceConfig<ResourceRecord>;
  const isEditing = mode === "edit";
  const baseHref = `/${config.resource}`;
  const [formValues, setFormValues] = useState<FormValues>(() => {
    if (isEditing && initialItem) {
      const prepareValues = config.prepareFormValues || defaultPrepareValues;
      return prepareValues(initialItem as unknown as ResourceRecord);
    }

    return { ...config.defaultValues };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadingField, setImageUploadingField] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  function updateValue(name: string, value: unknown) {
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  async function handleImageUpload(name: string, file: File) {
    try {
      setImageUploadingField(name);
      setError(null);

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
      if (isEditing && !recordId) {
        throw new Error("Missing record identifier.");
      }

      const payloadBuilder = isEditing
        ? config.getUpdatePayload
        : config.getCreatePayload;
      const payload = payloadBuilder ? payloadBuilder(formValues) : formValues;

      const response = await fetch(
        isEditing
          ? `/api/cms/${config.resource}/${recordId}`
          : config.createEndpoint || `/api/cms/${config.resource}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${isEditing ? "update" : "create"} ${config.singular}.`,
        );
      }

      toast.success(
        isEditing
          ? `${config.singular.charAt(0).toUpperCase() + config.singular.slice(1)} updated successfully!`
          : `${config.singular.charAt(0).toUpperCase() + config.singular.slice(1)} created successfully!`,
      );
      router.push(baseHref);
      router.refresh();
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

  return (
    <div className="mx-auto w-full max-w-5xl">
      <section className="section-shell animate-fade-up overflow-hidden">
        <div className="border-b border-border/60 px-5 py-4 sm:px-6">
          <Link
            href={baseHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {config.title}
          </Link>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Editor
              </div>
              <h1 className="mt-1.5 text-2xl font-semibold">
                {isEditing
                  ? `Edit ${config.singular}`
                  : `Create ${config.singular}`}
              </h1>
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">
                {config.description}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {error ? (
            <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => void handleSubmit(event)}
          >
            {config.fields.map((field) => (
              <div
                key={field.name}
                className={cn("space-y-2", fieldSpanClass(field))}
              >
                {field.type === "checkbox" ? (
                  <>
                    <span
                      className="block text-sm font-medium text-foreground"
                      aria-hidden
                    >
                      &nbsp;
                    </span>
                    {renderField(
                      field,
                      formValues[field.name],
                      updateValue,
                      handleImageUpload,
                      imageUploadingField,
                    )}
                  </>
                ) : field.type === "speaker-list" ||
                  field.type === "session-list" ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            ))}

            <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-5 md:col-span-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => router.push(baseHref)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="sm:min-w-40"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : null}
                {isEditing
                  ? `Save ${config.singular}`
                  : `Create ${config.singular}`}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
