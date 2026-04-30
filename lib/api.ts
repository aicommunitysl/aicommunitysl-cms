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

export async function createEventTask(
  token: string,
  payload: Omit<EventTaskItem, "id" | "created_at" | "updated_at">,
): Promise<EventTaskItem> {
  return apiRequest<EventTaskItem>(EVENT_TASKS_PATH, {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateEventTask(
  token: string,
  taskId: string,
  payload: Partial<Omit<EventTaskItem, "id" | "created_at" | "updated_at">>,
): Promise<EventTaskItem> {
  return apiRequest<EventTaskItem>(`${EVENT_TASKS_PATH}/${taskId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function updateTaskStatus(
  token: string,
  taskId: string,
  newStatus: string,
): Promise<EventTaskItem> {
  return apiRequest<EventTaskItem>(`${EVENT_TASKS_PATH}/${taskId}/status`, {
    method: "PATCH",
    token,
    body: { status: newStatus },
  });
}

export async function deleteEventTask(
  token: string,
  taskId: string,
): Promise<void> {
  return apiRequest<void>(`${EVENT_TASKS_PATH}/${taskId}`, {
    method: "DELETE",
    token,
  });
}

export type { EventTaskItem, SubTaskItem };
