"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  EventItem,
  EventTaskItem,
  SubTaskItem,
  UserItem,
} from "@/lib/types";
import { createEventTask, updateEventTask } from "@/lib/api";

interface TaskFormProps {
  token: string;
  events: EventItem[];
  users: UserItem[];
  task?: EventTaskItem | null;
  defaultEventId?: string;
  onSave: (task: EventTaskItem) => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TaskForm({
  token,
  events,
  users,
  task,
  defaultEventId,
  onSave,
  onCancel,
}: TaskFormProps) {
  const isEditing = !!task;

  const [eventId, setEventId] = useState(
    task?.event_id ?? defaultEventId ?? events[0]?.id ?? "",
  );
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [taskStatus, setTaskStatus] = useState(task?.status ?? "todo");
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [assignees, setAssignees] = useState<string[]>(task?.assignees ?? []);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const [labelsRaw, setLabelsRaw] = useState((task?.labels ?? []).join(", "));
  const [dueDate, setDueDate] = useState(
    task?.due_date ? task.due_date.slice(0, 10) : "",
  );
  const [subtasks, setSubtasks] = useState<SubTaskItem[]>(task?.subtasks ?? []);
  const [newSubtask, setNewSubtask] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!eventId && events.length > 0) setEventId(events[0].id);
  }, [events, eventId]);

  function addSubtask() {
    const trimmed = newSubtask.trim();
    if (!trimmed) return;
    setSubtasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: trimmed, is_done: false },
    ]);
    setNewSubtask("");
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  function toggleSubtask(id: string) {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_done: !s.is_done } : s)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (!eventId) {
      toast.error("Please select an event");
      return;
    }

    const labels = labelsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      event_id: eventId,
      title: title.trim(),
      description: description.trim() || undefined,
      status: taskStatus,
      priority,
      assignees,
      labels,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      subtasks,
    };

    setSaving(true);
    try {
      let saved: EventTaskItem;
      if (isEditing && task) {
        saved = await updateEventTask(token, task.id, payload);
        toast.success("Task updated successfully!");
      } else {
        saved = await createEventTask(
          token,
          payload as Parameters<typeof createEventTask>[1],
        );
        toast.success("Task created successfully!");
      }
      onSave(saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto bg-card border-l border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">
            {isEditing ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 p-6"
        >
          {/* Event selector */}
          <div className="space-y-1.5">
            <label htmlFor="event" className="text-sm font-medium">
              Event
            </label>
            <select
              id="event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the task..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                value={taskStatus}
                onChange={(e) =>
                  setTaskStatus(e.target.value as EventTaskItem["status"])
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as EventTaskItem["priority"])
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-1.5" ref={assigneeRef}>
            <label className="text-sm font-medium">Assignees</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAssigneeDropdownOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <span className="truncate text-left">
                  {assignees.length === 0
                    ? "Select assignees…"
                    : assignees.join(", ")}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
              </button>

              {assigneeDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                  {users.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      No users found
                    </p>
                  ) : (
                    <ul className="max-h-48 overflow-y-auto py-1">
                      {users.map((u) => {
                        const selected = assignees.includes(u.email);
                        return (
                          <li key={u.id}>
                            <button
                              type="button"
                              onClick={() =>
                                setAssignees((prev) =>
                                  selected
                                    ? prev.filter((a) => a !== u.email)
                                    : [...prev, u.email],
                                )
                              }
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                            >
                              <span
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                  selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input"
                                }`}
                              >
                                {selected && <Check className="h-2.5 w-2.5" />}
                              </span>
                              <span className="truncate">{u.email}</span>
                              <span className="ml-auto text-xs text-muted-foreground capitalize">
                                {u.role}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="border-t border-border px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setAssigneeDropdownOpen(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label htmlFor="due_date" className="text-sm font-medium">
              Due Date
            </label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Labels */}
          <div className="space-y-1.5">
            <label htmlFor="labels" className="text-sm font-medium">
              Labels
            </label>
            <Input
              id="labels"
              value={labelsRaw}
              onChange={(e) => setLabelsRaw(e.target.value)}
              placeholder="design, content, logistics (comma separated)"
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subtasks</label>
            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={st.is_done}
                    onChange={() => toggleSubtask(st.id)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span
                    className={`flex-1 text-sm ${st.is_done ? "line-through text-muted-foreground" : ""}`}
                  >
                    {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(st.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add subtask and press Enter"
                className="text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addSubtask}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Saving…" : isEditing ? "Update Task" : "Create Task"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
