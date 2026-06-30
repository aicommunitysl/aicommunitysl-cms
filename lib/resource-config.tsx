import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { contentSlugs } from "@/lib/constants";
import type { ResourceItemMap } from "@/lib/cms";
import type { UserRole } from "@/lib/types";
import { formatDate, titleCase } from "@/lib/utils";

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "url"
  | "number"
  | "date"
  | "time"
  | "checkbox"
  | "datetime-local"
  | "select"
  | "multiline-list"
  | "json"
  | "image"
  | "speaker-list"
  | "session-list"
  | "social-links";

export interface ResourceField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface ResourceColumn<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
}

export interface ResourceConfig<T> {
  resource: keyof ResourceItemMap;
  singular: string;
  title: string;
  description: string;
  fields: ResourceField[];
  columns: ResourceColumn<T>[];
  defaultValues: Record<string, unknown>;
  createEnabled?: boolean;
  editEnabled?: boolean;
  deleteEnabled?: boolean;
  restrictedTo?: UserRole[];
  createEndpoint?: string;
  updateIdKey?: string;
  getCreatePayload?: (
    values: Record<string, unknown>,
  ) => Record<string, unknown>;
  getUpdatePayload?: (
    values: Record<string, unknown>,
  ) => Record<string, unknown>;
  prepareFormValues?: (item: T) => Record<string, unknown>;
}

function parseMultiline(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
}

export interface SocialLinkEntry {
  platform: string;
  url: string;
}

export function socialLinksObjectToArray(
  obj: Record<string, string> | undefined | null,
): SocialLinkEntry[] {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).map(([platform, url]) => ({ platform, url }));
}

export function socialLinksArrayToObject(
  entries: SocialLinkEntry[],
): Record<string, string> {
  if (!Array.isArray(entries)) return {};
  const obj: Record<string, string> = {};
  for (const { platform, url } of entries) {
    if (platform.trim()) obj[platform.trim()] = url;
  }
  return obj;
}

function parseJSONValue(value: unknown, fallback: unknown) {
  if (typeof value !== "string") {
    return fallback;
  }

  if (!value.trim()) {
    return fallback;
  }

  return JSON.parse(value) as unknown;
}

function stringifyJSON(value: unknown) {
  if (!value) {
    return "";
  }

  return JSON.stringify(value, null, 2);
}

function contentDefaults() {
  return contentSlugs.map((entry) => ({
    ...entry,
    sections: [],
  }));
}

export type ConfiguredResourceKey = Exclude<
  keyof ResourceItemMap,
  "event-tasks"
>;

