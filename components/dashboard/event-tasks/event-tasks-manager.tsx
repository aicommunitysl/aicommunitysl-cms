"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  KanbanSquare,
  LayoutList,
  Plus,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskBoard } from "./task-board";
import { TaskTable } from "./task-table";
import { TaskForm } from "./task-form";
import type {
  EventItem,
  EventTaskItem,
  TaskStatus,
  TeamMemberItem,
} from "@/lib/types";
import { deleteEventTask } from "@/lib/api";

type View = "kanban" | "table";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface EventTasksManagerProps {
  initialTasks: EventTaskItem[];
  events: EventItem[];
  teamMembers: TeamMemberItem[];
  token: string;
}

export function EventTasksManager({
  initialTasks,
  events,
  teamMembers,
  token,
}: EventTasksManagerProps) {
  const [view, setView] = useState<View>("kanban");
  const [tasks, setTasks] = useState<EventTaskItem[]>(initialTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<EventTaskItem | null>(null);
  const [defaultFormStatus, setDefaultFormStatus] =
    useState<TaskStatus>("todo");

  // Primary grouping: event tab
  const [selectedEventId, setSelectedEventId] = useState("");
  // Secondary filters (within the active event tab)
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Tasks scoped to the active event tab (before secondary filters)
  const eventScopedTasks = useMemo(
    () =>
      selectedEventId
        ? tasks.filter((t) => t.event_id === selectedEventId)
        : tasks,
    [tasks, selectedEventId],
  );

  // Stats scoped to active event tab (so the count cards reflect the current tab)
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };
    eventScopedTasks.forEach((t) => {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    });
    return counts;
  }, [eventScopedTasks]);

  // Task count per event for tab badges
  const countByEvent = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => {
      map[t.event_id] = (map[t.event_id] ?? 0) + 1;
    });
    return map;
  }, [tasks]);

  // Final filtered tasks shown in board/table
  const filteredTasks = useMemo(() => {
    return eventScopedTasks.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.description?.toLowerCase().includes(q) &&
          !t.assignees.some((a) => a.toLowerCase().includes(q)) &&
          !t.labels.some((l) => l.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [eventScopedTasks, statusFilter, priorityFilter, searchQuery]);

  function selectEvent(id: string) {
    setSelectedEventId(id);
    // Reset secondary filters when switching events
    setStatusFilter("");
    setPriorityFilter("");
    setSearchQuery("");
  }

  function openNewTask(status: TaskStatus = "todo") {
    setEditingTask(null);
    setDefaultFormStatus(status);
    setIsFormOpen(true);
  }

  function openEditTask(task: EventTaskItem) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  function handleSaved(saved: EventTaskItem) {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === saved.id);
      return exists
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [saved, ...prev];
    });
    setIsFormOpen(false);
    setEditingTask(null);
  }

  async function handleDelete(taskId: string) {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteEventTask(token, taskId);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }

  const activeEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="space-y-5">
      {/* ── Event tab strip ── */}
      <div className="relative">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-border">
          {/* "All Events" tab */}
          <button
            onClick={() => selectEvent("")}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none ${
              selectedEventId === ""
                ? "border-b-2 border-primary text-primary -mb-px bg-card"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            All Events
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                selectedEventId === ""
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tasks.length}
            </span>
          </button>

          {/* One tab per event */}
          {events.map((ev) => {
            const isActive = selectedEventId === ev.id;
            const count = countByEvent[ev.id] ?? 0;
            return (
              <button
                key={ev.id}
                onClick={() => selectEvent(ev.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none max-w-56 ${
                  isActive
                    ? "border-b-2 border-primary text-primary -mb-px bg-card"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="truncate">{ev.title}</span>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stats bar (scoped to active event tab) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "todo", label: "To Do", color: "text-slate-500" },
          { key: "in_progress", label: "In Progress", color: "text-blue-500" },
          { key: "review", label: "Review", color: "text-yellow-500" },
          { key: "done", label: "Done", color: "text-green-500" },
        ].map((s) => (
          <div
            key={s.key}
            className={`rounded-xl border bg-card px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors ${
              statusFilter === s.key
                ? "border-primary/50 ring-1 ring-primary/30"
                : "border-border"
            }`}
            onClick={() =>
              setStatusFilter((prev) => (prev === s.key ? "" : s.key))
            }
          >
            <p className={`text-2xl font-bold ${s.color}`}>
              {stats[s.key] ?? 0}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar: secondary filters + view toggle ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: search + status + priority */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeEvent
                  ? `Search in "${activeEvent.title}"…`
                  : "Search tasks…"
              }
              className="pl-8 w-52 text-sm h-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {PRIORITY_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {(statusFilter || priorityFilter || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setPriorityFilter("");
                setSearchQuery("");
              }}
              className="h-9 text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Right: view toggle + new task */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${view === "kanban" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
            >
              <KanbanSquare className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${view === "table" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          <Button size="sm" onClick={() => openNewTask()} className="h-9">
            <Plus className="mr-1.5 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* ── Content ── */}
      {view === "kanban" ? (
        <TaskBoard
          token={token}
          tasks={filteredTasks}
          onEdit={openEditTask}
          onDelete={handleDelete}
          onNewTask={openNewTask}
          onTasksChange={(updated) => {
            // Merge updated event-scoped tasks back into the full list
            if (selectedEventId) {
              setTasks((prev) => [
                ...prev.filter((t) => t.event_id !== selectedEventId),
                ...updated,
              ]);
            } else {
              setTasks(updated);
            }
          }}
        />
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onEdit={openEditTask}
          onDelete={handleDelete}
        />
      )}

      {/* Task form drawer */}
      {isFormOpen && (
        <TaskForm
          token={token}
          events={events}
          teamMembers={teamMembers}
          task={editingTask}
          defaultEventId={selectedEventId || undefined}
          onSave={handleSaved}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
