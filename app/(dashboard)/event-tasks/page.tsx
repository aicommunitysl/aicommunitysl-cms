import { EventTasksManager } from "@/components/dashboard/event-tasks/event-tasks-manager";
import { apiRequest, fetchEventTasks } from "@/lib/api";
import { requireUser, getAuthToken } from "@/lib/session";
import type { EventItem } from "@/lib/types";

interface EventsListResponse {
  events: EventItem[];
  total: number;
}

export default async function EventTasksPage() {
  await requireUser();
  const token = (await getAuthToken()) ?? "";

  const [tasksData, eventsData] = await Promise.all([
    fetchEventTasks(token, {}).catch(() => ({ tasks: [], total: 0 })),
    apiRequest<EventsListResponse>("/api/v1/events", { token }).catch(
      () => ({ events: [], total: 0 }),
    ),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Event Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage tasks across all events — plan, track progress, and collaborate
          with your team.
        </p>
      </div>

      <EventTasksManager
        initialTasks={tasksData.tasks}
        events={eventsData.events}
        token={token}
      />
    </div>
  );
}