export const resourceConfigs: {
  [K in ConfiguredResourceKey]: ResourceConfig<ResourceItemMap[K]>;
} = {
  events: {
    resource: "events",
    singular: "event",
    title: "Events",
    description:
      "Create, publish, archive, and maintain event schedules, speakers, and sessions.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
      {
        name: "event_date",
        label: "Event date",
        type: "date",
        required: true,
      },
      {
        name: "event_time",
        label: "Event time",
        type: "time",
        required: true,
      },
      { name: "location", label: "Location", type: "text", required: true },
      {
        name: "event_type",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { label: "Workshop", value: "workshop" },
          { label: "Conference", value: "conference" },
          { label: "Meetup", value: "meetup" },
          { label: "Panel", value: "panel" },
          { label: "Hackathon", value: "hackathon" },
          { label: "Bootcamp", value: "bootcamp" },
        ],
      },
      { name: "image_url", label: "Image", type: "image" },
      { name: "registration_url", label: "Registration URL", type: "url" },
      {
        name: "tags",
        label: "Tags",
        type: "multiline-list",
        description: "One tag per line.",
      },
      { name: "max_participants", label: "Max participants", type: "number" },
      { name: "is_published", label: "Published", type: "checkbox" },
      {
        name: "speakers",
        label: "Speakers",
        type: "speaker-list",
      },
      {
        name: "sessions",
        label: "Sessions",
        type: "session-list",
      },
    ],
    columns: [
      {
        key: "title",
        label: "Event",
        render: (item) => (
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="text-xs text-(--text-muted)">{item.event_type}</div>
          </div>
        ),
      },
      { key: "date", label: "Date", render: (item) => formatDate(item.date) },
      {
        key: "status",
        label: "Status",
        render: (item) => (
          <Badge tone={item.is_published ? "success" : "warning"}>
            {item.is_published ? "Published" : "Draft"}
          </Badge>
        ),
      },
      { key: "location", label: "Location", render: (item) => item.location },
    ],
    defaultValues: {
      title: "",
      description: "",
      event_date: "",
      event_time: "",
      location: "",
      event_type: "meetup",
      image_url: "",
      registration_url: "",
      tags: "",
      max_participants: "",
      is_published: false,
      speakers: [],
      sessions: [],
    },
    getCreatePayload: (values) => ({
      ...values,
      date:
        values.event_date && values.event_time
          ? `${String(values.event_date)}T${String(values.event_time)}:00`
          : values.event_date,
      event_date: undefined,
      event_time: undefined,
      tags: parseMultiline(values.tags),
      max_participants: values.max_participants
        ? Number(values.max_participants)
        : undefined,
      speakers: Array.isArray(values.speakers) ? values.speakers : [],
      sessions: Array.isArray(values.sessions) ? values.sessions : [],
    }),
    getUpdatePayload: (values) => ({
      ...values,
      date:
        values.event_date && values.event_time
          ? `${String(values.event_date)}T${String(values.event_time)}:00`
          : values.event_date,
      event_date: undefined,
      event_time: undefined,
      tags: parseMultiline(values.tags),
      max_participants: values.max_participants
        ? Number(values.max_participants)
        : null,
      speakers: Array.isArray(values.speakers) ? values.speakers : [],
      sessions: Array.isArray(values.sessions) ? values.sessions : [],
    }),
    prepareFormValues: (item) => ({
      ...item,
      event_date: item.date ? item.date.slice(0, 10) : "",
      event_time: item.date ? item.date.slice(11, 16) : "",
      tags: item.tags.join("\n"),
      max_participants: item.max_participants ?? "",
      speakers: item.speakers ?? [],
      sessions: item.sessions ?? [],
    }),
  },
  partners: {
    resource: "partners",
    singular: "partner",
    title: "Partners",
    description:
      "Manage local and global partner listings, logos, descriptions, and ordering.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "logo_url", label: "Logo", type: "image", required: true },
      {
        name: "partner_type",
        label: "Partner tier",
        type: "select",
        required: true,
        options: [
          { label: "Platinum", value: "platinum" },
          { label: "Gold", value: "gold" },
          { label: "Silver", value: "silver" },
          { label: "Community", value: "community" },
        ],
      },
      { name: "description", label: "Description", type: "textarea" },
      { name: "website_url", label: "Website URL", type: "url" },
      { name: "display_order", label: "Display order", type: "number" },
      { name: "is_active", label: "Active", type: "checkbox" },
    ],
    columns: [
      {
        key: "name",
        label: "Partner",
        render: (item) => (
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-(--text-muted)">
              {titleCase(item.partner_type)}
            </div>
          </div>
        ),
      },
      {
        key: "active",
        label: "Status",
        render: (item) => (
          <Badge tone={item.is_active ? "success" : "warning"}>
            {item.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      { key: "order", label: "Order", render: (item) => item.display_order },
      {
        key: "updated",
        label: "Updated",
        render: (item) => formatDate(item.updated_at),
      },
    ],
    defaultValues: {
      name: "",
      logo_url: "",
      partner_type: "community",
      description: "",
      website_url: "",
      display_order: 0,
      is_active: true,
    },
    getCreatePayload: (values) => ({
      ...values,
      display_order: Number(values.display_order || 0),
    }),
    getUpdatePayload: (values) => ({
      ...values,
      display_order: Number(values.display_order || 0),
    }),
  },
  team: {
    resource: "team",
    singular: "team member",
    title: "Team Members",
    description:
      "Maintain the public leadership and contributor roster, roles, biographies, and ordering.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      {
        name: "team_category",
        label: "Category",
        type: "text",
        required: true,
      },
      {
        name: "image_url",
        label: "Profile image",
        type: "image",
        required: true,
      },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "email", label: "Email", type: "email" },
      { name: "display_order", label: "Display order", type: "number" },
      { name: "is_active", label: "Active", type: "checkbox" },
      {
        name: "social_links",
        label: "Social links",
        type: "social-links",
      },
    ],
    columns: [
      {
        key: "name",
        label: "Member",
        render: (item) => (
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-(--text-muted)">{item.role}</div>
          </div>
        ),
      },
      {
        key: "category",
        label: "Category",
        render: (item) => titleCase(item.team_category),
      },
      {
        key: "status",
        label: "Status",
        render: (item) => (
          <Badge tone={item.is_active ? "success" : "warning"}>
            {item.is_active ? "Active" : "Hidden"}
          </Badge>
        ),
      },
      { key: "order", label: "Order", render: (item) => item.display_order },
    ],
    defaultValues: {
      name: "",
      role: "",
      team_category: "core",
      image_url: "",
      bio: "",
      email: "",
      display_order: 0,
      is_active: true,
      social_links: [],
    },
    getCreatePayload: (values) => ({
      ...values,
      display_order: Number(values.display_order || 0),
      social_links: socialLinksArrayToObject(
        values.social_links as SocialLinkEntry[],
      ),
    }),
    getUpdatePayload: (values) => ({
      ...values,
      display_order: Number(values.display_order || 0),
      social_links: socialLinksArrayToObject(
        values.social_links as SocialLinkEntry[],
      ),
    }),
    prepareFormValues: (item) => ({
      ...item,
      social_links: socialLinksObjectToArray(
        item.social_links as Record<string, string> | undefined,
      ),
    }),
  },
  milestones: {
    resource: "milestones",
    singular: "milestone",
    title: "Milestones",
    description:
      "Keep the community timeline current with published achievements and historical highlights.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
      { name: "date", label: "Date", type: "datetime-local", required: true },
      { name: "milestone_type", label: "Type", type: "text", required: true },
      { name: "image_url", label: "Image", type: "image" },
      { name: "link_url", label: "Link URL", type: "url" },
      { name: "is_published", label: "Published", type: "checkbox" },
    ],
    columns: [
      {
        key: "title",
        label: "Milestone",
        render: (item) => (
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="text-xs text-(--text-muted)">
              {titleCase(item.milestone_type)}
            </div>
          </div>
        ),
      },
      { key: "date", label: "Date", render: (item) => formatDate(item.date) },
      {
        key: "status",
        label: "Status",
        render: (item) => (
          <Badge tone={item.is_published ? "success" : "warning"}>
            {item.is_published ? "Published" : "Hidden"}
          </Badge>
        ),
      },
      {
        key: "updated",
        label: "Updated",
        render: (item) => formatDate(item.updated_at),
      },
    ],
    defaultValues: {
      title: "",
      description: "",
      date: "",
      milestone_type: "community",
      image_url: "",
      link_url: "",
      is_published: true,
    },
    getCreatePayload: (values) => ({ ...values, date: values.date }),
    getUpdatePayload: (values) => ({ ...values, date: values.date }),
    prepareFormValues: (item) => ({
      ...item,
      date: item.date ? item.date.slice(0, 16) : "",
    }),
  },
  content: {
    resource: "content",
    singular: "page",
    title: "Static Content",
    description:
      "Manage the About page plus policy pages that power the public website.",
    fields: [
      {
        name: "slug",
        label: "Slug",
        type: "select",
        required: true,
        options: contentSlugs.map((entry) => ({
          label: entry.label,
          value: entry.slug,
        })),
      },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "hero_title", label: "Hero title", type: "text" },
      { name: "hero_body", label: "Hero body", type: "textarea" },
      { name: "seo_title", label: "SEO title", type: "text" },
      { name: "seo_description", label: "SEO description", type: "textarea" },
      { name: "is_published", label: "Published", type: "checkbox" },
      {
        name: "sections",
        label: "Sections JSON",
        type: "json",
        description: '[{"title":"Mission","body":"...","items":["Item 1"]}]',
      },
    ],
    columns: [
      {
        key: "title",
        label: "Page",
        render: (item) => (
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="text-xs text-(--text-muted)">/{item.slug}</div>
          </div>
        ),
      },
      {
        key: "published",
        label: "Status",
        render: (item) => (
          <Badge tone={item.is_published ? "success" : "warning"}>
            {item.is_published ? "Published" : "Draft"}
          </Badge>
        ),
      },
      {
        key: "updatedBy",
        label: "Updated by",
        render: (item) => item.updated_by || "Unknown",
      },
      {
        key: "updated",
        label: "Updated",
        render: (item) => formatDate(item.updated_at),
      },
    ],
    defaultValues: {
      slug: "about",
      title: "",
      summary: "",
      hero_title: "",
      hero_body: "",
      seo_title: "",
      seo_description: "",
      is_published: true,
      sections: "[]",
    },
    createEnabled: false,
    deleteEnabled: false,
    getUpdatePayload: (values) => {
      const payload = {
        ...values,
        sections: parseJSONValue(values.sections, []),
      } as Record<string, unknown>;
      delete payload.slug;
      return payload;
    },
    prepareFormValues: (item) => ({
      ...item,
      sections: stringifyJSON(item.sections),
    }),
  },
  contact: {
    resource: "contact",
    singular: "message",
    title: "Contact Messages",
    description:
      "Review submissions from the public contact form and track their resolution state.",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "subject", label: "Subject", type: "text" },
      { name: "message", label: "Message", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "New", value: "new" },
          { label: "In progress", value: "in_progress" },
          { label: "Resolved", value: "resolved" },
          { label: "Archived", value: "archived" },
        ],
      },
      { name: "notes", label: "Internal notes", type: "textarea" },
    ],
    columns: [
      {
        key: "subject",
        label: "Message",
        render: (item) => (
          <div>
            <div className="font-medium">{item.subject}</div>
            <div className="text-xs text-(--text-muted)">
              {item.name} · {item.email}
            </div>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (item) => (
          <Badge
            tone={
              item.status === "resolved"
                ? "success"
                : item.status === "new"
                  ? "warning"
                  : "info"
            }
          >
            {titleCase(item.status)}
          </Badge>
        ),
      },
      {
        key: "delivery",
        label: "Email delivery",
        render: (item) => (
          <Badge
            tone={
              item.email_sent
                ? "success"
                : item.email_error
                  ? "danger"
                  : "default"
            }
          >
            {item.email_sent ? "Sent" : item.email_error ? "Failed" : "Pending"}
          </Badge>
        ),
      },
      {
        key: "created",
        label: "Received",
        render: (item) => formatDate(item.created_at),
      },
    ],
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      status: "new",
      notes: "",
    },
    createEnabled: false,
    getUpdatePayload: (values) => ({
      status: values.status,
      notes: values.notes,
    }),
    deleteEnabled: true,
  },
  social: {
    resource: "social",
    singular: "social link",
    title: "Social Links",
    description:
      "Manage the public community social and external link directory.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "url", label: "URL", type: "url", required: true },
      {
        name: "icon",
        label: "Icon key",
        type: "text",
        required: true,
        description: "Example: FaLinkedin, FaGithub",
      },
      { name: "handler", label: "Handle", type: "text" },
      { name: "display_order", label: "Display order", type: "number" },
      { name: "is_active", label: "Active", type: "checkbox" },
    ],
    columns: [
      {
        key: "name",
        label: "Link",
        render: (item) => (
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-(--text-muted)">
              {item.handler || item.url}
            </div>
          </div>
        ),
      },
      { key: "icon", label: "Icon", render: (item) => item.icon },
      {
        key: "status",
        label: "Status",
        render: (item) => (
          <Badge tone={item.is_active ? "success" : "warning"}>
            {item.is_active ? "Active" : "Hidden"}
          </Badge>
        ),
      },
      { key: "order", label: "Order", render: (item) => item.display_order },
    ],
    defaultValues: {
      name: "",
      url: "",
      icon: "",
      handler: "",
      display_order: 0,
      is_active: true,
    },
    getCreatePayload: (values) => ({
      ...values,
      display_order: Number(values.display_order || 0),
    }),
    getUpdatePayload: (values) => ({
      ...values,
      display_order: Number(values.display_order || 0),
    }),
  },
  speakers: {
    resource: "speakers",
    singular: "speaker application",
    title: "Speaker Applications",
    description:
      "Review incoming speaker submissions and move them through the selection workflow.",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "talk_title", label: "Talk title", type: "text" },
      { name: "talk_description", label: "Talk description", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Under review", value: "under_review" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Scheduled", value: "scheduled" },
        ],
      },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "reviewed_by", label: "Reviewed by", type: "text" },
      { name: "scheduled_event_id", label: "Scheduled event ID", type: "text" },
    ],
    columns: [
      {
        key: "talk",
        label: "Proposal",
        render: (item) => (
          <div>
            <div className="font-medium">{item.talk_title}</div>
            <div className="text-xs text-(--text-muted)">
              {item.name} · {item.email}
            </div>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (item) => (
          <Badge
            tone={
              item.status === "approved" || item.status === "scheduled"
                ? "success"
                : item.status === "rejected"
                  ? "danger"
                  : "warning"
            }
          >
            {titleCase(item.status)}
          </Badge>
        ),
      },
      {
        key: "expertise",
        label: "Expertise",
        render: (item) => item.expertise_areas.join(", "),
      },
      {
        key: "created",
        label: "Submitted",
        render: (item) => formatDate(item.created_at),
      },
    ],
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      talk_title: "",
      talk_description: "",
      status: "pending",
      notes: "",
      reviewed_by: "",
      scheduled_event_id: "",
    },
    createEnabled: false,
    getUpdatePayload: (values) => ({
      status: values.status,
      notes: values.notes,
      reviewed_by: values.reviewed_by,
      scheduled_event_id: values.scheduled_event_id || null,
    }),
  },
  users: {
    resource: "users",
    singular: "user",
    title: "User Access",
    description:
      "Manage CMS administrators and editors with role-based access control.",
    restrictedTo: ["admin"],
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "text", required: true },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        options: [
          { label: "Admin", value: "admin" },
          { label: "Editor", value: "editor" },
        ],
      },
    ],
    columns: [
      { key: "email", label: "User", render: (item) => item.email },
      {
        key: "role",
        label: "Role",
        render: (item) => (
          <Badge tone={item.role === "admin" ? "warning" : "info"}>
            {titleCase(item.role)}
          </Badge>
        ),
      },
      {
        key: "created",
        label: "Created",
        render: (item) => formatDate(item.created_at),
      },
      {
        key: "updated",
        label: "Updated",
        render: (item) => formatDate(item.updated_at),
      },
    ],
    defaultValues: { email: "", password: "", role: "editor" },
    editEnabled: false,
    deleteEnabled: false,
  },
};

export function isConfiguredResourceKey(
  value: string,
): value is ConfiguredResourceKey {
  return value in resourceConfigs;
}

export function ensureContentEntries(items: ResourceItemMap["content"][]) {
  const existing = new Map(items.map((item) => [item.slug, item]));
  return contentDefaults().map((entry) => {
    const found = existing.get(entry.slug);
    return (
      found || {
        id: entry.slug,
        slug: entry.slug,
        title: entry.label,
        summary: entry.description,
        hero_title: entry.label,
        hero_body: "",
        seo_title: entry.label,
        seo_description: entry.description,
        is_published: false,
        sections: [],
        updated_by: undefined,
        created_at: new Date(0).toISOString(),
        updated_at: new Date(0).toISOString(),
      }
    );
  });
}
