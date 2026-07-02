import { Reorder, useDragControls } from "motion/react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";

import { cn } from "../lib/cn";
import { IconButton } from "./ui/IconButton";
import { TaskRowInner } from "./TaskRowInner";

/** Reorderable list row: drag by the grip handle, or use the up/down arrows. */
export function DraggableTaskRow({
  task,
  isFirst,
  isLast,
  onToggle,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onCommit,
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onCommit}
      whileDrag={{ scale: 1.02 }}
      onClick={() => onEdit(task)}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 bg-surface py-3 pr-3 pl-4 transition-colors duration-200",
        task.completed ? "opacity-65" : "hover:bg-surface-2",
      )}
    >
      <TaskRowInner
        task={task}
        onToggle={onToggle}
        onDelete={onDelete}
        leading={
          <button
            type="button"
            aria-label="Drag to reorder"
            onPointerDown={(e) => {
              e.stopPropagation();
              controls.start(e);
            }}
            onClick={(e) => e.stopPropagation()}
            className="grid size-6 shrink-0 cursor-grab touch-none place-items-center rounded text-faint transition-colors hover:text-muted active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        }
        trailing={
          <>
            <IconButton
              label="Move up"
              onClick={() => onMoveUp(task)}
              disabled={isFirst}
              className="disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowUp className="size-4" />
            </IconButton>
            <IconButton
              label="Move down"
              onClick={() => onMoveDown(task)}
              disabled={isLast}
              className="disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowDown className="size-4" />
            </IconButton>
          </>
        }
      />
    </Reorder.Item>
  );
}
