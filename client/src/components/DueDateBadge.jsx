import { CalendarClock } from "lucide-react";

import { formatDueDate } from "../lib/format";
import { cn } from "../lib/cn";

export function DueDateBadge({ value, completed }) {
  const due = formatDueDate(value);
  if (!due) return null;

  const danger = due.isOverdue && !completed;
  const soon = due.isSoon && !completed;

  return (
    <span
      title={due.abs}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        danger ? "text-danger" : soon ? "text-warning" : "text-faint",
      )}
    >
      <CalendarClock className="size-3.5" />
      {due.label}
    </span>
  );
}
