import { motion } from "motion/react";
import { LayoutGrid, List } from "lucide-react";

import { cn } from "../../lib/cn";

const VIEWS = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
];

/** Icon toggle between grid and list layouts, with a sliding active pill. */
export function ViewToggle({ value, onChange, className }) {
  return (
    <div
      role="group"
      aria-label="View"
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-xl bg-surface-2 p-1 ring-1 ring-line",
        className,
      )}
    >
      {VIEWS.map((view) => {
        const active = view.value === value;
        const Icon = view.icon;
        return (
          <button
            key={view.value}
            type="button"
            aria-label={view.label}
            aria-pressed={active}
            onClick={() => onChange(view.value)}
            className={cn(
              "relative grid size-8 place-items-center rounded-lg transition-colors duration-200",
              active ? "text-white" : "text-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId="view-toggle-indicator"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-accent shadow-sm"
              />
            )}
            <Icon className="relative z-10 size-4" />
          </button>
        );
      })}
    </div>
  );
}
