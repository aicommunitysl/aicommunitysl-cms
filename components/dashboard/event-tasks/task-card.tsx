"use client";

import { CalendarDays, CheckSquare, Pencil, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EventTaskItem } from "@/lib/types";

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function priorityDot(priority: string) {
  const colors: Record<string, string> = {
    low: "bg-blue-400",
    medium: "bg-yellow-400",
    high: "bg-orange-400",
    urgent: "bg-red-500",
  };
  return colors[priority] ?? "bg-muted";
}

interface TaskCardProps {
  task: EventTaskItem;
  onEdit: (task: EventTaskItem) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const doneSubs = task.subtasks.filter((s) => s.is_done).length;
  const totalSubs = task.subtasks.length;

  const isOverdue =
    task.due_date &&
    task.status !== "done" &&
    new Date(task.due_date) < new Date();

  return (
    <div className="group rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow space-y-3">
      {/* Top row: priority dot + labels + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full shrink-0 ${priorityDot(task.priority)}`}
          />
          {task.labels.map((l) => (
            <span
              key={l}
              className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground"
            >
              {l}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium leading-snug">{task.title}</p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Subtask progress */}
      {totalSubs > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" />
            <span>
              {doneSubs}/{totalSubs} subtasks
            </span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${totalSubs ? (doneSubs / totalSubs) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer: assignees + due date + priority badge */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {task.assignees.slice(0, 3).map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground max-w-20 truncate"
              title={a}
            >
              <User className="h-2.5 w-2.5 shrink-0" />
              {a}
            </span>
          ))}
          {task.assignees.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{task.assignees.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {task.due_date && (
            <span
              className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
            >
              <CalendarDays className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[task.priority] ?? ""}`}
          >
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  );
}
