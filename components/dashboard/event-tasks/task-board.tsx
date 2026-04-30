"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import type { EventTaskItem, TaskStatus } from "@/lib/types";
import { updateTaskStatus } from "@/lib/api";
import toast from "react-hot-toast";

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  {
    status: "todo",
    label: "To Do",
    color: "border-t-slate-400",
  },
  {
    status: "in_progress",
    label: "In Progress",
    color: "border-t-blue-500",
  },
  {
    status: "review",
    label: "Review",
    color: "border-t-yellow-500",
  },
  {
    status: "done",
    label: "Done",
    color: "border-t-green-500",
  },
];

interface TaskBoardProps {
  token: string;
  tasks: EventTaskItem[];
  onEdit: (task: EventTaskItem) => void;
  onDelete: (taskId: string) => void;
  onNewTask: (defaultStatus?: TaskStatus) => void;
  onTasksChange: (tasks: EventTaskItem[]) => void;
}

export function TaskBoard({
  token,
  tasks,
  onEdit,
  onDelete,
  onNewTask,
  onTasksChange,
}: TaskBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  function getColumnTasks(colStatus: TaskStatus) {
    return tasks.filter((t) => t.status === colStatus);
  }

  function handleDragStart(taskId: string) {
    setDraggingId(taskId);
  }

  function handleDragOver(e: React.DragEvent, colStatus: TaskStatus) {
    e.preventDefault();
    setDragOverCol(colStatus);
  }

  function handleDragLeave() {
    setDragOverCol(null);
  }

  async function handleDrop(colStatus: TaskStatus) {
    setDragOverCol(null);
    if (!draggingId) return;

    const task = tasks.find((t) => t.id === draggingId);
    if (!task || task.status === colStatus) {
      setDraggingId(null);
      return;
    }

    // Optimistic update
    const updated = tasks.map((t) =>
      t.id === draggingId ? { ...t, status: colStatus } : t,
    );
    onTasksChange(updated);
    setDraggingId(null);

    try {
      await updateTaskStatus(token, draggingId, colStatus);
    } catch {
      toast.error("Failed to move task");
      onTasksChange(tasks); // rollback
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[60vh]">
      {COLUMNS.map((col) => {
        const colTasks = getColumnTasks(col.status);
        const isOver = dragOverCol === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(col.status)}
            className={`flex flex-col rounded-xl border-t-4 border border-border bg-muted/30 p-3 transition-colors ${col.color} ${isOver ? "bg-primary/5 border-primary/30" : ""}`}
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onNewTask(col.status)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title={`Add task to ${col.label}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Task cards */}
            <div className="flex flex-col gap-2 flex-1">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className={`cursor-grab active:cursor-grabbing transition-opacity ${draggingId === task.id ? "opacity-40" : "opacity-100"}`}
                >
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))}

              {/* Empty drop target */}
              {colTasks.length === 0 && (
                <div
                  className={`flex-1 rounded-lg border-2 border-dashed flex items-center justify-center text-xs text-muted-foreground min-h-20 ${isOver ? "border-primary/50 bg-primary/5" : "border-border"}`}
                >
                  {isOver ? "Drop here" : "No tasks"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
