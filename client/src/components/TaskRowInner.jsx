import { Trash2 } from "lucide-react";

import { PRIORITY_STYLES } from "../constants/tasks";
import { cn } from "../lib/cn";
import { Checkbox } from "./ui/Checkbox";
import { IconButton } from "./ui/IconButton";
import { DueDateBadge } from "./DueDateBadge";

/**
 * Shared inner content for list rows. `leading` (e.g. a drag handle) renders
 * before the checkbox; `trailing` (e.g. move up/down) renders with the delete
 * action in the hover-revealed group.
 */
export function TaskRowInner({ task, onToggle, onDelete, leading, trailing }) {
  const priority = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES[2];

  return (
    <>
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1", priority.bar)}
      />
      <span className="sr-only">{priority.label} priority</span>

      {leading}

      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
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
            "truncate font-medium",
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
              "truncate text-sm",
              task.completed ? "text-faint" : "text-muted",
            )}
          >
            {task.description}
          </p>
        )}
      </div>

      {task.due_date && (
        <div className="hidden shrink-0 sm:block">
          <DueDateBadge value={task.due_date} completed={task.completed} />
        </div>
      )}

      <div
        className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {trailing}
        <IconButton
          label="Delete task"
          tone="danger"
          onClick={() => onDelete(task)}
        >
          <Trash2 className="size-4" />
        </IconButton>
      </div>
    </>
  );
}
