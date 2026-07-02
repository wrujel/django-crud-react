import { motion } from "motion/react";
import {
  CircleCheckBig,
  Circle,
  Gauge,
  ListTodo,
  TriangleAlert,
} from "lucide-react";

import { cn } from "../lib/cn";
import { AnimatedNumber } from "./AnimatedNumber";
import { Skeleton } from "./ui/Skeleton";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 26 },
  },
};

function StatTile({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
  progress,
  className,
}) {
  return (
    <motion.div
      variants={item}
      className={cn(
        "relative flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface/70 p-4",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          tone,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl leading-none font-bold text-fg">
          <AnimatedNumber value={value} />
          {suffix}
        </div>
        <div className="mt-1 text-xs font-medium text-muted">{label}</div>
      </div>
      {progress != null && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      )}
    </motion.div>
  );
}

export function StatsDashboard({ stats, className }) {
  if (!stats) {
    return (
      <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-5", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-2xl" />
        ))}
        <Skeleton className="col-span-2 h-[72px] rounded-2xl lg:col-span-1" />
      </div>
    );
  }

  const rate = stats.completion_rate ?? 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn("grid grid-cols-2 gap-3 lg:grid-cols-5", className)}
    >
      <StatTile
        icon={ListTodo}
        label="Total"
        value={stats.total}
        tone="bg-accent/10 text-accent"
      />
      <StatTile
        icon={Circle}
        label="Active"
        value={stats.active}
        tone="bg-prio-low/10 text-prio-low"
      />
      <StatTile
        icon={CircleCheckBig}
        label="Completed"
        value={stats.completed}
        tone="bg-success/10 text-success"
      />
      <StatTile
        icon={TriangleAlert}
        label="Overdue"
        value={stats.overdue}
        tone="bg-danger/10 text-danger"
      />
      <StatTile
        icon={Gauge}
        label="Completion"
        value={rate}
        suffix="%"
        progress={rate}
        tone="bg-accent/10 text-accent"
        className="col-span-2 lg:col-span-1"
      />
    </motion.div>
  );
}
