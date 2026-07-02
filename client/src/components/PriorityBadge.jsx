import { PRIORITY_STYLES } from "../constants/tasks";
import { cn } from "../lib/cn";
import { Badge } from "./ui/Badge";

export function PriorityBadge({ priority, className }) {
  const style = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES[2];
  return (
    <Badge className={cn("gap-1.5 rounded-md", style.chip, className)}>
      <span className={cn("size-2 rounded-full", style.dot)} />
      {style.label}
    </Badge>
  );
}
