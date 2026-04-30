"use client";

import { useState, useMemo } from "react";
import { KanbanSquare, LayoutList, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskBoard } from "./task-board";
import { TaskTable } from "./task-table";
import { TaskForm } from "./task-form";
import type { EventItem, EventTaskItem, TaskStatus, UserItem } from "@/lib/types";
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
  users: UserItem[];
  token: string;
}

export function EventTasksManager({
  initialTasks,
  events,
  users,
  token,
}: EventTasksManagerProps) {
  const [view, setView] = useState<View>("kanban");
  const [tasks, setTasks] = useState<EventTaskItem[]>(initialTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<EventTaskItem | null>(null);
  const [defaultFormStatus, setDefaultFormStatus] =
    useState<TaskStatus>("todo");

  // Filters
  const [selectedEventId, setSelectedEventId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedEventId && t.event_id !== selectedEventId) return false;
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
  }, [tasks, selectedEventId, statusFilter, priorityFilter, searchQuery]);

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
      // rollback not possible here without the old list; user can refresh
    }
  }

  // Stats summary
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    });
    return counts;
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "todo", label: "To Do", color: "text-slate-500" },
          { key: "in_progress", label: "In Progress", color: "text-blue-500" },
          { key: "review", label: "Review", color: "text-yellow-500" },
          { key: "done", label: "Done", color: "text-green-500" },
        ].map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-border bg-card px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
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

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks…"
              className="pl-8 w-44 text-sm h-9"
            />
          </div>

          {/* Event filter */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          {/* Status filter */}
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

          {/* Priority filter */}
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

          {/* Clear filters */}
          {(selectedEventId || statusFilter || priorityFilter || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedEventId("");
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
          {/* View toggle */}
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

      {/* Content */}
      {view === "kanban" ? (
        <TaskBoard
          token={token}
          tasks={filteredTasks}
          onEdit={openEditTask}
          onDelete={handleDelete}
          onNewTask={openNewTask}
          onTasksChange={setTasks}
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
          users={users}
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
