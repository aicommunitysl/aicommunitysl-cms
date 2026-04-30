"use client";

import { CalendarDays, Pencil, Trash2, User } from "lucide-react";
import type { EventTaskItem } from "@/lib/types";

const STATUS_BADGE: Record<string, string> = {
  todo: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  review:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const STATUS_LABEL: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

interface TaskTableProps {
  tasks: EventTaskItem[];
  onEdit: (task: EventTaskItem) => void;
  onDelete: (taskId: string) => void;
}

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
        <p className="text-sm text-muted-foreground">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Task
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Event
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Priority
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Assignees
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Due Date
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Subtasks
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => {
            const doneSubs = task.subtasks.filter((s) => s.is_done).length;
            const totalSubs = task.subtasks.length;
            const isOverdue =
              task.due_date &&
              task.status !== "done" &&
              new Date(task.due_date) < new Date();

            return (
              <tr
                key={task.id}
                className="hover:bg-muted/30 transition-colors"
              >
                {/* Task title + labels */}
                <td className="max-w-xs px-4 py-3">
                  <p className="font-medium truncate">{task.title}</p>
                  {task.labels.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {task.labels.map((l) => (
                        <span
                          key={l}
                          className="rounded px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                {/* Event */}
                <td className="max-w-35 truncate px-4 py-3 text-muted-foreground text-xs">
                  {task.event_title ?? task.event_id}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[task.status] ?? ""}`}
                  >
                    {STATUS_LABEL[task.status] ?? task.status}
                  </span>
                </td>

                {/* Priority */}
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${PRIORITY_BADGE[task.priority] ?? ""}`}
                  >
                    {task.priority}
                  </span>
                </td>

                {/* Assignees */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {task.assignees.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                        title={a}
                      >
                        <User className="h-2.5 w-2.5" />
                        {a}
                      </span>
                    ))}
                    {task.assignees.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{task.assignees.length - 3}
                      </span>
                    )}
                    {task.assignees.length === 0 && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </td>

                {/* Due date */}
                <td className="px-4 py-3">
                  {task.due_date ? (
                    <span
                      className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(task.due_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>

                {/* Subtasks */}
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {totalSubs > 0 ? (
                    <span>
                      {doneSubs}/{totalSubs}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(task)}
                      className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
