import { AnimatePresence, Reorder, motion } from "motion/react";

import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import { TaskRow } from "./TaskRow";
import { DraggableTaskRow } from "./DraggableTaskRow";

const CONTAINER =
  "divide-y divide-line-soft overflow-hidden rounded-2xl border border-line bg-surface/50";

function LoadMore({ hasMore, isLoadingMore, onLoadMore }) {
  if (!hasMore) return null;
  return (
    <div className="mt-6 flex justify-center">
      <Button variant="secondary" onClick={onLoadMore} loading={isLoadingMore}>
        Load more
      </Button>
    </div>
  );
}

export function TaskList({
  tasks,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onToggle,
  onEdit,
  onDelete,
  emptyState,
  reorderable,
  onReorder,
  onReorderCommit,
  onMoveUp,
  onMoveDown,
}) {
  if (isLoading && tasks.length === 0) {
    return (
      <div className={CONTAINER} aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="size-5 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="hidden h-4 w-12 sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return emptyState;
  }

  if (reorderable) {
    return (
      <>
        <Reorder.Group
          axis="y"
          values={tasks}
          onReorder={onReorder}
          className={CONTAINER}
        >
          {tasks.map((task, i) => (
            <DraggableTaskRow
              key={task.id}
              task={task}
              isFirst={i === 0}
              isLast={i === tasks.length - 1}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onCommit={onReorderCommit}
            />
          ))}
        </Reorder.Group>
        <LoadMore
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
        />
      </>
    );
  }

  return (
    <>
      <motion.ul layout className={CONTAINER}>
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => (
            <TaskRow
              key={task.id}
              index={i}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </motion.ul>
      <LoadMore
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
      />
    </>
  );
}
