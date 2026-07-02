import { AnimatePresence, motion } from "motion/react";

import { Button } from "./ui/Button";
import { TaskCard } from "./TaskCard";
import { TaskCardSkeleton } from "./TaskCardSkeleton";

const GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3";

export function TaskGrid({
  tasks,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onToggle,
  onEdit,
  onDelete,
  emptyState,
}) {
  if (isLoading && tasks.length === 0) {
    return (
      <motion.div
        className={GRID}
        aria-busy="true"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <TaskCardSkeleton />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (tasks.length === 0) {
    return emptyState;
  }

  return (
    <>
      <motion.div layout className={GRID}>
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              index={i}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="secondary"
            onClick={onLoadMore}
            loading={isLoadingMore}
          >
            Load more
          </Button>
        </div>
      )}
    </>
  );
}
