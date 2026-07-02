import { motion } from "motion/react";

import { cn } from "../lib/cn";
import { TaskRowInner } from "./TaskRowInner";

/** Plain (non-reorderable) list row. */
export function TaskRow({ task, index = 0, onToggle, onEdit, onDelete }) {
  const enterDelay = Math.min(index * 0.03, 0.2);

  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.25, delay: enterDelay },
      }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      onClick={() => onEdit(task)}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 py-3 pr-3 pl-4 transition-colors duration-200",
        task.completed ? "opacity-65" : "hover:bg-surface-2/40",
      )}
    >
      <TaskRowInner task={task} onToggle={onToggle} onDelete={onDelete} />
    </motion.li>
  );
}
