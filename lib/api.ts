import { serverEnv } from "@/lib/env";
import type {
  EventTaskItem,
  EventTaskListResponse,
  SubTaskItem,
} from "@/lib/types";

interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: BodyInit | object;
  searchParams?: URLSearchParams;
}

export const resourcePathMap: Record<string, string> = {
  events: "/api/v1/events",
  partners: "/api/v1/partners",
  team: "/api/v1/team",
  milestones: "/api/v1/milestones",
  content: "/api/v1/content",
  contact: "/api/v1/contact",
  social: "/api/v1/social",
  speakers: "/api/v1/speakers",
  users: "/api/v1/users",
  "event-tasks": "/api/v1/event-tasks",
};

function buildHeaders(body?: BodyInit | object, token?: string) {
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body && !(body instanceof FormData) && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

function normalizeBody(body?: BodyInit | object) {
  if (!body) {
    return undefined;
  }

  if (body instanceof FormData || typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
) {
  const search = options.searchParams?.toString();
  const url = `${serverEnv.API_BASE_URL}${path}${search ? `?${search}` : ""}`;
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.body, options.token),
    body: normalizeBody(options.body),
    cache: options.cache ?? "no-store",
  });

  if (!response.ok) {
    const fallbackMessage = `${response.status} ${response.statusText}`;
    const errorData = await response
      .json()
      .catch(() => ({ detail: fallbackMessage }));
    throw new Error(errorData.detail || fallbackMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getResourcePath(resource: string) {
  const resolved = resourcePathMap[resource];
  if (!resolved) {
    throw new Error(`Unknown CMS resource: ${resource}`);
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// Event Tasks API
// ---------------------------------------------------------------------------

export const EVENT_TASKS_PATH = "/api/v1/event-tasks";

export async function fetchEventTasks(
  token: string,
  filters: {
    event_id?: string;
    status?: string;
    priority?: string;
    assignee?: string;
  } = {},
): Promise<EventTaskListResponse> {
  const params = new URLSearchParams();
  if (filters.event_id) params.set("event_id", filters.event_id);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.assignee) params.set("assignee", filters.assignee);
  params.set("limit", "200");
  return apiRequest<EventTaskListResponse>(EVENT_TASKS_PATH, {
    token,
    searchParams: params,
  });
}

async function proxyFetch<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (response.status === 204) return undefined as T;
  const data = (await response.json()) as { error?: string } & Partial<T>;
  if (!response.ok)
    throw new Error(
      (data as { error?: string }).error ??
        `${response.status} ${response.statusText}`,
    );
  return data as T;
}

export async function createEventTask(
  payload: Omit<EventTaskItem, "id" | "created_at" | "updated_at">,
): Promise<EventTaskItem> {
  return proxyFetch<EventTaskItem>("/api/cms/event-tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateEventTask(
  taskId: string,
  payload: Partial<Omit<EventTaskItem, "id" | "created_at" | "updated_at">>,
): Promise<EventTaskItem> {
  return proxyFetch<EventTaskItem>(`/api/cms/event-tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: string,
): Promise<EventTaskItem> {
  return proxyFetch<EventTaskItem>(
    `/api/cms/event-tasks/${taskId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    },
  );
}

export async function deleteEventTask(taskId: string): Promise<void> {
  return proxyFetch<void>(`/api/cms/event-tasks/${taskId}`, {
    method: "DELETE",
  });
}

export type { EventTaskItem, SubTaskItem };
