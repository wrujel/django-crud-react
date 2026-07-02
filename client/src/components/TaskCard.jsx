import { motion } from "motion/react";
import { Trash2 } from "lucide-react";

import { PRIORITY_STYLES } from "../constants/tasks";
import { cn } from "../lib/cn";
import { Checkbox } from "./ui/Checkbox";
import { IconButton } from "./ui/IconButton";
import { DueDateBadge } from "./DueDateBadge";

export function TaskCard({ task, index = 0, onToggle, onEdit, onDelete }) {
  // Cascade cards in on load; cap so large lists don't drag.
  const enterDelay = Math.min(index * 0.045, 0.25);
  const priority = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES[2];

  return (
    // The outer element owns layout + entrance/exit (Framer transforms). The
    // hover lift lives on the inner card as a CSS transform, so it can't fight
    // the layout projection (which caused the jitter).
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{
        layout: { type: "spring", stiffness: 320, damping: 30 },
        opacity: { duration: 0.3, delay: enterDelay },
        scale: {
          type: "spring",
          stiffness: 300,
          damping: 24,
          delay: enterDelay,
        },
      }}
      onClick={() => onEdit(task)}
      className="group cursor-pointer"
    >
      <div
        className={cn(
          "relative flex items-start gap-2.5 overflow-hidden rounded-2xl border bg-surface/80 py-3.5 pr-3 pl-4",
          "transition-[transform,translate,border-color,box-shadow] duration-200 ease-out group-hover:-translate-y-[3px]",
          task.completed
            ? "border-line-soft opacity-70"
            : "border-line group-hover:border-line-strong group-hover:shadow-soft",
        )}
      >
        {/* Priority as a compact color-coded left edge — no label chip. */}
        <span
          aria-hidden="true"
          className={cn("absolute inset-y-0 left-0 w-1", priority.bar)}
        />
        <span className="sr-only">{priority.label} priority</span>

        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={task.completed}
            onChange={() => onToggle(task)}
            label={task.completed ? "Mark as active" : "Mark as complete"}
            className="size-4"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "leading-snug font-semibold break-words",
              task.completed
                ? "text-muted line-through decoration-faint"
                : "text-fg",
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={cn(
                "mt-1 line-clamp-2 text-sm",
                task.completed ? "text-faint" : "text-muted",
              )}
            >
              {task.description}
            </p>
          )}
          {task.due_date && (
            <div className="mt-2">
              <DueDateBadge value={task.due_date} completed={task.completed} />
            </div>
          )}
        </div>

        <div
          className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            label="Delete task"
            tone="danger"
            onClick={() => onDelete(task)}
          >
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>
    </motion.article>
  );
}
